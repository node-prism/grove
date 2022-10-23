import logger, { LogLevel } from "../../shared/logger";
export default async function loadModule(filename, defaultMiddleware = {}) {
    logger({ level: LogLevel.DEBUG, scope: "loader" }, "import", filename);
    return await import(filename);
}
//# sourceMappingURL=main.js.map