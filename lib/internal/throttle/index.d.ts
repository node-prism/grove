import { Context } from "../http";
export default function throttle(c: Context, options?: {
    /** Throttle by IP to any endpoint. */
    byIp?: boolean;
    /** Throttle by IP, method and request path. */
    byPath?: boolean;
    /** How many requests by IP to any endpoint per second. */
    ipRate?: number;
    /** How many requests by IP, method and request path per second. */
    pathRate?: number;
}): void | import("../http/respond").IErrorResponse;
