import glob from "fast-glob";
import { IncomingMessage, STATUS_CODES } from "node:http";
import path from "node:path";
import { parse } from "node:url";
import { SocketModuleExports } from "../../shared/definitions";
import logger, { LogLevel } from "../../shared/logger";
import { WebSocket } from "ws";
import loadModule from "../../internal/loader/main";
import loadMiddleware from "../../internal/loader/middleware";
import { GroveApp } from "../../shared/definitions";
import { SocketMiddleware } from "@prsm/keepalive-ws/server";

/**
 * socket
 * ├── _middleware.ts
 * ├── authenticate.ts
 * └── jobs
 *     ├── _middleware.ts
 *     └── start-job.ts
 *
 * Given the filename `.build/socket/jobs/start-job.js`, loads:
 * - .build/socket/_middleware.js
 * - .build/socket/jobs/_middleware.js
 * - .build/socket/jobs/start-job.js `middleware` export (Function[]), if any
 */
async function getSocketMiddleware(module: SocketModuleExports, filename: string): Promise<SocketMiddleware[]> {
  const middleware = await loadMiddleware<SocketMiddleware>(path.dirname(filename), filename);
  let moduleMiddleware = module?.middleware;
  if (!moduleMiddleware) moduleMiddleware = [];
  if (!Array.isArray(moduleMiddleware)) moduleMiddleware = [moduleMiddleware];
  return middleware.concat(moduleMiddleware);
}

/**
 * The idea here as that a file at /sockets/a/b/c/d.ts
 * will be reachable at ws(s)://localhost/ and it's
 * command name will be "/a/b/c/d".
 *
 * The module's default export is the command executor.
 */
export async function createSocketHandlers(app: GroveApp) {
  const p = path.join(app.root, "/socket/");
  const filenames = await glob(`${p}**/[!_]*.{mjs,js,jsx,ts,tsx}`);

  for (const filename of filenames) {
    const module = await loadModule<SocketModuleExports>(filename);
    if (!module) throw new Error(`Failed to load module at path '${filename}'. Please ensure the file exists and is valid.`);
    if (!module.default) throw new Error(`Failed to load socket command module at path '${filename}'. The module must have a default export that can be used as a WebSocket command.`);

    let route = parentDirname(filename.replace(`${app.root}/socket/`, "/"));
    logger({ level: LogLevel.DEBUG, scope: "ws" }, "socket namespace:", route);

    route = route.replace(/\/\_(?:\w|['-]\w)+\//g, "/");

    const cmd = path.normalize(`${route}/${path.basename(filename, path.extname(filename)).normalize()}`);
    const middleware = await getSocketMiddleware(module, filename);

    app.wss.registerCommand(cmd, module.default, middleware);
    logger({ level: LogLevel.DEBUG, scope: "ws" }, `command: ${cmd} (wscat -c ws://localhost:PORT/ -x '{"command": "${cmd}", "payload": {}}')`);
  }

  app.server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url);

    if (pathname !== "/") {
      socket.write([
        `HTTP/1.0 400 ${STATUS_CODES[400]}`,
        "Connection: close",
        "Content-Type: text/html",
        `Content-Length: ${Buffer.byteLength(STATUS_CODES[400])}`,
        "",
        STATUS_CODES[400],
      ].join("\r\n"));

      socket.destroy();

      return;
    }

    app.wss.handleUpgrade(req, socket, head, (client: WebSocket, req: IncomingMessage) => {
      app.wss.emit("connection", client, req);
    });
  });
}

function parentDirname(filename: string): string {
  return path.dirname(filename).normalize();
}
