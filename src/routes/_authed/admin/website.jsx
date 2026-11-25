import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Check, Eye, RotateCcw } from "lucide-react";
import { db } from "@/lib/db-client";
import { Field, inputClass } from "@/components/admin/FormKit";
import { ImageField } from "@/components/admin/ImageField";
import { PageHeading } from "@/components/admin/ui";
import { listRecords } from "@/lib/admin-api";
import { CONTENT_DEFAULTS } from "@/lib/site-defaults";

export const Route = createFileRoute("/_authed/admin/website")({
  component: WebsiteEditor,
  head: () => ({ meta: [{ title: "Website editor — Thompson’s Design Work" }] }),
});

const KEYS = [
  "hero_eyebrow", "hero_headline_top", "hero_headline_accent", "hero_headline_bottom",
  "hero_headline", "hero_description", "hero_primary_cta", "hero_secondary_cta",
  "about_title", "about_body", "about_image_url", "contact_intro", "footer_tagline",
  "seo_title", "seo_description",
];

const SECTIONS = [
  {
    title: "Homepage hero",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow label", full: true },
      { key: "hero_headline_top", label: "Headline — line 1" },
      { key: "hero_headline_accent", label: "Headline — accent (italic)" },
      { key: "hero_headline_bottom", label: "Headline — line 3" },
      { key: "hero_headline", label: "Supporting headline", full: true },
      { key: "hero_description", label: "Description", type: "textarea", full: true },
      { key: "hero_primary_cta", label: "Primary button" },
      { key: "hero_secondary_cta", label: "Secondary button" },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "about_title", label: "About title", full: true },
      { key: "about_body", label: "About body", type: "textarea", full: true, hint: "One paragraph per line" },
      { key: "about_image_url", label: "About image", type: "image", full: true },
    ],
  },
  {
    title: "Contact & footer",
    fields: [
      { key: "contact_intro", label: "Contact page intro", type: "textarea", full: true },
      { key: "footer_tagline", label: "Footer tagline", full: true },
    ],
  },
  {
    title: "Search engines",
    fields: [
      { key: "seo_title", label: "SEO title", full: true },
      { key: "seo_description", label: "SEO description", type: "textarea", full: true },
    ],
  },
];

function seedFrom(record) {
  const seed = {};
  KEYS.forEach((key) => {
    // A saved value (even a blank one) is kept; never-saved fields start from
    // the text the site currently shows.
    seed[key] = typeof record?.[key] === "string" ? record[key] : CONTENT_DEFAULTS[key] ?? "";
  });
  return seed;
}

function WebsiteEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("");

  const { data: published } = useQuery({
    queryKey: ["content-published"],
    queryFn: async () => (await listRecords("WebsiteContent", { key: "main" }, { limit: 1 }))[0] || null,
  });
  const { data: draft } = useQuery({
    queryKey: ["content-draft"],
    queryFn: async () => (await listRecords("WebsiteContent", { key: "main-draft" }, { limit: 1 }))[0] || null,
  });

  useEffect(() => {
    if (form) return;
    if (draft === undefined || published === undefined) return;
    setForm(seedFrom(draft || published));
  }, [draft, published, form]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["content-published"] });
    queryClient.invalidateQueries({ queryKey: ["content-draft"] });
  };

  const saveDraft = async () => {
    try {
      const payload = { ...form, key: "main-draft", status: "draft" };
      if (draft) await db.entities.WebsiteContent.update(draft.id, payload);
      else await db.entities.WebsiteContent.create(payload);
      await refresh();
      setStatus("Draft saved. The live site is unchanged.");
    } catch (error) {
      setStatus(`Not saved: ${error?.message || "please try again."}`);
    }
  };

  const publish = async () => {
    try {
      const payload = { ...form, key: "main", status: "published" };
      if (published) await db.entities.WebsiteContent.update(published.id, payload);
      else await db.entities.WebsiteContent.create(payload);
      await refresh();
      await router.invalidate();
      setStatus("Published. Your live website now shows these changes.");
    } catch (error) {
      setStatus(`Not published: ${error?.message || "please try again."}`);
    }
  };

  const discard = () => {
    setForm(seedFrom(published));
    setStatus("Reverted to the published version.");
  };

  if (!form) {
    return <div className="h-64 animate-pulse rounded-sm border border-border bg-white" />;
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(seedFrom(published));

  return (
    <div className="space-y-5">
      <PageHeading
        title="Website editor"
        description="Edit the public site without touching code. Drafts never go live until you publish them."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium">
              <Eye className="h-3.5 w-3.5" /> Preview site
            </Link>
            <button type="button" onClick={discard} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium">
              <RotateCcw className="h-3.5 w-3.5" /> Revert
            </button>
            <button type="button" onClick={saveDraft} className="rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium">
              Save draft
            </button>
            <button type="button" onClick={publish} className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3.5 py-2 text-[11.5px] font-medium text-white">
              Publish changes <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 text-[11.5px]">
        {dirty ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
            Unpublished changes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
            <Check className="h-3 w-3" /> Live site matches this draft
          </span>
        )}
        {status && <span className="text-muted-foreground">{status}</span>}
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="rounded-sm border border-border bg-white">
          <h2 className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {section.title}
          </h2>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <Field key={field.key} label={field.label} hint={field.hint} className={field.full ? "sm:col-span-2" : ""}>
                {field.type === "textarea" ? (
                  <textarea
                    className={`${inputClass} min-h-[110px] resize-y`}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                ) : field.type === "image" ? (
                  <ImageField
                    value={form[field.key]}
                    onChange={(value) => setForm((f) => ({ ...f, [field.key]: value }))}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                )}
              </Field>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}