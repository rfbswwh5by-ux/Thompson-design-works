import { createMiddleware } from "@tanstack/react-start";
import { serviceClient } from "@/lib/entities.server";

// Every server function and server route gets `context.getDb()`: this app's own
// Postgres-backed data client (src/lib/entities.server.js). It does not sign
// anyone in — dashboard access is checked in admin.server.js with the access-code
// session token, and the public functions only read published records.
const withClient = (next) => next({ context: { getDb: () => serviceClient } });

export const authMiddleware = createMiddleware({ type: "function" }).server(({ next }) => withClient(next));

export const appRequestMiddleware = createMiddleware({ type: "request" }).server(({ next }) => withClient(next));
