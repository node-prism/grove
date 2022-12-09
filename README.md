A backend framework with a Next.js-esque filesystem-based API structure.

An example project can be found at [github.com/node-prism/grove-example](https://github.com/node-prism/grove-example).

# Brief overview

## Handling HTTP requests

```typescript
// /src/app/http/auth/login.ts:
import { Context, Respond } from "@prsm/grove/http";

export async function post(c: Context, { body: { email, password }}) {
  return Respond.OK(c, { ok: "Authorized" });
}

// POST /auth/login
// content-type: application/json
// {
//   "email": "foo@bar.com",
//   "password": "password"
// }

// response: 
// HTTP/1.1 200 OK
// {
//   "code": 200,
//   "data": {
//     "ok": "Authorized"
//   }
// }
```

## Handling WebSocket messages

```typescript
// /src/app/socket/auth/login.ts:
import { Context } from "@prsm/grove/ws";

export default async function (c: Context) {
  return { ok: "Authorized" };
}

// wscat -c ws://localhost:PORT/ -x '{"command": "/auth/login", "payload": {"token": "..."}}'
// response:
// {"command":"/auth/login","payload":{"ok":"Authorized"}}
```

Some additional (and completely optional) features to help you quickly get your project started:

- [queues](https://github.com/node-prism/grove#queues)
- [scheduled tasks](https://github.com/node-prism/grove#schedules)
- simple middleware creation for both [http](https://github.com/node-prism/grove#middleware) and [socket endpoints](https://github.com/node-prism/grove#socket-middleware)
- [a helper for caching requests](https://github.com/node-prism/grove/tree/master/src/internal/cache)
- [helpers for JWT verification and signing](https://github.com/node-prism/grove/tree/master/src/internal/jwt)
- [helpers for hasing passwords](https://github.com/node-prism/grove/tree/master/src/internal/hash)

# Installation

```bash
npm i @prsm/grove
```

# Quickstart

```typescript
// /src/index.ts
import express from "express";
import { createServer } from "http";
import { createApi } from "@prsm/grove";

// Create an express server.
const app = express();
const server = createServer(app);

// Tell express to parse incoming requests with JSON payloads.
app.use(express.json());

// Travel the "app" folder, discovering modules and using them to create route handlers.
const grove = await createApi("app", app, server);
grove.server.listen(3000);
```

The typical folder structure looks something like this:

```bash
├── app
│   ├── errors.ts
│   ├── http
│   │   ├── _middleware.ts
│   │   ├── auth
│   │   │   └── login.ts
│   │   ├── mail
│   │   │   └── index.ts
│   │   └── user
│   │       ├── [id].ts
│   │       └── index.ts
│   ├── http_middlewares
│   ├── queues
│   │   └── mail.ts
│   ├── schedules
│   │   └── metrics.ts
│   ├── socket
│   │   └── _authorized
│   │       ├── _middleware.ts
│   │       └── jobs
│   │           └── start.ts
│   └── socket_middlewares
│       └── authorize.ts
├── index.ts
└── views
    └── 404.ejs
```

# .env

If an `.env` file is discovered alongside `package.json`, `dotenv` automatically loads and injects the
environment variables into `process.env`.

The only grove-specific environment variable is `LOGLEVEL`, which can be one of:

- `4` (debug)
- `3` (error)
- `2` (warn)
- `1` (info)
- `0` (silent)

```shell
# /.env
LOGLEVEL=3
JWT_SECRET=ninjaturtles
```

# HTTP route handlers

Place your HTTP route handlers under `/src/app/http`, for example:

```typescript
// /src/app/http/user.ts OR /src/app/http/user/index.ts
export async function get(c: Context) {}   // GET /user
export async function post(c: Context) {}  // POST /user
export async function put(c: Context) {}   // PUT /user
export async function patch(c: Context) {} // PATCH /user
export async function del(c: Context) {}   // DELETE /user
```

Path parameters are supported:

```typescript
// /src/app/http/user/[id].ts -> /user/:id
export async function get(c: Context, { path: { id } }) {
  return Respond.OK(c, { id });
}
```

Wildcards are supported:

```typescript
// /src/app/http/user/[id]/[...rest].ts -> /user/:id/:rest*
export async function get(c: Context, { path: { id, rest } }) {
  // c.req.params will include whatever other path params exist
  return Respond.OK(c, { id, rest });
}
```

Handlers are wrapped in order to catch what would otherwise be an uncaught Promise rejection
or thrown error by passing it to whatever Express error middlewares have been defined.

```typescript
function throws() {
  throw new Error("Whoops!");
}

export async function get(c: Context) {
  throws();
  return Respond.OK(c, { hello: "world" });
}
```

The result of the above is that the error is caught and passed to the first middleware
defined in `/src/app/errors.ts`, if it exists.

This means that you don't need to wrap error-prone code within a try/catch and
forward errors to your error-handling middleware with, e.g., `next(e)`, as this happens
automatically for you.

```typescript
const grove = await createAPI("app", app, server);

// Assuming `/src/app/errors.ts` doesn't exist and this is the first error handling
// middleware that is defined, the above thrown error would be handled by the following
// middleware:

grove.app.use((err, req, res, next) => {
  res.status(500).send("Something went horribly wrong!");
});
```

## Middleware

Let's assume we have the following endpoints:

```bash
/user/ (/src/app/http/user/index.ts)
/user/profile/ (/src/app/http/user/profile.ts)
/user/profile/edit (/src/app/http/user/profile/edit.ts)
```

To create middleware that is applied to *all* of these endpoints (i.e. `
/user/*`), create
a file named `_middleware.ts` and place it at `/src/app/http/user/_middleware.ts`.

A `_middleware.ts` file is expected to have a default export which is an array of
Express-compatible middleware handlers.

```typescript
// /src/app/http/user/_middleware.ts
export default [
   async (c: Context) => {
    console.log(c.req.method, c.req.path, c.req.ip);
    c.next();
  },
];
```

Another way to define middleware is to export a `middleware` object from a handler file, where the object keys
are the request method that the middleware will be applied to, and the value is an array of middlewares.

```typescript
// /src/app/http/user/profile.ts
export async function get(c: Context) {}
export async function post(c: Context) {}

export const middleware = {
  // GET /user/profile will hit this middleware first.
  "get": [
    async function validUser(c: Context) {
      // validate this user, or something
      c.next();
    }
  ],

  // ...
  "post": [],
  "put": [],
  "patch": [],
  "del": [],
};
```

# Error middleware

You can optionally place an `errors.ts` file at your application's root (e.g. `/app/errors.ts`)
which will be autodiscovered by grove and applied to Express as middleware. This file is expected
to have a default export which is an array of Express middleware handlers. These middlewares are
registered with Express *after* your filesystem-based routes are registered.

For example:

```typescript
// /src/app/errors.ts
import { NextFunction, Request, Response } from "express";

export default [
  // Handle errors by sending a 500 with the error message.
  (err: any, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof Error) {
      return res.status(500).send({ code: 500, error: String(err.message) });
    }

    return next(err);
  },

  // 404 handler
  (req: Request, res: Response, _next: NextFunction) => {
    res.render("404", { path: req.path });
  },
];
```

## Flattened paths

You can "flatten" parts of a route path by prefixing corresponding filesystem folders with an underscore. In other words,

```bash
/src/app/http/user/_authorized/profile.ts
```

...is mounted at `/user/profile` because the `_authorized` folder is effectively ignored (i.e., flattened).

Middlewares defined inside of flattened folders are still recognized and applied to sibling and child files.
This can be a very useful pattern.

Consider the following folder structure:

```bash
├── app
│   ├── http
│   │   └── user
│   │       ├── index.ts
│   │       └── _authorized
│   │           ├── _middleware.ts # some authorization middleware
│   │           └── profile.ts
└── index.ts
```

The result of the above is that handlers at `/user` are not behind authorization middleware whereas
handlers at `/user/profile` are.


## Reading the request body / query / path / headers

Both route handlers and middlewares are passed an object of the following shape:

```typescript
{
  path: {}, // Path params (/user/:id -> { path: { id } })
  query: {}, // Query params (/user/123?action=edit -> { query: { action: "edit" } })
  body: {}, // POST body
  headers: {}, // Request headers
  bearer: "", // Bearer token, if present in Authorization header
}

// sample usage:
export async function post(c: Context, { body: { email, password } }) {}
export async function get(c: Context, { query: { action }, path: { id }}) {}
export async function get(c: Context, { bearer }) {}
```


# Schedules

Place your schedule definitions in `/src/app/schedules`.

These are expected to export default an async function, which is the handler for the scheduled task.

Here's an example of a simple schedule that would collect daily user metrics from a database and deliver them via a task placed in a mail queue.

```typescript
// /src/app/schedules/metrics.ts
import { Schedule } from "@prsm/grove/schedules";
import { queue as mailQueue } from "../queues/mail";

// The task to be executed according to the schedule below.
export default async function() {
  mailQueue.push({ recipient: "all@us.io", body: "" });
}

export const config: Schedule = {
  cron: "0 0 12 * *",
  timezone: "America/Los_Angeles",
}
```

# Queues

Place your queue definitions in `/queues`.

Each queue module is expected to export default an async function, which is the handler for each queued job. A `queue` object must also be exported which creates and configures the queue.

Here's an example queue definition.

```typescript
// /src/app/queues/mail.ts
import Queue from "prsm/queues";

interface MailPayload {
  recipient: string;
  subject: string;
  body: string;
}

// The task to be executed for each queued job when a worker becomes available.
export default async function ({ recipient, subject, body }: MailPayload) {
  // send an email
}

export const queue = new Queue<MailPayload>({
  // Number of concurrent queue workers.
  concurrency: 1,

  // When a worker becomes free, it will wait `delay` ms before processing the next job.
  delay: 0,

  // Once started, a task will fail if it does not resolve within `timeout` ms.
  timeout: 0,

  // Groups allow for scoped queues based on a key, e.g. a recipient address.
  // We may, for example, want to limit the number of emails we send to a given
  // recipient in a given time period.
  //
  // By default, a group will inherit the queue's config above, but you can
  // override that config here.
  groups: {
    concurrency: 3,
    delay: "5s",
    timeout: "1m"
  },
});
```

## Adding jobs to a queue

Import your queue and call `queue.push` to add a job to the queue.

```typescript
import { queue as mailQueue } from "../queues/mail";
mailQueue.push({ recipient, subject, body });
```

You can monitor task status by listening to the events emitted by the queue. The queue will emit events when:

1. A job is added to the queue
2. A job is completed
3. A job fails

```typescript
// /src/app/http/mail/index.ts
import { queue as mailQueue } from "../queues/mail";

const onNew = ({ task }) => console.log("Task created:", task.uuid);
const onFailed = ({ task }) => console.log("Task failed:", task.uuid);
const onComplete = ({ task }) => console.log("Task complete:", task.uuid);

mailQueue.on("new", onNew);
mailQueue.on("failed", onFailed);
mailQueue.on("complete", onComplete);

// POST /mail
export async function post(c: Context, { body: { recipient, subject, body } }) {
  const uuid = mailQueue.push({ recipient, subject, body });
  return Respond.OK(c, { uuid });
}

// /src/app/queues/mail.ts
export default async function({ recipient, subject, body }) {
  // send a very important email
}
```

# Sockets

`/src/app/socket/jobs/send-email.ts` maps to a command named `/jobs/send-email` at
endpoint `ws://localhost:PORT/`. To execute a command, send a message with this shape:

```typescript
{
  command: string;
  payload: object;
}
```

For example:

```bash
wscat -c ws://localhost:3000/ -x '{"command": "/jobs/send-email", "payload": { "recipient": "somebody@gmail.com" }}'
```

As usual, a socket command module is expected to export default an async function which is the handler for that command. The return value of the handler will be sent back to the client.

Here's what the above `/src/app/socket/jobs/send-email.ts` module might look like:

```typescript
// /src/app/socket/jobs/send-email.ts
import { MailQueueTask, queue as mailQueue } from "../../queues/email";

export default async function(c: Context) {
  const mail: MailQueueTask = {
    recipient: c.payload.recipient,
    subject: c.payload.subject,
    body: c.payload.body,
  };

  // Queued tasks optionally accept a callback. In this case, we pass a callback to the
  // task so that when the task finishes, we can send a completion message back to the
  // client that initiated the task.
  const callback = () => {
    c.connection.send({ command: "job:status", payload: { status: "finished" } });
  };

  const uuid = mailQueue.group(mail.recipient).push(mail, { callback });

  return { message: "Task created.", uuid };
}
```

## Socket middleware

Socket middlewares are very similar to HTTP middlewares.
They are not Express middlewares, though, so they don't need to call `next` or return anything.

```typescript
// /src/app/socket/jobs/_middleware.ts
import { Context } from "@prsm/grove/ws";

export default [
  (c: Context) => {
    // c.connection has the connecting client details and socket object.
    if (!c.payload.token) {
      throw new Error("Missing authentication token.");
    }
  },
];
```

To fail from a socket middleware, just throw an Error. Command execution will then end and the
command handler will not be called. The error message will be returned to the client,
looking something like:

```json
{"id":0,"command":"start-job","payload":{"error":"Missing authentication token."}}
```
