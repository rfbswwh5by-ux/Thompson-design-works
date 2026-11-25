import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { db } from "@/lib/db-client";
import { RecordDialog, inputClass } from "@/components/admin/FormKit";
import { EmptyState, PageHeading, StatusBadge } from "@/components/admin/ui";
import { listRecords } from "@/lib/admin-api";
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

/**
 * Shared manager for the public website collections: create, edit, publish,
 * unpublish, reorder and delete, with changes live on the site immediately.
 */
export function EntityManager({
  entity,
  queryKey,
  fields,
  defaults = {},
  renderItem,
  emptyTitle,
  emptyDescription,
  addLabel = "Add new",
  searchPlaceholder = "Search…",
  searchKeys = ["name", "title", "question"],
  reorder = true,
}) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [q, setQ] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listRecords(entity, {}, { sort: "sort_order", limit: 200 }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const save = async (values) => {
    if (editing) await db.entities[entity].update(editing.id, values);
    else {
      const nextOrder = items.length ? Math.max(...items.map((i) => Number(i.sort_order) || 0)) + 1 : 0;
      await db.entities[entity].create({ ...defaults, sort_order: nextOrder, ...values });
    }
    await refresh();
  };

  const togglePublished = async (item) => {
    await db.entities[entity].update(item.id, { is_published: !item.is_published });
    await refresh();
  };

  const move = async (item, direction) => {
    const index = items.findIndex((i) => i.id === item.id);
    const neighbor = items[index + direction];
    if (!neighbor) return;
    const a = Number(item.sort_order) || index;
    const b = Number(neighbor.sort_order) || index + direction;
    await db.entities[entity].update(item.id, { sort_order: b });
    await db.entities[entity].update(neighbor.id, { sort_order: a });
    await refresh();
  };

  const remove = async () => {
    if (!pendingDelete) return;
    await db.entities[entity].delete(pendingDelete.id);
    setPendingDelete(null);
    await refresh();
  };

  const filtered = q
    ? items.filter((item) =>
        searchKeys.some((key) => String(item[key] || "").toLowerCase().includes(q.toLowerCase())),
      )
    : items;

  return (
    <div className="space-y-6">
      <PageHeading
        title={entity === "PortfolioProject" ? "Portfolio" : entity === "Faq" ? "FAQs" : `${entity}s`}
        description="Changes appear on the public website as soon as a record is published."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-sm bg-obsidian px-4 py-2.5 text-[12.5px] font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> {addLabel}
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          className={`${inputClass} pl-9`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-sm border border-border bg-white" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={emptyTitle || "Nothing here yet"}
          description={emptyDescription || "Add your first record to publish it on the site."}
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li key={item.id} className="rounded-sm border border-border bg-white">
              <div className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  {renderItem(item, { onEdit: () => { setEditing(item); setDialogOpen(true); }, onToggle: () => togglePublished(item) })}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {reorder && (
                    <>
                      <button type="button" onClick={() => move(item, -1)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Move up">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => move(item, 1)} className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Move down">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className="rounded-sm px-2 py-1.5"
                    aria-label="Toggle published"
                  >
                    <StatusBadge value={item.is_published ? "published" : "draft"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setDialogOpen(true);
                    }}
                    className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    className="rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit record" : addLabel}
        fields={fields}
        initial={editing || defaults}
        onSubmit={save}
        submitLabel={editing ? "Save changes" : "Create"}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it permanently and takes it off the public website. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}