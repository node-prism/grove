import path from "node:path";
import { existsSync } from "node:fs";
import loadModule from "../../internal/loader/main";
import { GroveApp } from "../../shared/definitions";

/**
 * Finds `errors.ts` at @param rootDir. If this file exists,
 * it is expected to export default an array of express-compatible
 * error handlers. These error handlers will be registered with core.app.
 */
export default async function createErrorHandlers(app: GroveApp): Promise<void> {
  const errorsFile = path.join(app.root, "/errors.ts");
  if (existsSync(errorsFile)) {
    const { default: handlers } = await loadModule<{ default: (err: any, req: any, res: any, next: any) => void[] }>(errorsFile);
    if (!Array.isArray(handlers)) throw new Error(`Expected errors.ts to export an array of error handlers.`);
    handlers.forEach(handler => app.app.use(handler));
  }
}
