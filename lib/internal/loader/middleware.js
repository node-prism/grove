import path from "node:path";
import fs from "node:fs/promises";
import logger, { LogLevel } from "../../shared/logger";
/**
 * Asynchronously loads middleware modules from a given directory, and returns an array of middleware.
 * @param dirname - The directory path to search for middleware modules.
 * @param filename - The filename of the middleware module.
 * @param defaultMiddleware - An optional array of default middleware to use if no middleware is found in the specified directory.
 * @returns A promise that resolves to an array of middleware.
 * @throws An error if the middleware module does not export a default array or exports more than one object.
 */
export default async function loadMiddleware(dirname, filename, defaultMiddleware = []) {
    // Get parent middleware if not at root directory
    const parent = dirname === "/"
        ? defaultMiddleware
        : await loadMiddleware(path.dirname(dirname), filename, defaultMiddleware);
    // Find middleware module in directory
    const absolute = await findFile(path.join(dirname, "_middleware.mjs"), path.join(dirname, "_middleware.js"), path.join(dirname, "_middleware.ts"), path.join(dirname, "_middleware.tsx"));
    // Return parent middleware if no middleware module found
    if (!absolute)
        return parent;
    // Import middleware module
    const exports = await import(absolute);
    // Throw error if middleware module does not export default array or exports multiple objects
    if (!exports.default)
        throw new Error("Middleware must 'export default []'.");
    if (Object.keys(exports).length > 1 || Object.keys(exports).length < 1)
        throw new Error("Middleware should export only one object: default");
    // Log use of middleware module
    logger({ level: LogLevel.DEBUG, scope: "mw" }, "use middleware", path.join(dirname, path.basename(absolute)));
    // Return array of parent middleware and middleware from module
    return [...parent, ...exports.default];
}
/**
 * Find which file exists based on possible names. Returns absolute path so we
 * can import it.
 */
async function findFile(...filenames) {
    for (const filename of filenames) {
        try {
            await fs.access(filename);
            return path.resolve(filename);
        }
        catch {
            // Ignore
        }
    }
    return null;
}
//# sourceMappingURL=middleware.js.map