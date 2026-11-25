import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/lib/db-client";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { Field, inputClass } from "@/components/admin/FormKit";
import { StatusBadge } from "@/components/admin/ui";
import { CUSTOMER_STATUSES, formatDate, listRecords } from "@/lib/admin-api";

export function CustomerDetail({ customer, onRefresh, onBack }) {
  const [form, setForm] = useState(customer);
  const [saving, setSaving] = useState(false);

  const { data: inquiries = [] } = useQuery({
    queryKey: ["customer-inquiries", customer.id],
    queryFn: () => listRecords("Inquiry", { customer_id: customer.id }, { sort: "-created_date", limit: 50 }),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["customer-projects", customer.id],
    queryFn: () => listRecords("Project", { customer_id: customer.id }, { sort: "-created_date", limit: 50 }),
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await db.entities.Customer.update(customer.id, {
        full_name: form.full_name,
        business_name: form.business_name,
        email: form.email,
        phone: form.phone,
        industry: form.industry,
        website: form.website,
        status: form.status,
        notes: form.notes,
      });
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground lg:hidden">
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </button>
        <div className="hidden items-center gap-2 lg:flex">
          <StatusBadge value={customer.status} />
          <span className="font-mono text-[10px] text-muted-foreground">Added {formatDate(customer.created_date)}</span>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3.5 py-2 text-[12px] font-medium text-white disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name"><input className={inputClass} value={form.full_name || ""} onChange={set("full_name")} /></Field>
          <Field label="Business name"><input className={inputClass} value={form.business_name || ""} onChange={set("business_name")} /></Field>
          <Field label="Email"><input className={inputClass} value={form.email || ""} onChange={set("email")} /></Field>
          <Field label="Phone"><input className={inputClass} value={form.phone || ""} onChange={set("phone")} /></Field>
          <Field label="Industry"><input className={inputClass} value={form.industry || ""} onChange={set("industry")} /></Field>
          <Field label="Current website"><input className={inputClass} value={form.website || ""} onChange={set("website")} /></Field>
          <Field label="Customer status">
            <select className={inputClass} value={form.status || "Potential Customer"} onChange={set("status")}>
              {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Private notes — never shown to the customer" className="sm:col-span-2">
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={form.notes || ""} onChange={set("notes")} />
          </Field>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-sm border border-border bg-white">
            <p className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Inquiry history
            </p>
            {inquiries.length === 0 ? (
              <p className="px-4 py-5 text-[12px] text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {inquiries.map((inquiry) => (
                  <li key={inquiry.id} className="px-4 py-3">
                    <Link
                      to="/admin/inbox"
                      search={{ id: inquiry.id }}
                      className="flex items-center justify-between gap-3 text-[12.5px] hover:text-brand"
                    >
                      <span className="truncate">{inquiry.website_type || "Website inquiry"}</span>
                      <StatusBadge value={inquiry.status} />
                    </Link>
                    <p className="mt-1 font-mono text-[9.5px] text-muted-foreground">{formatDate(inquiry.created_date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-sm border border-border bg-white">
            <p className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Projects
            </p>
            {projects.length === 0 ? (
              <p className="px-4 py-5 text-[12px] text-muted-foreground">No projects linked yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {projects.map((project) => (
                  <li key={project.id} className="px-4 py-3">
                    <Link
                      to="/admin/projects"
                      search={{ id: project.id }}
                      className="flex items-center justify-between gap-3 text-[12.5px] hover:text-brand"
                    >
                      <span className="truncate">{project.name}</span>
                      <StatusBadge value={project.stage} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <EmailComposer customer={customer} />
      </div>
    </div>
  );
}