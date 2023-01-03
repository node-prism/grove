import glob from "fast-glob";
import { STATUS_CODES } from "node:http";
import path from "node:path";
import { parse } from "node:url";
import logger, { LogLevel } from "../../shared/logger";
import loadModule from "../../internal/loader/main";
import loadMiddleware from "../../internal/loader/middleware";
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
async function getSocketMiddleware(module, filename) {
    const middleware = await loadMiddleware(path.dirname(filename), filename);
    let moduleMiddleware = module?.middleware;
    if (!moduleMiddleware)
        moduleMiddleware = [];
    if (!Array.isArray(moduleMiddleware))
        moduleMiddleware = [moduleMiddleware];
    return middleware.concat(moduleMiddleware);
}
/**
 * The idea here as that a file at /sockets/a/b/c/d.ts
 * will be reachable at ws(s)://localhost/ and it's
 * command name will be "/a/b/c/d".
 *
 * The module's default export is the command executor.
 */
export async function createSocketHandlers(app) {
    const p = path.join(app.root, "/socket/");
    const filenames = await glob(`${p}**/[!_]*.{mjs,js,jsx,ts,tsx}`);
    for (const filename of filenames) {
        const module = await loadModule(filename);
        if (!module)
            throw new Error(`Failed to load module: ${filename}`);
        if (!module.default)
            throw new Error(`Socket command modules must export default.`);
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
        app.wss.handleUpgrade(req, socket, head, (client, req) => {
            app.wss.emit("connection", client, req);
        });
    });
}
function parentDirname(filename) {
    return path.dirname(filename).normalize();
}
//# sourceMappingURL=main.js.map