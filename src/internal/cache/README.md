# useCache

`useCache(callback, inputs, cacheDuration)`

This cache helper takes in a callback, some inputs that are used as the cache key,
and a `cacheDuration`, which is a string like "1m" or "30s", or a number of milliseconds.

The operation is stored in a `CacheMap`, where the key is a stringified version of the input arguments and the value is the result of `callback(...inputs)`.

The cached result of the provided callback will be returned by the call to `useCache` until the lifetime defined by `cacheDuration` has passed.

An example of using this could be a middleware that caches the result of JWT signature verification using the client IP and the JWT as the cache key:

```typescript
// ip-jwt-verification-middleware.ts
import { Context, Respond } from "@prsm/grove/http";
import { verify } from "@prsm/grove/jwt";
import useCache from "@prsm/grove/cache";

export default async function(c: Context, { bearer }: { bearer: string }) {
  if (!bearer) {
    return Respond.BadRequest(c, "Expected Bearer token.");
  }

  const inputs = [c.req.ip, bearer];

  const outputs = useCache(
    (_ip: string, token: string | undefined) => {
      const result = verify(token, process.env.JWT_SIGNATURE, { exp: true });

      if (!result.sig) return { valid: false, reason: "signature" };
      if (result.exp) return { valid: false, reason: "expired" };

      return { valid: true };
    },
    inputs,
    "1m"
  );

  if (outputs.valid) {
    c.next();
    return;
  }

  return Respond.Unauthorized(c, { invalid: outputs.reason });
}
```
