import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, LogOut, ShieldCheck } from "lucide-react";
import { Field, inputClass } from "@/components/admin/FormKit";
import { PageHeading } from "@/components/admin/ui";
import { useAdmin } from "@/lib/AdminContext";
import { callAdmin } from "@/lib/db-client";

export const Route = createFileRoute("/_authed/admin/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "Account & security — Thompson’s Design Work" }] }),
});

function AccountPage() {
  const { name, expiresAt, logout, changeCode } = useAdmin();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [state, setState] = useState({ status: "idle", message: "" });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 8) {
      setState({ status: "error", message: "Use at least 8 characters for the new access code." });
      return;
    }
    if (form.next !== form.confirm) {
      setState({ status: "error", message: "The new codes do not match." });
      return;
    }
    setState({ status: "saving", message: "" });
    try {
      const res = await changeCode(form.current, form.next);
      if (res?.ok) {
        setForm({ current: "", next: "", confirm: "" });
        setState({ status: "saved", message: "Access code updated. Other open sessions were signed out." });
      } else {
        setState({ status: "error", message: res?.error || "Nothing was changed." });
      }
    } catch {
      setState({ status: "error", message: "Something went wrong, so nothing was changed." });
    }
  };

  const signOutEverywhere = async () => {
    await callAdmin("signOutEverywhere").catch(() => null);
    await logout();
  };

  return (
    <div className="space-y-5">
      <PageHeading title="Account & security" description="Your dashboard access code and sessions." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border border-border bg-white">
          <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Signed in as
          </h2>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <ShieldCheck className="h-4 w-4 text-brand" />
              </span>
              <div>
                <p className="text-[13px] font-medium">{name || "Owner"}</p>
                <p className="text-[11.5px] text-muted-foreground">
                  {expiresAt ? `Session ends ${new Date(expiresAt).toLocaleString()}` : "Signed in with your access code"}
                </p>
              </div>
            </div>
            <p className="rounded-sm bg-secondary/60 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              Every dashboard request is checked on the server against your session. Lost your code? On the sign-in
              screen choose “Lost your access code?” and enter the site’s setup key (ADMIN_SETUP_KEY in Vercel).
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
              <button
                type="button"
                onClick={signOutEverywhere}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out everywhere
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-white">
          <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Change access code
          </h2>
          <form onSubmit={submit} className="space-y-3 p-4">
            <Field label="Current access code">
              <input type="password" className={inputClass} value={form.current} onChange={set("current")} autoComplete="current-password" />
            </Field>
            <Field label="New access code" hint="At least 8 characters">
              <input type="password" className={inputClass} value={form.next} onChange={set("next")} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new access code">
              <input type="password" className={inputClass} value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
            </Field>
            {state.status === "saved" && (
              <p className="inline-flex items-center gap-1.5 text-[11.5px] text-emerald-600">
                <Check className="h-3.5 w-3.5" /> {state.message}
              </p>
            )}
            {state.status === "error" && <p className="text-[11.5px] text-destructive">{state.message}</p>}
            <button
              type="submit"
              disabled={state.status === "saving"}
              className="rounded-sm bg-obsidian px-4 py-2.5 text-[12px] font-medium text-white disabled:opacity-60"
            >
              {state.status === "saving" ? "Saving…" : "Save new code"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
