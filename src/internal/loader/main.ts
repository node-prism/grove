import logger, { LogLevel } from "../../shared/logger";


export default async function loadModule<ModuleExports>(filename: string, defaultMiddleware = {}): Promise<Readonly<ModuleExports>> {
  logger({ level: LogLevel.DEBUG, scope: "loader" }, "import", filename);

  return await import(filename);
}
