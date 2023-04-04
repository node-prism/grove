import { NextFunction, Request, Response } from "express";
import glob from "fast-glob";
import path from "node:path";
import { isPromise } from "node:util/types";
import { Key, pathToRegexp } from "path-to-regexp";
import { LogLevel } from "../../shared";
import {
  HTTPModuleExports,
  RouteDefinition,
} from "../../shared/definitions";
import logger from "../../shared/logger";
import { invariant } from "../../shared/utils";
import loadModule from "../../internal/loader/main";
import loadMiddleware from "../../internal/loader/middleware";

import ExpressContext from "./context";
import { GroveApp } from "../../shared/definitions";

/**
 * Given an Express route string and a request object, returns an object containing relevant information about the request.
 * @param {string} route - The Express route string, potentially containing parameters and/or wildcards.
 * @param {Request} req - The request object from an incoming HTTP request.
 * @returns {Object} An object containing information about the request, including path parameters, query parameters, headers, and the bearer token (if any).
 * @example
 *
 * const req = { 
 *   params: { id: '123' }, 
 *   query: { name: 'foo', age: '20' }, 
 *   body: { email: 'foo@example.com' }, 
 *   headers: { authorization: 'Bearer abc123', content-type: 'application/json' } 
 * };
 * const route = '/users/:id';
 * const result = getRequestContext(route, req);
 *
 * // result object should be:
 * // {
 * //   path: { id: '123' },
 * //   query: { name: 'foo', age: '20' },
 * //   body: { email: 'foo@example.com' },
 * //   headers: { authorization: 'Bearer abc123', content-type: 'application/json },
 * //   bearer: 'abc123'
 * // }
 */
type Key = {
  name: string;
  prefix: string;
  suffix: string;
  pattern: string;
  modifier: string;
};

interface RequestContext {
  path: Record<string, any>;
  query: Record<string, any>;
  body: Record<string, any>;
  headers: Record<string, any>;
  bearer: string;
}

function getRequestContext(route: string, req: Request): RequestContext {
  const ret: RequestContext = {
    path: {},
    query: {},
    body: {},
    headers: {},
    bearer: "",
  };

  // path
  const keys: Key[] = [];
  pathToRegexp(route, keys);
  keys.forEach((key) => {
    ret.path[key.name] = req.params[key.name];
  });

  // query
  ret.query = req.query;
  ret.body = req.body;
  ret.headers = req.headers;

  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(" ");
    if (type.toLowerCase() === "bearer") {
      ret.bearer = token;
    }
  }

  return ret;
}

/**
 * @param handler - the handler to wrap
 * @param route - the route the handler is for
 * @returns a function that will call the handler with ExpressContext and relevant route data
 */
function getWrappedHandler(handler: Function, route: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rel = getRequestContext(route, req);
    const context = new ExpressContext(req, res, next);
    const runner = async () => {
      const params: any[] = [context, rel];
      let ret = handler(...params);

      if (isPromise(ret)) {
        ret = await ret;
      }
    };

    try {
      await runner();
    } catch (e) {
      if (res.headersSent) {
        return next(e);
      }
      return next(e);
    }
  };
}

/**
 * Creates route handlers for HTTP requests for a given module and route path.
 * 
 * @param module - The HTTP module that defines the handlers.
 * @param middleware - The middleware to apply to all handlers.
 * @param route - The route path.
 * @param app - The Grove app.
 * 
 * @example
 * const middleware = [throttleMiddleware, authMiddleware];
 * const module = require("./myModule");
 * createRouteHandlers(module, middleware, "/my-path", app);
 * 
 * This example will create route handlers for the "/my-path" route using the 
 * handlers defined in the "myModule" module. The middleware defined in the
 * `middleware` array will be applied to all of the handlers.
 */
