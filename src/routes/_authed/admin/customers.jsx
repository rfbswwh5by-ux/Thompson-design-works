import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db-client";
import { CustomerDetail } from "@/components/admin/CustomerDetail";
import { EmptyState, PageHeading, StatusBadge } from "@/components/admin/ui";
import { RecordDialog, inputClass } from "@/components/admin/FormKit";
import { CUSTOMER_STATUSES, formatDate, listRecords } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/customers")({
  validateSearch: (search) => ({ id: typeof search.id === "string" ? search.id : undefined }),
  component: CustomersPage,
  head: () => ({ meta: [{ title: "Customers — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "full_name", label: "Full name" },
  { name: "business_name", label: "Business name" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "industry", label: "Industry" },
  { name: "status", label: "Status", type: "select", options: CUSTOMER_STATUSES },
  { name: "notes", label: "Private notes", type: "textarea", full: true },
];

function CustomersPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => listRecords("Customer", {}, { sort: "-created_date", limit: 300 }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] });

  const filtered = useMemo(() => {
    let rows = customers;
    if (status !== "All") rows = rows.filter((c) => c.status === status);
    if (q) {
      const term = q.toLowerCase();
      rows = rows.filter((c) =>
        [c.full_name, c.business_name, c.email, c.phone, c.industry]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)),
      );
    }
    return rows;
  }, [customers, q, status]);

  const selected = customers.find((c) => c.id === id) || null;

  const create = async (values) => {
    const created = await db.entities.Customer.create({ ...values, source: "Added manually" });
    await refresh();
    navigate({ to: "/admin/customers", search: { id: created.id } });
  };

  return (
    <div className="space-y-5">
      <PageHeading
        title="Customers"
        description="Every inquiry creates a customer record automatically. Add existing clients manually here."
        actions={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm bg-obsidian px-4 py-2.5 text-[12.5px] font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" /> Add customer
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className={`rounded-sm border border-border bg-white ${selected ? "hidden lg:block" : ""}`}>
          <div className="space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input className={`${inputClass} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" />
            </div>
            <select className={`${inputClass} py-1.5 text-[12px]`} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All customers</option>
              {CUSTOMER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-sm bg-secondary/60" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-4">
                <EmptyState title={customers.length ? "No matches" : "No customers yet"} description={customers.length ? "Adjust your search." : "Customers appear here from inquiries, or add one manually."} />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((customer) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/admin/customers", search: { id: customer.id } })}
                      className={`w-full px-3.5 py-3 text-left transition-colors hover:bg-secondary/50 ${customer.id === id ? "bg-secondary/70" : ""}`}
                    >
                      <p className="truncate text-[12.5px] font-medium">{customer.full_name}</p>
                      <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{customer.business_name || customer.email}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <StatusBadge value={customer.status} />
                        <span className="font-mono text-[9.5px] text-muted-foreground">{formatDate(customer.created_date)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="min-h-[420px] rounded-sm border border-border bg-white">
          {selected ? (
            <CustomerDetail
              key={selected.id}
              customer={selected}
              onRefresh={refresh}
              onBack={() => navigate({ to: "/admin/customers", search: {} })}
            />
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center p-6">
              <EmptyState title="Select a customer" description="Open a profile to edit details, review history and send an email." />
            </div>
          )}
        </div>
      </div>

      <RecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Add customer"
        fields={FIELDS}
        initial={{ status: "Potential Customer" }}
        onSubmit={create}
        submitLabel="Add customer"
      />
    </div>
  );
}