import { GroveApp } from "../../shared/definitions";
/**
 * The idea here as that a file at /sockets/a/b/c/d.ts
 * will be reachable at ws(s)://localhost/ and it's
 * command name will be "/a/b/c/d".
 *
 * The module's default export is the command executor.
 */
export declare function createSocketHandlers(app: GroveApp): Promise<void>;