function createRouteHandlers(
  module: HTTPModuleExports,
  middleware: any,
  route: string,
  app: GroveApp
) {
  logger({ level: LogLevel.DEBUG, scope: "http" }, route);

  if (module.default && typeof module.default === "function") {
    app.app.all(route, ...middleware, getWrappedHandler(module.default, route));
    logger(
      { level: LogLevel.DEBUG, scope: "http" },
      `${route} | method: any -> export default`
    );
  }

  ["get", "put", "post", "patch", "del", "options"].forEach((method) => {
    if (!(module[method] && typeof module[method] === "function")) {
      return;
    }

    // Append per-method middleware to the end of the middleware list.
    let methodMiddleware = module?.middleware?.[method] || [];
    if (methodMiddleware && !Array.isArray(methodMiddleware))
    methodMiddleware = [methodMiddleware];
    if (methodMiddleware.length)
    methodMiddleware = wrapMiddlewareWithHTTPContext(
      route,
      methodMiddleware
    );

    app.app[method === "del" ? "delete" : method](
      route,
      [...middleware, ...methodMiddleware],
      getWrappedHandler(module[method], route)
    );

    logger(
      { level: LogLevel.DEBUG, scope: "http" },
      `${route} | method: ${
          method === "del" ? "DELETE" : method.toUpperCase()
        } -> export "${module[method].name}"`
    );
  });
}

