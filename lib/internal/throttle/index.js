import { Respond } from "../http";
const track_byIp = {};
const track_byPath = {};
export default function throttle(c, options = {}) {
    const { byIp = true, byPath = true, ipRate = 30, pathRate = 10 } = options;
    track_byIp[c.req.ip] = track_byIp[c.req.ip] ? track_byIp[c.req.ip] + 1 : 1;
    track_byPath[c.req.ip + c.req.method + c.req.path] =
        track_byPath[c.req.ip + c.req.method + c.req.path] + 1 || 1;
    setTimeout(() => {
        track_byIp[c.req.ip] = track_byIp[c.req.ip] - 1;
        track_byPath[c.req.ip + c.req.method + c.req.path] =
            track_byPath[c.req.ip + c.req.method + c.req.path] - 1;
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
//# sourceMappingURL=index.js.map