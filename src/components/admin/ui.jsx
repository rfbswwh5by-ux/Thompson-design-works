import { cn } from "@/lib/utils";

const TONES = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  gray: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const MAP = {
  New: "blue",
  Contacted: "yellow",
  "In Discussion": "purple",
  "Proposal Sent": "pink",
  Won: "green",
  Lost: "red",
  "Potential Customer": "blue",
  "Active Customer": "green",
  "Previous Customer": "gray",
  "Not Interested": "red",
  "New Client": "blue",
  "Initial Consultation": "blue",
  "Project Requirements": "yellow",
  "Design & Development": "purple",
  "Internal Review": "yellow",
  "Demo Ready": "pink",
  "Client Review": "yellow",
  "Revisions Requested": "red",
  "Final Approval": "yellow",
  Completed: "green",
  "Website Launched": "green",
  Sent: "green",
  Failed: "red",
  Outbound: "blue",
  Inbound: "gray",
  published: "green",
  draft: "gray",
};

export function StatusBadge({ value, className }) {
  const tone = TONES[MAP[value] || "gray"];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-medium",
        tone,
        className,
      )}
    >
      {value}
    </span>
  );
}

export function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-sm border border-border bg-white p-5">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn("mt-3 font-heading text-[28px] font-medium leading-none tracking-tight", accent)}>
        {value}
      </p>
      {hint && <p className="mt-2 text-[11.5px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-white/60 px-6 py-14 text-center">
      <p className="font-heading text-[15px] font-medium">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeading({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <h1 className="font-heading text-[26px] font-medium tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}