export default async function createHTTPHandlers(
  app: GroveApp,
): Promise<RouteDefinition[]> {
  const p = path.join(app.root, "/http/");
  const filenames = await glob(`${p}**/[!_]*.{mjs,js,jsx,ts,tsx}`);
  const dupes = new Map<string, string>();

  /**
   * Routes are sorted so that:
   * - Routes without path parameters (e.g. /user/profile) are first
   * - Routes with path parameters (e.g. /user/:id) are next
   * - Routes with catch-all's (e.g. /user/:id*) are last
   *
   * Defining the express handlers in this way ensures that
   * navigating to, for example, /user/profile is caught by
   * `api/user/profile.ts` instead of `api/user/[id].ts`.
   */
  const standard: string[] = [];

  const withParams: string[] = [];
  const re_withParams = /\[.*?\]/g;

  const withCatchAll: string[] = [];
  const re_catchAll = /\[\.{3}.*?\]/g;

  filenames.forEach((fn) => {
    if (re_catchAll.test(fn)) {
      withCatchAll.push(fn);
    } else if (re_withParams.test(fn)) {
      withParams.push(fn);
    } else {
      standard.push(fn);
    }
  });

  // Sort such that /user/:foo/:bar is always created after /user/:foo/bar
  withParams.sort(
    (a, b) => a.match(re_withParams).length - b.match(re_withParams).length
  );
  withCatchAll.sort(
    (a, b) => a.match(re_catchAll).length - b.match(re_catchAll).length
  );

  const sorted = [...standard, ...withParams, ...withCatchAll];

  const defs: RouteDefinition[] = [];

  for (const filename of sorted) {
    const module = await loadModule<HTTPModuleExports>(filename);
    invariant(module, `failed to load module ${filename}`);

    let route = pathFromFilename(filename.replace(`${app.root}/http/`, "/"));
    // .build/api/_authenticated/admin/index.ts -> .build/api/admin/index.ts
    route = route.replace(/\/\_(?:\w|['-]\w)+\//g, "/");

    const signature = route.replace(/:(.*?)(\/|$)/g, ":$2");
    const identical = dupes.get(signature);

    if (identical)
      throw new Error(
        `duplicate routes: "${identical}" and "${filename}": ${signature}`
      );

    dupes.set(signature, filename);

    logger(
      { level: LogLevel.DEBUG, scope: "http" },
      `route ${route} (${filename})`
    );

    let middleware = await loadMiddleware<Function>(
      path.dirname(filename),
      filename
    );
    middleware = wrapMiddlewareWithHTTPContext(route, middleware);

    createRouteHandlers(module, middleware, route, app);
    defs.push({ route, filename });
  }

  return defs;
}

/**
 * Wraps an array of middleware functions with HTTP context, allowing them to interact with HTTP request and response objects.
 *
 * @param {string} route - The route to which the middleware will be added.
 * @param {Function[]} middleware - The middleware to be wrapped.
 * @returns {Function[]} - Returns a new array of middleware functions wrapped with HTTP context.
 *
 * @throws {Error} - Throws an error if any of the middleware fail to execute properly.
 *
 * @example
 *
 * const someMiddleware = (req, res, next) => {
 *   console.log('This is some middleware.');
 *   next();
 * }
 *
 * const wrappedMiddleware = wrapMiddlewareWithHTTPContext('/my-route', [someMiddleware]);
 * console.log(wrappedMiddleware); // [Function: handler]
 * 
 * The first argument provided to wrapped middleware is an ExpressContext object,
 * and the second argument is the relevant request context, which looks like:
 * { params: { ... }, query: { ... }, body: { ... }, headers: { ... }, bearer: "" }
 */
function wrapMiddlewareWithHTTPContext(route: string, middleware: Function[]) {
  return middleware.map((fn) => {
    function handler(req: Request, res: Response, next: NextFunction) {
      const ec = new ExpressContext(req, res, next);
      const relevant = getRequestContext(route, req);
      try {
        fn(ec, relevant);
      } catch (e) {
        console.error("middleware wrapper handler caught error", e);
      }
      return;
    }

    // Give this handler the same 'name' as the provided middleware
    Object.defineProperty(handler, "name", { value: fn.name, writable: false });

    return handler;
  });
}

/**
 * Converts a file path to a URL path, and ensures that it is a valid URL path.
 *
 * Examples:
 *
 * ```
 * pathFromFilename('/app/routes/user/[userId].js')
 * // -> '/app/routes/user/:userId'
 *
 * pathFromFilename('/app/routes/index.js')
 * // -> '/app/routes'
 * ```
 *
 * @param {string} filename The file path to convert to a URL path.
 * @returns {string} The URL path corresponding to the provided file path.
 * @throws {Error} Throws an error if the path parameters are invalid or duplicate.
 * @throws {Error} Throws an error if a catch-all parameter (*) is not the last path parameter.
 */
function pathFromFilename(filename: string): string {
  const basename = path.basename(filename, path.extname(filename)).normalize();
  const directory = path.dirname(filename).normalize();
  const withoutIndex =
    basename === "index"
      ? directory
      : path.join(directory, basename).normalize();

  const renamed = renamePathProperties(withoutIndex);
  validatePathParameters(renamed);
  return renamed;
}

/**
 * Replaces path parameter definitions in a filename with Express-style parameter
 * names. Path parameter definitions are in square brackets and can optionally have
 * a `...` prefix to indicate a variadic parameter. The function throws an error if
 * the parameter name contains any characters other than letters, numbers, hyphens,
 * or underscores, which are the only characters allowed in Express-style parameter
 * names.
 *
 * @param filename - The filename to modify.
 * @returns The modified filename with path parameters replaced with their corresponding
 * Express-style parameter names.
 */
function renamePathProperties(filename: string): string {
  return filename.replace(/\[(\.{3})?(.*?)\]/gi, (_, variadic, name) => {
    if (!/^[a-z0-9_-]+$/i.test(name))
      throw new Error(
        "path parameters must be alphanumeric, dash, or underscore"
      );
    return variadic ? `:${name}*` : `:${name}`;
  });
}

/**
 * Ensures that path parameters in an Express route path are valid.
 * Throws an error if two parameters have the same name, or if the catch-all
 * parameter is not at the end of the path.
 *
 * @param path - The path to validate.
 * @returns void.
 * @throws an error if two parameters have the same name, or if the catch-all parameter is not at the end of the path.
 *
 * @example
 * // This will throw an error because the path contains two parameters with the same name:
 * validatePathParameters('/users/:id/:id');
 *
 * // This will throw an error because the catch-all parameter is not at the end of the path:
 * validatePathParameters('/users/`*`/:id'); <-- (asterisk surrounded with `` because otherwise the comment will be closed)
 */
function validatePathParameters(path: string) {
  const keys: Key[] | undefined = [];
  pathToRegexp(path, keys);

  if (new Set(keys.map((key) => key.name)).size < keys.length)
    throw new Error("Found two parameters with the same name");

  const catchAll = keys.findIndex(({ modifier }) => modifier === "*");
  if (catchAll >= 0 && catchAll !== keys.length - 1)
    throw new Error(
      "the catch-all parameter can only come at the end of the path. invalid path: " +
        path
    );
}
