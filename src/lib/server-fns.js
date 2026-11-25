import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminAction, adminUpload, recoverCredential } from "@/lib/admin.server";

const adminSchema = z.object({
  action: z.string().min(1).max(64),
  token: z.string().max(200).optional().nullable(),
  payload: z.record(z.string(), z.any()).optional().nullable(),
});

// The one door into the dashboard's data. Every action except status, claim,
// login, logout and session needs a valid access-code session token.
export const adminApi = createServerFn({ method: "POST" })
  .validator(adminSchema)
  .handler(async ({ data, context }) => {
    return adminAction(context.getDb(), {
      action: data.action,
      token: data.token || null,
      payload: data.payload || {},
    });
  });

// Dashboard uploads: multipart form with `file`, the session `token` and
// `kind` ("image" for website imagery, "file" for project files). Stored in Vercel Blob.
export const uploadFile = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected form data.");
    const file = data.get("file");
    const token = data.get("token");
    const kind = data.get("kind");
    if (!file || typeof file === "string") throw new Error("No file was sent.");
    return { file, token: typeof token === "string" ? token : "", kind: kind === "file" ? "file" : "image" };
  })
  .handler(async ({ data, context }) => {
    return adminUpload(context.getDb(), data);
  });

// Lost owner code: whoever knows the ADMIN_SETUP_KEY (set in the Vercel
// project's environment variables) can set a new owner code.
export const recoverAdminCode = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().min(8).max(128), setupKey: z.string().max(400).optional().default("") }))
  .handler(async ({ data, context }) => {
    return recoverCredential(context.getDb(), data.code, data.setupKey);
  });
