import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus } from "lucide-react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ProjectsByStage } from "@/components/admin/ProjectsByStage";
import { RecentInquiries } from "@/components/admin/RecentInquiries";
import { PageHeading, StatusBadge, EmptyState } from "@/components/admin/ui";
import { listRecords, PROJECT_STAGES } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — Thompson’s Design Work" }] }),
});

function DashboardPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => listRecords("Project", {}, { sort: "-updated_date", limit: 200 }),
  });

  const active = projects.filter((p) => !["Completed", "Website Launched"].includes(p.stage));
  const nextStages = active
    .slice()
    .sort((a, b) => {
      const ai = PROJECT_STAGES.indexOf(a.stage);
      const bi = PROJECT_STAGES.indexOf(b.stage);
      return bi - ai;
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Studio overview"
        description="Live figures from your database — nothing is estimated or simulated."
        actions={
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-2 rounded-sm bg-obsidian px-4 py-2.5 text-[12.5px] font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New project
          </Link>
        }
      />

      <DashboardStats />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentInquiries />
        <ProjectsByStage />
      </div>

      <div className="rounded-sm border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Active projects — furthest along first
          </p>
          <Link to="/admin/projects" className="inline-flex items-center gap-1 text-[11.5px] text-brand">
            All projects <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {nextStages.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No active projects"
              description="When an inquiry becomes a customer, create a project to track it here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {nextStages.map((project) => (
              <li key={project.id}>
                <Link
                  to="/admin/projects"
                  search={{ id: project.id }}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-secondary/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{project.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                      {project.business_name || "—"}
                    </p>
                  </div>
                  <StatusBadge value={project.stage} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}