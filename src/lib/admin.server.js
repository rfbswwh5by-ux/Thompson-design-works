// Server-only dashboard logic. Every dashboard read and write runs here, after
// the access-code session has been checked, using the app's own data client.
import {
  assertNotLocked,
  buildCredential,
  clearAllAttempts,
  clearFailures,
  clientKey,
  codeProblem,
  createSession,
  credentialFor,
  deploymentId,
  findSession,
  recordFailure,
  requireSession,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSession,
  setupKeyProblem,
  verifyCode,
} from "@/lib/admin-security.server";
import { FAQS, SAMPLE_PROJECTS, SERVICES } from "@/lib/site-defaults";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);
const str = (value, max = 400) => String(value ?? "").slice(0, max);

// The content the dashboard manages. Access codes, sessions and lockouts are
// deliberately not on this list, so they can never be read or changed through it.
const MANAGED_ENTITIES = new Set([
  "BusinessSettings",
  "Communication",
  "Customer",
  "Faq",
  "Inquiry",
  "InquiryNote",
  "PortfolioProject",
  "Project",
  "ProjectFile",
  "ProjectUpdate",
  "Service",
  "SiteEvent",
  "Testimonial",
  "WebsiteContent",
]);
const ENTITY_OPS = new Set(["list", "filter", "get", "create", "update", "delete", "deleteMany", "updateMany", "bulkUpdate", "count", "aggregate"]);

// Only codes created by this deployment count (see SITE_ID in .env.example).
async function listCredentials(sr) {
  const all = items(await sr.entities.AdminCredential.list({ limit: 50, sort: "created_date" }));
  const id = deploymentId();
  return id ? all.filter((row) => !row.deployment_id || row.deployment_id === id) : all;
}

async function dropInheritedCredentials(sr) {
  const id = deploymentId();
  if (!id) return;
  const all = items(await sr.entities.AdminCredential.list({ limit: 50 }));
  const stale = all.filter((row) => row.deployment_id && row.deployment_id !== id).map((row) => row.id);
  if (stale.length) await sr.entities.AdminCredential.deleteMany({ id: { $in: stale } });
}

