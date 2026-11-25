import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, FolderPlus, Mail, Phone, Trash2 } from "lucide-react";
import { db } from "@/lib/db-client";
import { inputClass } from "@/components/admin/FormKit";
import { StatusBadge } from "@/components/admin/ui";
import { formatDateTime, INQUIRY_STATUSES, listRecords } from "@/lib/admin-api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function InquiryDetail({ inquiry, onRefresh, onBack }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [creating, setCreating] = useState(false);

  const { data: notes = [] } = useQuery({
    queryKey: ["inquiry-notes", inquiry.id],
    queryFn: () => listRecords("InquiryNote", { inquiry_id: inquiry.id }, { sort: "-created_date", limit: 100 }),
  });

  const update = async (patch) => {
    await db.entities.Inquiry.update(inquiry.id, patch);
    await onRefresh();
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await db.entities.InquiryNote.create({ inquiry_id: inquiry.id, body: note.trim() });
    setNote("");
    await queryClient.invalidateQueries({ queryKey: ["inquiry-notes", inquiry.id] });
  };

  const createProject = async () => {
    setCreating(true);
    try {
      const project = await db.entities.Project.create({
        name: `${inquiry.business_name || inquiry.full_name} — Website`,
        customer_id: inquiry.customer_id,
        business_name: inquiry.business_name,
        description: inquiry.project_description,
        website_type: inquiry.website_type,
        stage: "New Client",
      });
      await db.entities.Inquiry.update(inquiry.id, { status: "Won" });
      await onRefresh();
      navigate({ to: "/admin/projects", search: { id: project.id } });
    } finally {
      setCreating(false);
    }
  };

  const remove = async () => {
    await db.entities.Inquiry.delete(inquiry.id);
    setConfirmDelete(false);
    navigate({ to: "/admin/inbox", search: {} });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground lg:hidden">
          <ArrowLeft className="h-3.5 w-3.5" /> Inbox
        </button>
        <div className="hidden items-center gap-2 lg:flex">
          <StatusBadge value={inquiry.status} />
          <span className="font-mono text-[10px] text-muted-foreground">{formatDateTime(inquiry.created_date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => update({ is_read: !inquiry.is_read })}
            className="rounded-sm border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-secondary"
          >
            {inquiry.is_read ? "Mark unread" : "Mark read"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="rounded-sm p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete inquiry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="font-heading text-[20px] font-medium">{inquiry.full_name}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {inquiry.business_name || "No business name"} · {inquiry.website_type || "Website inquiry"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`mailto:${inquiry.email}`}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] hover:border-foreground/30"
          >
            <Mail className="h-3 w-3" /> {inquiry.email}
          </a>
          {inquiry.phone && (
            <a
              href={`tel:${inquiry.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] hover:border-foreground/30"
            >
              <Phone className="h-3 w-3" /> {inquiry.phone}
            </a>
          )}
          {inquiry.customer_id && (
            <Link
              to="/admin/customers"
              search={{ id: inquiry.customer_id }}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] hover:border-foreground/30"
            >
              Customer profile
            </Link>
          )}
        </div>

        <div className="mt-6 rounded-sm border border-border bg-white p-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Project description</p>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed">{inquiry.project_description}</p>
          {inquiry.additional_info && (
            <>
              <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Additional information
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/80">
                {inquiry.additional_info}
              </p>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 text-[11.5px] text-muted-foreground">
            <span>Budget: {inquiry.budget || "Not specified"}</span>
            <span>Received: {formatDateTime(inquiry.submitted_at || inquiry.created_date)}</span>
            <span>Source: {inquiry.source || "Website"}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Status</span>
          <select
            className={`${inputClass} max-w-[190px] py-1.5`}
            value={inquiry.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={createProject}
            disabled={creating}
            className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3 py-1.5 text-[11.5px] font-medium text-white disabled:opacity-60"
          >
            <FolderPlus className="h-3 w-3" /> {creating ? "Creating…" : "Create project"}
          </button>
        </div>

        <div className="mt-7">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Private notes — never shown to the customer
          </p>
          <form onSubmit={addNote} className="mt-2 flex gap-2">
            <input
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this inquiry…"
            />
            <button type="submit" className="shrink-0 rounded-sm border border-border px-3 text-[12px] font-medium">
              <Check className="h-3.5 w-3.5" />
            </button>
          </form>
          {notes.length > 0 && (
            <ul className="mt-3 space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="rounded-sm bg-secondary/70 px-3 py-2">
                  <p className="whitespace-pre-wrap text-[12.5px]">{n.body}</p>
                  <p className="mt-1 font-mono text-[9.5px] text-muted-foreground">{formatDateTime(n.created_date)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              The message and its notes will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">
              Delete inquiry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}