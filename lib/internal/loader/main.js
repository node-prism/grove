import logger, { LogLevel } from "../../shared/logger";
export default async function loadModule(filename, defaultMiddleware = {}) {
    logger({ level: LogLevel.DEBUG, scope: "loader" }, "import", filename);
    const module = await import(filename);
    return module;
}
//# sourceMappingURL=main.js.map