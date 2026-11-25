import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Search } from "lucide-react";
import { InquiryDetail } from "@/components/admin/InquiryDetail";
import { EmptyState, PageHeading, StatusBadge } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/FormKit";
import { formatDate, INQUIRY_STATUSES, listRecords } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/inbox")({
  validateSearch: (search) => ({ id: typeof search.id === "string" ? search.id : undefined }),
  component: InboxPage,
  head: () => ({ meta: [{ title: "Inbox — Thompson’s Design Work" }] }),
});

function InboxPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("newest");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: () => listRecords("Inquiry", {}, { sort: "-created_date", limit: 200 }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });

  const filtered = useMemo(() => {
    let rows = inquiries;
    if (status === "Unread") rows = rows.filter((r) => !r.is_read);
    else if (status !== "All") rows = rows.filter((r) => r.status === status);
    if (q) {
      const term = q.toLowerCase();
      rows = rows.filter((r) =>
        [r.full_name, r.business_name, r.email, r.project_description, r.website_type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term)),
      );
    }
    return sort === "newest" ? rows : rows.slice().reverse();
  }, [inquiries, q, status, sort]);

  const selected = inquiries.find((r) => r.id === id) || null;
  const unread = inquiries.filter((r) => !r.is_read).length;

  return (
    <div className="space-y-5">
      <PageHeading
        title="Inbox"
        description={`${inquiries.length} inquiries · ${unread} unread. Every contact form submission lands here immediately.`}
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className={`rounded-sm border border-border bg-white ${selected ? "hidden lg:block" : ""}`}>
          <div className="space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className={`${inputClass} pl-9`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, business, email…"
              />
            </div>
            <div className="flex gap-2">
              <select className={`${inputClass} py-1.5 text-[12px]`} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All statuses</option>
                <option value="Unread">Unread only</option>
                {INQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11.5px] font-medium"
              >
                <ArrowUpDown className="h-3 w-3" /> {sort === "newest" ? "Newest" : "Oldest"}
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-sm bg-secondary/60" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title={inquiries.length ? "No matches" : "No inquiries yet"}
                  description={
                    inquiries.length
                      ? "Adjust your search or filter."
                      : "Submissions from the public contact form will appear here."
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((inquiry) => (
                  <li key={inquiry.id}>
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/admin/inbox", search: { id: inquiry.id } })}
                      className={`flex w-full items-start gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-secondary/50 ${
                        inquiry.id === id ? "bg-secondary/70" : ""
                      }`}
                    >
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${inquiry.is_read ? "bg-transparent" : "bg-brand"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-[12.5px] ${inquiry.is_read ? "" : "font-semibold"}`}>
                            {inquiry.full_name}
                          </span>
                          <span className="shrink-0 font-mono text-[9.5px] text-muted-foreground">
                            {formatDate(inquiry.created_date)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                          {inquiry.business_name || inquiry.email}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5">
                          <StatusBadge value={inquiry.status} />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="min-h-[420px] rounded-sm border border-border bg-white">
          {selected ? (
            <InquiryDetail
              inquiry={selected}
              onRefresh={refresh}
              onBack={() => navigate({ to: "/admin/inbox", search: {} })}
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center p-6">
              <EmptyState
                title="Select a message"
                description="Open an inquiry to read the full message, update its status and keep private notes."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}