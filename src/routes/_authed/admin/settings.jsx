import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { db } from "@/lib/db-client";
import { Field, inputClass } from "@/components/admin/FormKit";
import { ImageField } from "@/components/admin/ImageField";
import { PageHeading } from "@/components/admin/ui";
import { listRecords } from "@/lib/admin-api";
import { BRAND } from "@/lib/site-defaults";

export const Route = createFileRoute("/_authed/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Thompson’s Design Work" }] }),
});

const DEFAULTS = {
  business_name: BRAND.name,
  email: BRAND.email,
  phone: BRAND.phone,
  location_note: "Remote studio — serving clients anywhere.",
  footer_tagline: "",
  seo_title: "Thompson’s Design Work — Custom Website Design",
  seo_description: "",
  logo_url: "",
  favicon_url: "",
  social_instagram: "",
  social_linkedin: "",
  social_facebook: "",
  social_x: "",
};

function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const { data: record } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => (await listRecords("BusinessSettings", { key: "main" }, { limit: 1 }))[0] || null,
  });

  useEffect(() => {
    if (!form && record !== undefined) {
      setForm({ ...DEFAULTS, ...(record || {}) });
    }
  }, [record, form]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setStatus("");
    try {
      const payload = { ...DEFAULTS, ...form, key: "main" };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (record?.id) await db.entities.BusinessSettings.update(record.id, payload);
      else await db.entities.BusinessSettings.create(payload);
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      setStatus("Saved. Your public website is updated.");
    } catch (error) {
      setStatus(`Not saved: ${error?.message || "please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="h-64 animate-pulse rounded-sm border border-border bg-white" />;

  return (
    <div className="space-y-5">
      <PageHeading
        title="Business settings"
        description="Contact details, brand assets and search metadata used across the public site."
        actions={
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-sm bg-obsidian px-4 py-2.5 text-[12.5px] font-medium text-white disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save settings"}
          </button>
        }
      />

      {status && (
        <p className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">{status}</p>
      )}

      <section className="rounded-sm border border-border bg-white">
        <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Business details
        </h2>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Business name"><input className={inputClass} value={form.business_name} onChange={set("business_name")} /></Field>
          <Field label="Business email"><input className={inputClass} value={form.email} onChange={set("email")} /></Field>
          <Field label="Business phone"><input className={inputClass} value={form.phone} onChange={set("phone")} /></Field>
          <Field label="Location note"><input className={inputClass} value={form.location_note} onChange={set("location_note")} /></Field>
          <Field label="Footer tagline" className="sm:col-span-2"><input className={inputClass} value={form.footer_tagline} onChange={set("footer_tagline")} /></Field>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-white">
        <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Brand assets
        </h2>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="Logo">
            <ImageField value={form.logo_url} onChange={(v) => setForm((f) => ({ ...f, logo_url: v }))} />
          </Field>
          <Field label="Favicon">
            <ImageField value={form.favicon_url} onChange={(v) => setForm((f) => ({ ...f, favicon_url: v }))} />
          </Field>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-white">
        <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Social media
        </h2>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Instagram"><input className={inputClass} value={form.social_instagram} onChange={set("social_instagram")} placeholder="https://instagram.com/…" /></Field>
          <Field label="LinkedIn"><input className={inputClass} value={form.social_linkedin} onChange={set("social_linkedin")} placeholder="https://linkedin.com/…" /></Field>
          <Field label="Facebook"><input className={inputClass} value={form.social_facebook} onChange={set("social_facebook")} placeholder="https://facebook.com/…" /></Field>
          <Field label="X"><input className={inputClass} value={form.social_x} onChange={set("social_x")} placeholder="https://x.com/…" /></Field>
        </div>
      </section>

      <section className="rounded-sm border border-border bg-white">
        <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Website metadata
        </h2>
        <div className="grid gap-3 p-4">
          <Field label="SEO title"><input className={inputClass} value={form.seo_title} onChange={set("seo_title")} /></Field>
          <Field label="SEO description">
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={form.seo_description} onChange={set("seo_description")} />
          </Field>
        </div>
      </section>
    </div>
  );
}