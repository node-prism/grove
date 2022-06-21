import EventEmitter from "node:events";
import { IncomingMessage } from "node:http";
import { ServerOptions, WebSocket, WebSocketServer } from "ws";

export class WSContext {
  wss: WebSocketTokenServer;
  connection: Connection;
  payload: any;

  constructor(wss: WebSocketTokenServer, connection: Connection, payload: any) {
    this.wss = wss;
    this.connection = connection;
    this.payload = payload;
  }
}

export interface Command {
  id?: number;
  command: string;
  payload: any;
}

class Latency {
  checking = false;
  start = 0;
  end = 0;
  ms = 0;
  interval: NodeJS.Timeout = null;

  request() {
    // if (this.checking) {}
    this.start = Date.now();
    this.checking = true;
  }

  response() {
    this.end = Date.now();
    this.ms = this.end - this.start;
    this.checking = false;
  }
}

class Ping {
  interval: NodeJS.Timeout = null;
}

function bufferToCommand(buf: Buffer): Command {
  const decoded = new TextDecoder("utf-8").decode(buf);
  if (!decoded) return { id: 0, command: "", payload: {} };
  try {
    const parsed = JSON.parse(decoded);
    return { id: parsed.id, command: parsed.command, payload: parsed.payload };
  } catch (e) {
    return { id: 0, command: "", payload: {} };
  }
}

export class Connection extends EventEmitter {
  id: string;
  socket: WebSocket;
  remoteAddress: string;
  request: IncomingMessage;
  latency: Latency;
  ping: Ping;
  alive = true;

  constructor(socket: WebSocket, request: IncomingMessage) {
    super();

    this.socket = socket;
    this.request = request;

    this.id = request.headers["sec-websocket-key"];
    this.remoteAddress = request.socket.remoteAddress;

    this.applyListeners();
    this.startIntervals();
  }

  startIntervals() {
    this.latency = new Latency();
    this.ping = new Ping();

    this.latency.interval = setInterval(() => {
      if (this.alive) {
        if (typeof this.latency.ms === "number") {
          this.send({ command: "prism:latency", payload: this.latency.ms });
        }
        this.latency.request();
        this.send({ command: "prism:latency:request", payload: {} });
      }
    }, 5000);

    this.ping.interval = setInterval(() => {
      if (!this.alive) {
        this.emit("close");
      }
      this.alive = false;
      this.send({ command: "prism:ping", payload: {} });
    }, 30000);
  }

  stopIntervals() {
    clearInterval(this.ping.interval);
    clearInterval(this.latency.interval);
  }

  send(cmd: Command) {
    this.socket.send(JSON.stringify(cmd));
  }

  applyListeners() {
    this.socket.on("close", () => {
      this.emit("close");
    });

    this.socket.on("message", (data: Buffer) => {
      const command = bufferToCommand(data);
      if (command.command === "prism:latency:response") {
        this.latency.response();
        return;
      } else if (command.command === "prism:pong") {
        this.alive = true;
        return;
      }
      this.emit("message", data);
    });
  }
}

export type SocketMiddleware = (c: WSContext) => Promise<any>;

interface SocketServerOptions extends ServerOptions {
  // interface ServerOptions {
  //     host?: string | undefined;
  //     port?: number | undefined;
  //     backlog?: number | undefined;
  //     server?: HTTPServer | HTTPSServer | undefined;
  //     verifyClient?: VerifyClientCallbackAsync | VerifyClientCallbackSync | undefined;
  //     handleProtocols?: (protocols: Set<string>, request: IncomingMessage) => string | false;
  //     path?: string | undefined;
  //     noServer?: boolean | undefined;
  //     clientTracking?: boolean | undefined;
  //     perMessageDeflate?: boolean | PerMessageDeflateOptions | undefined;
  //     maxPayload?: number | undefined;
  //     skipUTF8Validation?: boolean | undefined;
  // }
}

function getServerOptions(opts: SocketServerOptions): SocketServerOptions {
  opts.noServer = true;
  return opts;
}

export class WebSocketTokenServer extends WebSocketServer {
  connections: { [connectionId: string]: Connection } = {};
  commands: { [commandName: string]: Function } = {};
  globalMiddlewares: SocketMiddleware[] = [];
  middlewares: { [key: string]: SocketMiddleware[] } = {};
  remoteAddressToConnections: { [address: string]: Connection[] } = {};

  constructor(opts: SocketServerOptions) {
    super(getServerOptions(opts));
    this.applyListeners();
  }

  destroyConnection(c: Connection) {
    c.stopIntervals();
    this.remoteAddressToConnections[c.remoteAddress] =
      this.remoteAddressToConnections[c.remoteAddress].filter(
        (cn) => cn.id !== c.id
      );
    delete this.connections[c.id];

    if (!this.remoteAddressToConnections[c.remoteAddress].length) {
      delete this.remoteAddressToConnections[c.remoteAddress];
    }
  }

  applyListeners() {
    this.on("connection", (socket: WebSocket, req: IncomingMessage) => {
      const connection = new Connection(socket, req);
      this.connections[connection.id] = connection;
      this.remoteAddressToConnections[req.socket.remoteAddress] = [
        connection,
      ].concat(this.remoteAddressToConnections[req.socket.remoteAddress] || []);

      connection.once("close", () => {
        this.destroyConnection(connection);
        this.emit("close", connection);
        // TODO: If a ping timeout emitted 'close' and we
        // ended up here, then the socket may still be open.
        // Maybe we should try and close it?
      });

      connection.on("message", (buf: Buffer) => {
        try {
          const { id, command, payload } = bufferToCommand(buf);
          this.runCommand(id, command, payload, connection);
        } catch (e) {
          this.emit("error", e);
        }
      });
    });
  }

  broadcast(command: string, payload: any) {
    const cmd = JSON.stringify({ command, payload });
    Object.values(this.connections).forEach((c) => {
      c.socket.send(cmd);
    });
  }

  /**
   * Given a Connection, broadcasts only to all other Connections that share
   * the same connection.remoteAddress.
   *
   * Use cases: auth changes, push notifications.
   */
  broadcastRemoteAddress(c: Connection, command: string, payload: any) {
    const cmd = JSON.stringify({ command, payload });
    this.remoteAddressToConnections[c.remoteAddress].forEach((cn) => {
      cn.socket.send(cmd);
    });
  }

  registerCommand(command: string, callback: Function, ...middlewares: SocketMiddleware[]) {
    this.commands[command] = callback;
    this.addMiddlewareToCommand(command, ...middlewares);
  }

  addMiddlewareToCommand(command: string, ...middlewares: SocketMiddleware[]) {
    if (middlewares.length) {
      this.middlewares[command] = this.middlewares[command] || [];
      this.middlewares[command] = middlewares.concat(this.middlewares[command]);
    }
  }

  async runCommand(id: number, command: string, payload: any, connection: Connection) {
    const c = new WSContext(this, connection, payload);

    try {
      if (!this.commands[command]) {
        throw new Error(`Command [${command}] not found.`);
      }
      if (this.globalMiddlewares.length) {
        for (const mw of this.globalMiddlewares) {
          await mw(c);
        }
      }
      if (this.middlewares[command] && this.middlewares[command].length) {
        for (const mw of this.middlewares[command]) {
          await mw(c);
        }
      }
      const result = await this.commands[command](c);
      connection.send({ id, command, payload: result });
    } catch (e) {
      const payload = { error: e.message ?? "Unknown error." };
      connection.send({ id, command, payload });
    }
  }
}
