import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { db } from "@/lib/db-client";
import { ProjectDetail } from "@/components/admin/ProjectDetail";
import { EmptyState, PageHeading, StatusBadge } from "@/components/admin/ui";
import { RecordDialog, inputClass } from "@/components/admin/FormKit";
import { formatDate, listRecords, PROJECT_STAGES } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/projects")({
  validateSearch: (search) => ({ id: typeof search.id === "string" ? search.id : undefined }),
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "name", label: "Project name", full: true },
  { name: "customer_id", label: "Customer", type: "select", options: [] },
  { name: "business_name", label: "Business name" },
  { name: "website_type", label: "Website type" },
  { name: "stage", label: "Stage", type: "select", options: PROJECT_STAGES },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "target_date", label: "Target completion", type: "date" },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "demo_url", label: "Demo URL", full: true },
];

function ProjectsPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState("board");
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => listRecords("Project", {}, { sort: "-created_date", limit: 300 }),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => listRecords("Customer", {}, { sort: "full_name", limit: 300 }),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
  };

  const filtered = useMemo(() => {
    if (!q) return projects;
    const term = q.toLowerCase();
    return projects.filter((p) =>
      [p.name, p.business_name, p.website_type, p.stage]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [projects, q]);

  const selected = projects.find((p) => p.id === id) || null;
  const selectedCustomer = selected?.customer_id
    ? customers.find((c) => c.id === selected.customer_id)
    : null;

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.business_name ? `${c.full_name} — ${c.business_name}` : c.full_name,
  }));

  const create = async (values) => {
    const customer = customers.find((c) => c.id === values.customer_id);
    const created = await db.entities.Project.create({
      ...values,
      business_name: values.business_name || customer?.business_name || "",
      stage: values.stage || "New Client",
    });
    await refresh();
    navigate({ to: "/admin/projects", search: { id: created.id } });
  };

  const quickStage = async (project, stage) => {
    await db.entities.Project.update(project.id, { stage });
    await refresh();
  };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Projects"
        description="Every website project, from first conversation to launch."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-sm border border-border bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("board")}
                className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11.5px] ${view === "board" ? "bg-obsidian text-white" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11.5px] ${view === "list" ? "bg-obsidian text-white" : "text-muted-foreground"}`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-obsidian px-4 py-2.5 text-[12.5px] font-medium text-white"
            >
              <Plus className="h-3.5 w-3.5" /> New project
            </button>
          </div>
        }
      />

      {selected ? (
        <div className="rounded-sm border border-border bg-white">
          <ProjectDetail
            key={selected.id}
            project={selected}
            customer={selectedCustomer}
            onRefresh={refresh}
            onBack={() => navigate({ to: "/admin/projects", search: {} })}
          />
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input className={`${inputClass} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" />
          </div>

          {isLoading ? (
            <div className="h-40 animate-pulse rounded-sm border border-border bg-white" />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={projects.length ? "No matches" : "No projects yet"}
              description={projects.length ? "Adjust your search." : "Create a project when an inquiry becomes a customer."}
            />
          ) : view === "board" ? (
            <div className="flex gap-3 overflow-x-auto pb-3">
              {PROJECT_STAGES.map((stage) => {
                const column = filtered.filter((p) => p.stage === stage);
                return (
                  <div key={stage} className="w-[240px] shrink-0">
                    <div className="mb-2 flex items-center justify-between gap-2 px-1">
                      <p className="truncate text-[11px] font-medium text-foreground/70">{stage}</p>
                      <span className="font-mono text-[9.5px] text-muted-foreground">{column.length}</span>
                    </div>
                    <div className="min-h-[120px] space-y-2 rounded-sm border border-dashed border-border bg-white/50 p-2">
                      {column.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => navigate({ to: "/admin/projects", search: { id: project.id } })}
                          className="w-full rounded-sm border border-border bg-white p-3 text-left transition-shadow hover:shadow-sm"
                        >
                          <p className="truncate text-[12px] font-medium">{project.name}</p>
                          <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">{project.business_name || "—"}</p>
                          {project.target_date && (
                            <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">
                              Due {formatDate(project.target_date)}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-border bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    {["Project", "Business", "Stage", "Target", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr key={project.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => navigate({ to: "/admin/projects", search: { id: project.id } })}
                          className="text-[12.5px] font-medium hover:text-brand"
                        >
                          {project.name}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-muted-foreground">{project.business_name || "—"}</td>
                      <td className="px-3 py-2.5">
                        <select
                          className="rounded-sm border border-border bg-white px-2 py-1 text-[11px]"
                          value={project.stage}
                          onChange={(e) => quickStage(project, e.target.value)}
                        >
                          {PROJECT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10.5px] text-muted-foreground">{formatDate(project.target_date)}</td>
                      <td className="px-3 py-2.5"><StatusBadge value={project.stage} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="New project"
        description="Link it to a customer so the history stays connected."
        fields={FIELDS.map((f) => (f.name === "customer_id" ? { ...f, options: customerOptions, placeholder: "Select a customer" } : f))}
        initial={{ stage: "New Client" }}
        onSubmit={create}
        submitLabel="Create project"
      />
    </div>
  );
}