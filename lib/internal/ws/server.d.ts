/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from "node:events";
import { IncomingMessage } from "node:http";
import { ServerOptions, WebSocket, WebSocketServer } from "ws";
export declare class WSContext {
    wss: WebSocketTokenServer;
    connection: Connection;
    payload: any;
    constructor(wss: WebSocketTokenServer, connection: Connection, payload: any);
}
export interface Command {
    id?: number;
    command: string;
    payload: any;
}
declare class Latency {
    start: number;
    end: number;
    ms: number;
    interval: NodeJS.Timeout;
    request(): void;
    response(): void;
}
declare class Ping {
    interval: NodeJS.Timeout;
}
export declare class Connection extends EventEmitter {
    id: string;
    socket: WebSocket;
    remoteAddress: string;
    request: IncomingMessage;
    latency: Latency;
    ping: Ping;
    alive: boolean;
    constructor(socket: WebSocket, request: IncomingMessage);
    startIntervals(): void;
    stopIntervals(): void;
    send(cmd: Command): void;
    applyListeners(): void;
}
export declare type SocketMiddleware = (c: WSContext) => Promise<any>;
export declare class WebSocketTokenServer extends WebSocketServer {
    connections: {
        [connectionId: string]: Connection;
    };
    commands: {
        [commandName: string]: Function;
    };
    globalMiddlewares: SocketMiddleware[];
    middlewares: {
        [key: string]: SocketMiddleware[];
    };
    remoteAddressToConnections: {
        [address: string]: Connection[];
    };
    rooms: {
        [roomName: string]: Set<string>;
    };
    constructor(opts: ServerOptions);
    destroyConnection(c: Connection): void;
    applyListeners(): void;
    broadcast(command: string, payload: any, connections?: Connection[]): void;
    /**
     * Given a Connection, broadcasts only to all other Connections that share
     * the same connection.remoteAddress.
     *
     * Use cases: auth changes, push notifications.
     */
    broadcastRemoteAddress(c: Connection, command: string, payload: any): void;
    broadcastRoom(roomName: string, command: string, payload: any): void;
    registerCommand(command: string, callback: SocketMiddleware, ...middlewares: SocketMiddleware[]): void;
    addMiddlewareToCommand(command: string, ...middlewares: SocketMiddleware[]): void;
    /**
     * @example
     * ```typescript
     * server.registerCommand("join:room", async (payload: { roomName: string }, connection: Connection) => {
     *   server.addToRoom(payload.roomName, connection);
     *   server.broadcastRoom(payload.roomName, "joined", { roomName: payload.roomName });
     * });
     * ```
     */
    addToRoom(roomName: string, connection: Connection): void;
    removeFromRoom(roomName: string, connection: Connection): void;
    clearRoom(roomName: string): void;
    runCommand(id: number, command: string, payload: any, connection: Connection): Promise<void>;
}
export {};