async function businessName(sr) {
  const row = items(await sr.entities.BusinessSettings.filter({ key: "main" }, { limit: 1 }))[0];
  return row?.business_name || "";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

// ---------------------------------------------------------------- starter content

// Run once, when the owner first claims the site: the starter services, FAQs and
// concept portfolio pieces the public site shows out of the box are copied into
// the database, so they appear in the dashboard and can be edited or deleted.
async function seedStarterContent(sr) {
  if ((await sr.entities.SiteSeed.count({})) > 0) return;
  if ((await sr.entities.Service.count({})) === 0) {
    for (const [index, service] of SERVICES.entries()) {
      await sr.entities.Service.create({ ...service, is_published: true, sort_order: index });
    }
  }
  if ((await sr.entities.Faq.count({})) === 0) {
    for (const [index, faq] of FAQS.entries()) {
      await sr.entities.Faq.create({ ...faq, is_published: true, sort_order: index });
    }
  }
  if ((await sr.entities.PortfolioProject.count({})) === 0) {
    for (const [index, project] of SAMPLE_PROJECTS.entries()) {
      const { id: _id, ...fields } = project;
      await sr.entities.PortfolioProject.create({ ...fields, is_published: true, sort_order: index });
    }
  }
  await sr.entities.SiteSeed.create({ seeded_at: new Date().toISOString() });
}

// ---------------------------------------------------------------- access

async function statusAction(sr) {
  const credentials = await listCredentials(sr);
  return { ok: true, claimed: credentials.length > 0, businessName: await businessName(sr).catch(() => "") };
}

async function claimAction(sr, payload) {
  const existing = (await listCredentials(sr))[0];
  if (existing) return { ok: false, code: "ALREADY_CLAIMED", error: "This site already has an administrator code." };
  const key = `claim:${await clientKey()}`;
  await assertNotLocked(sr, key);
  const keyProblem = await setupKeyProblem(payload?.setupKey);
  if (keyProblem) {
    await recordFailure(sr, key);
    return { ok: false, code: "SETUP_KEY", error: keyProblem };
  }
  await clearFailures(sr, key);
  const code = str(payload?.code, 200);
  const problem = codeProblem(code);
  if (problem) return { ok: false, code: "WEAK", error: problem };
  await dropInheritedCredentials(sr);
  const created = await sr.entities.AdminCredential.create({
    ...(await buildCredential(code)),
    display_name: "Owner",
    role: "owner",
    is_active: true,
    deployment_id: deploymentId(),
  });
  await seedStarterContent(sr).catch((error) => console.error("Starter content failed:", error?.message || error));
  const session = await createSession(sr, await clientKey(), created.id);
  return { ok: true, token: session.token, expiresAt: session.expiresAt, name: "Owner" };
}

async function loginAction(sr, payload) {
  const credentials = (await listCredentials(sr)).filter((row) => row.is_active !== false);
  if (!credentials.length) return { ok: false, code: "NEEDS_SETUP", error: "No administrator code has been set for this site yet." };
  const key = await clientKey();
  await assertNotLocked(sr, key);
  const code = str(payload?.code, 200);
  let matched = null;
  if (code) {
    for (const credential of credentials) {
      if (await verifyCode(code, credential)) {
        matched = credential;
        break;
      }
    }
  }
  if (!matched) {
    await recordFailure(sr, key);
    return { ok: false, code: "INVALID", error: "That access code is not correct." };
  }
  await clearFailures(sr, key);
  await sr.entities.AdminCredential.update(matched.id, { last_used_ms: Date.now() });
  const session = await createSession(sr, key, matched.id);
  return { ok: true, token: session.token, expiresAt: session.expiresAt, name: matched.display_name || "Owner" };
}

async function changeCodeAction(sr, session, payload) {
  const cred = session.credential;
  const key = await clientKey();
  await assertNotLocked(sr, key);
  const current = str(payload?.currentCode, 200);
  if (!(await verifyCode(current, cred))) {
    await recordFailure(sr, key);
    return { ok: false, code: "INVALID", error: "Your current access code is not correct." };
  }
  const next = str(payload?.newCode, 200);
  const problem = codeProblem(next);
  if (problem) return { ok: false, code: "WEAK", error: problem };
  if (next === current) return { ok: false, code: "WEAK", error: "Choose a code different from your current one." };
  await sr.entities.AdminCredential.update(cred.id, await buildCredential(next));
  await revokeOtherSessions(sr, session, cred.id);
  await clearFailures(sr, key);
  return { ok: true };
}

// ---------------------------------------------------------------- content

async function entityAction(sr, payload) {
  const entity = str(payload?.entity, 60);
  const op = str(payload?.op, 30);
  if (!MANAGED_ENTITIES.has(entity)) return { ok: false, code: "BAD_REQUEST", error: `Unknown record type: ${entity}` };
  if (!ENTITY_OPS.has(op)) return { ok: false, code: "BAD_REQUEST", error: `Unsupported operation: ${op}` };
  const args = Array.isArray(payload?.args) ? payload.args.slice(0, 3) : [];
  const result = await sr.entities[entity][op](...args);
  return { ok: true, result: result ?? null };
}

async function sendCustomerEmailAction(sr, payload) {
  const customerId = str(payload?.customer_id, 64);
  const projectId = str(payload?.project_id, 64);
  const subject = str(payload?.subject, 200).trim();
  const body = str(payload?.body, 20000).trim();
  if (!customerId || !subject || !body) return { ok: false, error: "Add a subject and a message first." };
  const customer = await sr.entities.Customer.get(customerId).catch(() => null);
  const to = str(customer?.email, 200).trim();
  if (!to) return { ok: false, error: "This customer has no email address on file." };

  const html = body
    .split("\n")
    .map((line) => (line.trim() ? `<p style="margin:0 0 12px">${escapeHtml(line)}</p>` : "<br/>"))
    .join("");
  const log = (status, error) =>
    sr.entities.Communication.create({
      customer_id: customerId,
      project_id: projectId || undefined,
      direction: "Outbound",
      to_email: to,
      subject,
      body,
      status,
      sent_at: new Date().toISOString(),
      ...(error ? { error: String(error).slice(0, 400) } : {}),
    });

  try {
    await sr.integrations.Core.SendEmail({
      to,
      subject,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">${html}</div>`,
      text: body,
      from_name: (await businessName(sr).catch(() => "")) || undefined,
    });
  } catch (error) {
    await log("Failed", error?.message || error);
    if (error?.code === "EMAIL_NOT_CONFIGURED") {
      return { ok: false, error: "Email isn't set up yet (add RESEND_API_KEY and EMAIL_FROM in Vercel). Nothing was sent." };
    }
    return { ok: false, error: "The email service did not confirm delivery. Nothing was sent." };
  }
  await log("Sent");
  return { ok: true, to };
}

async function authedAction(sr, session, action, payload) {
  switch (action) {
    case "entity":
      return entityAction(sr, payload);
    case "sendCustomerEmail":
      return sendCustomerEmailAction(sr, payload);
    case "changeCode":
      return changeCodeAction(sr, session, payload);
    case "signOutEverywhere":
      await revokeAllSessions(sr);
      return { ok: true };
    default:
      return { ok: false, code: "UNKNOWN_ACTION", error: "Unknown action." };
  }
}

export async function adminAction(db, { action, token, payload }) {
  const sr = db.asServiceRole;
  try {
    switch (action) {
      case "status":
        return await statusAction(sr);
      case "claim":
        return await claimAction(sr, payload);
      case "login":
        return await loginAction(sr, payload);
      case "logout":
        await revokeSession(sr, token);
        return { ok: true };
      case "session": {
        const session = await findSession(sr, token);
        if (!session) return { ok: false, code: "UNAUTHORIZED" };
        const credential = await credentialFor(sr, session);
        if (!credential || credential.is_active === false) {
          await revokeSession(sr, token);
          return { ok: false, code: "UNAUTHORIZED" };
        }
        return {
          ok: true,
          expiresAt: session.expires_at_ms,
          name: credential.display_name || "Owner",
          businessName: await businessName(sr).catch(() => ""),
        };
      }
      default: {
        const session = await requireSession(sr, token);
        return await authedAction(sr, session, action, payload);
      }
    }
  } catch (error) {
    if (error?.code === "LOCKED") {
      return { ok: false, code: "LOCKED", error: `Too many incorrect attempts. Try again in ${error.minutes} minute(s).` };
    }
    if (error?.code === "UNAUTHORIZED") {
      return { ok: false, code: "UNAUTHORIZED", error: "Your session has expired. Enter your access code again." };
    }
    if (error?.code === "NO_DATABASE") {
      return { ok: false, code: "NO_DATABASE", error: "The database isn't connected yet. Connect a Neon database to this Vercel project." };
    }
    console.error(`Admin action "${action}" failed:`, error?.message || error);
    return { ok: false, code: error?.status === 404 ? "NOT_FOUND" : "ERROR", error: error?.message || "Something went wrong." };
  }
}

// ---------------------------------------------------------------- uploads

const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

// kind "image" → website imagery; kind "file" → a project file of any type.
export async function adminUpload(db, { file, token, kind }) {
  const sr = db.asServiceRole;
  try {
    await requireSession(sr, token);
  } catch {
    return { ok: false, code: "UNAUTHORIZED", error: "Your session has expired. Enter your access code again." };
  }
  const isImage = kind !== "file";
  if (isImage && !String(file?.type || "").startsWith("image/")) return { ok: false, error: "Choose an image file (JPG, PNG or WebP)." };
  if (Number(file?.size || 0) > UPLOAD_MAX_BYTES) return { ok: false, error: "Choose a file under 4 MB." };
  try {
    if (isImage) {
      const res = await sr.integrations.Core.UploadPublicFile({ file });
      return { ok: true, file_url: res.file_url };
    }
    const res = await sr.integrations.Core.UploadPrivateFile({ file });
    return { ok: true, file_uri: res.file_uri };
  } catch (error) {
    if (error?.code === "UPLOADS_NOT_CONFIGURED") {
      return { ok: false, error: "Uploads aren't set up yet. Connect a Vercel Blob store to this project." };
    }
    console.error("Upload failed:", error?.message || error);
    return { ok: false, error: "That upload didn't go through. Try a smaller file." };
  }
}

// ---------------------------------------------------------------- recovery

// Only whoever knows ADMIN_SETUP_KEY (a Vercel environment variable) can reset
// the owner code. Wrong keys count toward a lockout.
export async function recoverCredential(db, code, setupKey) {
  const sr = db.asServiceRole;
  const key = `recover:${await clientKey()}`;
  try {
    await assertNotLocked(sr, key);
  } catch (error) {
    if (error?.code === "LOCKED") {
      return { ok: false, code: "LOCKED", error: `Too many incorrect attempts. Try again in ${error.minutes} minute(s).` };
    }
    throw error;
  }
  const keyProblem = await setupKeyProblem(setupKey);
  if (keyProblem) {
    await recordFailure(sr, key);
    return { ok: false, code: "SETUP_KEY", error: keyProblem };
  }
  await clearFailures(sr, key);
  const problem = codeProblem(str(code, 200));
  if (problem) return { ok: false, code: "WEAK", error: problem };
  const credentials = await listCredentials(sr);
  const existing = credentials.find((row) => row.role !== "staff") || credentials[0] || null;
  const credential = await buildCredential(str(code, 200));
  const ownerFields = { ...credential, role: "owner", is_active: true, deployment_id: deploymentId() };
  if (existing) await sr.entities.AdminCredential.update(existing.id, ownerFields);
  else await sr.entities.AdminCredential.create({ ...ownerFields, display_name: "Owner" });
  await revokeAllSessions(sr);
  await clearAllAttempts(sr);
  return { ok: true };
}

// ---------------------------------------------------------------- contact form

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000;

// The inquiry form is open to anyone, so one caller gets a handful an hour.
export async function contactAllowed(db) {
  const sr = db.asServiceRole;
  const key = `contact:${await clientKey()}`;
  const row = items(await sr.entities.AdminAttempt.filter({ key }, { limit: 1 }))[0];
  const now = Date.now();
  if (!row || now - Number(row.window_start_ms || 0) > CONTACT_WINDOW_MS) {
    if (row) await sr.entities.AdminAttempt.update(row.id, { fail_count: 1, window_start_ms: now, locked_until_ms: 0 });
    else await sr.entities.AdminAttempt.create({ key, fail_count: 1, window_start_ms: now, locked_until_ms: 0 });
    return true;
  }
  if (Number(row.fail_count || 0) >= CONTACT_LIMIT) return false;
  await sr.entities.AdminAttempt.update(row.id, { fail_count: Number(row.fail_count || 0) + 1 });
  return true;
}
