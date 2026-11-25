import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db-client";
import { EmptyState } from "@/components/admin/ui";

export function ProjectsByStage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-projects-by-stage"],
    queryFn: async () => {
      const result = await db.entities.Project.aggregate({ groupBy: "stage" });
      return (result?.rows ?? []).filter((row) => row.count > 0).sort((a, b) => b.count - a.count);
    },
  });

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-sm border border-border bg-white p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Project status overview</p>
        <span className="font-mono text-[10px] text-muted-foreground">{data.length} stages</span>
      </div>

      {isLoading ? (
        <div className="mt-6 h-32 animate-pulse rounded-sm bg-secondary/60" />
      ) : data.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No projects yet" description="Create your first project to see the pipeline here." />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {data.map((row) => (
            <li key={row.stage}>
              <div className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="truncate text-foreground/75">{row.stage}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{row.count}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(6, (row.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}