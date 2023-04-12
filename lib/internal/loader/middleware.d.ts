/**
 * Asynchronously loads middleware modules from a given directory, and returns an array of middleware.
 * @param dirname - The directory path to search for middleware modules.
 * @param filename - The filename of the middleware module.
 * @param defaultMiddleware - An optional array of default middleware to use if no middleware is found in the specified directory.
 * @returns A promise that resolves to an array of middleware.
 * @throws An error if the middleware module does not export a default array or exports more than one object.
 */
export default function loadMiddleware<T>(dirname: string, filename: string, defaultMiddleware?: T[]): Promise<T[]>;
