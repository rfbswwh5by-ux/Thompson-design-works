import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Download, ExternalLink, FileUp, Save, Share2 } from "lucide-react";
import { db } from "@/lib/db-client";
import { Field, inputClass } from "@/components/admin/FormKit";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { sendCustomerEmail } from "@/lib/admin-fns";
import { StatusBadge } from "@/components/admin/ui";
import { formatDate, formatDateTime, listRecords, PROJECT_STAGES } from "@/lib/admin-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UPDATE_TYPES = ["Progress", "Milestone", "Feedback Request", "Revision"];

export function ProjectDetail({ project, customer, onRefresh, onBack }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(project);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [update, setUpdate] = useState({ title: "", body: "", update_type: "Progress", is_customer_visible: true });
  const [uploading, setUploading] = useState(false);

  const { data: updates = [] } = useQuery({
    queryKey: ["project-updates", project.id],
    queryFn: () => listRecords("ProjectUpdate", { project_id: project.id }, { sort: "-created_date", limit: 100 }),
  });
  const { data: files = [] } = useQuery({
    queryKey: ["project-files", project.id],
    queryFn: () => listRecords("ProjectFile", { project_id: project.id }, { sort: "-created_date", limit: 100 }),
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await db.entities.Project.update(project.id, {
        name: form.name,
        business_name: form.business_name,
        description: form.description,
        website_type: form.website_type,
        start_date: form.start_date,
        target_date: form.target_date,
        stage: form.stage,
        demo_url: form.demo_url,
        live_url: form.live_url,
        notes: form.notes,
      });
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const setStage = async (stage) => {
    setForm((f) => ({ ...f, stage }));
    await db.entities.Project.update(project.id, { stage });
    await onRefresh();
  };

  const shareMessage = `Hi ${customer?.full_name?.split(" ")[0] || "there"},\n\nYour website demo is ready for review:\n${form.demo_url || "[demo link]"}\n\nTake a look when you have a moment and send over your feedback — we will work through revisions from there.\n\nThank you,\nThompson’s Design Work`;

  const markShared = async () => {
    await db.entities.Project.update(project.id, {
      demo_shared: true,
      demo_shared_at: new Date().toISOString(),
      share_token: project.share_token || crypto.randomUUID(),
    });
    await onRefresh();
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    await markShared();
    setTimeout(() => setCopied(false), 2500);
  };

  const addUpdate = async (e) => {
    e.preventDefault();
    if (!update.title.trim()) return;
    await db.entities.ProjectUpdate.create({ project_id: project.id, ...update });
    setUpdate({ title: "", body: "", update_type: "Progress", is_customer_visible: true });
    queryClient.invalidateQueries({ queryKey: ["project-updates", project.id] });
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      await db.entities.ProjectFile.create({
        project_id: project.id,
        name: file.name,
        file_uri,
        file_type: file.type,
      });
      queryClient.invalidateQueries({ queryKey: ["project-files", project.id] });
    } catch (err) {
      toast.error(err?.message || "That file didn't upload. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const download = async (file) => {
    const { signed_url } = await db.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri });
    window.open(signed_url, "_blank", "noopener");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Projects
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge value={form.stage} />
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11.5px] font-medium"
          >
            <Share2 className="h-3.5 w-3.5" /> Share demo
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3.5 py-2 text-[12px] font-medium text-white disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Project name"><input className={inputClass} value={form.name || ""} onChange={set("name")} /></Field>
          <Field label="Business name"><input className={inputClass} value={form.business_name || ""} onChange={set("business_name")} /></Field>
          <Field label="Website type"><input className={inputClass} value={form.website_type || ""} onChange={set("website_type")} /></Field>
          <Field label="Stage">
            <select className={inputClass} value={form.stage || "New Client"} onChange={(e) => setStage(e.target.value)}>
              {PROJECT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Start date"><input type="date" className={inputClass} value={(form.start_date || "").slice(0, 10)} onChange={set("start_date")} /></Field>
          <Field label="Target completion"><input type="date" className={inputClass} value={(form.target_date || "").slice(0, 10)} onChange={set("target_date")} /></Field>
          <Field label="Demo URL"><input className={inputClass} value={form.demo_url || ""} onChange={set("demo_url")} placeholder="https://demo…" /></Field>
          <Field label="Live website URL"><input className={inputClass} value={form.live_url || ""} onChange={set("live_url")} placeholder="https://…" /></Field>
          <Field label="Project description" className="sm:col-span-2">
            <textarea className={`${inputClass} min-h-[80px] resize-y`} value={form.description || ""} onChange={set("description")} />
          </Field>
          <Field label="Private notes" className="sm:col-span-2">
            <textarea className={`${inputClass} min-h-[70px] resize-y`} value={form.notes || ""} onChange={set("notes")} />
          </Field>
        </div>

        <div className="rounded-sm border border-border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Client demo</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {project.demo_shared
                  ? `Shared with client on ${formatDateTime(project.demo_shared_at)}`
                  : "Not shared with the client yet."}
              </p>
            </div>
            {form.demo_url && (
              <a href={form.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-brand">
                Open demo <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-sm border border-border bg-white">
            <p className="border-b border-border px-4 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Project updates
            </p>
            <form onSubmit={addUpdate} className="space-y-2 border-b border-border p-3">
              <input className={inputClass} value={update.title} onChange={(e) => setUpdate((u) => ({ ...u, title: e.target.value }))} placeholder="Update title" />
              <textarea className={`${inputClass} min-h-[60px] resize-y`} value={update.body} onChange={(e) => setUpdate((u) => ({ ...u, body: e.target.value }))} placeholder="What changed?" />
              <div className="flex gap-2">
                <select className={`${inputClass} py-1.5 text-[12px]`} value={update.update_type} onChange={(e) => setUpdate((u) => ({ ...u, update_type: e.target.value }))}>
                  {UPDATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button type="submit" className="shrink-0 rounded-sm bg-obsidian px-3 text-[11.5px] font-medium text-white">Add</button>
              </div>
            </form>
            {updates.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-muted-foreground">No updates logged yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {updates.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px] font-medium">{item.title}</p>
                      <StatusBadge value={item.update_type} />
                    </div>
                    {item.body && <p className="mt-1 whitespace-pre-wrap text-[11.5px] text-muted-foreground">{item.body}</p>}
                    <p className="mt-1 font-mono text-[9.5px] text-muted-foreground">{formatDateTime(item.created_date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-sm border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Project files</p>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11.5px] text-brand">
                <FileUp className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                <input type="file" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0])} />
              </label>
            </div>
            {files.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-muted-foreground">No files yet. Files are kept off the public site, under unguessable links.</p>
            ) : (
              <ul className="divide-y divide-border">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px]">{file.name}</p>
                      <p className="font-mono text-[9.5px] text-muted-foreground">{formatDate(file.created_date)}</p>
                    </div>
                    <button type="button" onClick={() => download(file)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Download">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {customer && <EmailComposer customer={customer} projectId={project.id} />}
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Share demo with client</DialogTitle>
            <DialogDescription className="text-[12.5px]">
              Send the demo link and a short note. Sharing is recorded on the project.
            </DialogDescription>
          </DialogHeader>

          {!form.demo_url ? (
            <p className="rounded-sm border border-border bg-secondary/60 px-3 py-3 text-[12.5px]">
              Add a demo URL to this project first, then share it.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-sm border border-border bg-secondary/50 px-3 py-2 font-mono text-[11.5px] break-all">
                {form.demo_url}
              </div>
              <textarea readOnly className={`${inputClass} min-h-[150px] resize-none font-mono text-[11.5px]`} value={shareMessage} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyMessage}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[12px] font-medium"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy message"}
                </button>
                {customer?.email && (
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await sendCustomerEmail({
                        data: {
                          customer_id: customer.id,
                          project_id: project.id,
                          subject: "Your website demo is ready for review",
                          body: shareMessage,
                        },
                      });
                      if (result.ok) await markShared();
                      else toast.error(result.error || "The email was not sent.");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3 py-2 text-[12px] font-medium text-white"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Email to customer
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                The customer portal itself is prepared in the data model but not yet enabled — nothing is shown to the
                client here that does not exist.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}