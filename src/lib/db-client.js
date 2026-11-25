// Browser-side data client for the dashboard. It keeps the same shape the
// dashboard code already uses — db.entities.Customer.filter(...), .create(...),
// db.integrations.Core.UploadPublicFile({ file }) — but every call goes to this
// app's own server (src/lib/admin.server.js), which checks the access-code
// session before touching the database.
import { adminApi, uploadFile } from "@/lib/server-fns";

export const TOKEN_KEY = "tdw-admin-session";
export const SIGNED_OUT_EVENT = "admin:signed-out";

export function readToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function writeToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
  else window.sessionStorage.removeItem(TOKEN_KEY);
}

function signedOut() {
  writeToken(null);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
}

export async function callAdmin(action, payload = {}) {
  const res = await adminApi({ data: { action, token: readToken(), payload } });
  if (res?.code === "UNAUTHORIZED" && !["login", "claim", "status", "session", "logout"].includes(action)) signedOut();
  return res;
}

function failure(res, fallback) {
  return Object.assign(new Error(res?.error || fallback), { code: res?.code });
}

async function entityCall(entity, op, args) {
  const res = await callAdmin("entity", { entity, op, args });
  if (!res?.ok) throw failure(res, "That change didn't save. Please try again.");
  return res.result;
}

const entityCache = new Map();
const entities = new Proxy(
  {},
  {
    get(_target, entity) {
      if (typeof entity !== "string") return undefined;
      if (!entityCache.has(entity)) {
        entityCache.set(
          entity,
          new Proxy({}, { get: (_t, op) => (typeof op === "string" ? (...args) => entityCall(entity, op, args) : undefined) }),
        );
      }
      return entityCache.get(entity);
    },
  },
);

async function upload(file, kind) {
  const form = new FormData();
  form.append("file", file);
  form.append("token", readToken() || "");
  form.append("kind", kind);
  const res = await uploadFile({ data: form });
  if (res?.code === "UNAUTHORIZED") signedOut();
  if (!res?.ok) throw failure(res, "Upload failed. Try again.");
  return res;
}

export const db = {
  entities,
  integrations: {
    Core: {
      UploadPublicFile: async ({ file }) => ({ file_url: (await upload(file, "image")).file_url }),
      UploadPrivateFile: async ({ file }) => ({ file_uri: (await upload(file, "file")).file_uri }),
      // Project files are stored under unguessable links, so the link opens the file.
      CreateFileSignedUrl: async ({ file_uri }) => ({ signed_url: file_uri }),
    },
  },
};
