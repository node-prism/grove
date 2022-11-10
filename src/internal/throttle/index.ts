import { Context, Respond } from "../http";

const track_byIp = {};
const track_byPath = {};

export default function throttle(
  c: Context,
  options: {
    /** Throttle by IP. */
    byIp?: boolean;

    /** Throttle by IP, method and request path. */
    byPath?: boolean;

    /** How many requests by IP to any endpoint per second. */
    ipRate?: number;

    /** How many requests by IP, method and request path per second. */
    pathRate?: number;
  } = {}
) {
  const { byIp = true, byPath = true, ipRate = 30, pathRate = 10 } = options;

  track_byIp[c.req.ip] = track_byIp[c.req.ip] ? track_byIp[c.req.ip] + 1 : 1;
  track_byPath[c.req.ip + c.req.method + c.req.path] =
    track_byPath[c.req.ip + c.req.method + c.req.path] + 1 || 1;

  setTimeout(() => {
    track_byIp[c.req.ip]--;
    track_byPath[c.req.ip + c.req.method + c.req.path]--;

    if (track_byIp[c.req.ip] === 0) {
      delete track_byIp[c.req.ip];
    }

    if (track_byPath[c.req.ip + c.req.method + c.req.path] === 0) {
      delete track_byPath[c.req.ip + c.req.method + c.req.path];
    }
  }, 1000);

  if (byIp && track_byIp[c.req.ip] > ipRate) {
    return Respond.TooManyRequests(c);
  }

  if (byPath && track_byPath[c.req.ip + c.req.method + c.req.path] > pathRate) {
    return Respond.TooManyRequests(c);
  }

  return c.next();
}
