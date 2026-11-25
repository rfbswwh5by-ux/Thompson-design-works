import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { listRecords, formatDateTime } from "@/lib/admin-api";
import { EmptyState, StatusBadge } from "@/components/admin/ui";

export function RecentInquiries() {
  const { data = [] } = useQuery({
    queryKey: ["admin-recent-inquiries"],
    queryFn: () => listRecords("Inquiry", {}, { sort: "-created_date", limit: 6 }),
  });

  return (
    <div className="rounded-sm border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Recent messages</p>
        <Link to="/admin/inbox" className="inline-flex items-center gap-1 text-[11.5px] text-brand">
          Open inbox <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="p-5">
          <EmptyState title="No inquiries yet" description="Messages from the contact form will appear here." />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                to="/admin/inbox"
                search={{ id: inquiry.id }}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/50"
              >
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    inquiry.is_read ? "bg-transparent" : "bg-brand"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate text-[13px] ${inquiry.is_read ? "" : "font-semibold"}`}>
                      {inquiry.full_name}
                      {inquiry.business_name ? ` · ${inquiry.business_name}` : ""}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatDateTime(inquiry.created_date)}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                    {inquiry.website_type || "Website inquiry"} — {inquiry.project_description}
                  </span>
                </span>
                <StatusBadge value={inquiry.status} className="mt-0.5 hidden sm:inline-flex" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}