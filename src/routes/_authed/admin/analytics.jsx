import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { db } from "@/lib/db-client";
import { PageHeading, StatCard, EmptyState } from "@/components/admin/ui";
import { listRecords } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Thompson’s Design Work" }] }),
});

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [inquiries, customers, won] = await Promise.all([
        listRecords("Inquiry", {}, { sort: "-created_date", limit: 500 }),
        db.entities.Customer.count({}),
        db.entities.Inquiry.count({ status: "Won" }),
      ]);
      return { inquiries, customers, won };
    },
  });

  const inquiries = data?.inquiries ?? [];
  const total = inquiries.length;
  const won = data?.won ?? 0;
  const conversion = total ? ((won / total) * 100).toFixed(1) : "0.0";

  const byMonth = {};
  inquiries.forEach((inquiry) => {
    const date = new Date(inquiry.created_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, count]) => ({
      month: new Date(`${month}-02`).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      count,
    }));

  const statuses = ["New", "Contacted", "In Discussion", "Proposal Sent", "Won", "Lost"];
  const byStatus = statuses.map((status) => ({
    status,
    count: inquiries.filter((i) => i.status === status).length,
  }));

  return (
    <div className="space-y-5">
      <PageHeading
        title="Analytics"
        description="Measured from your own database. Nothing here is estimated or invented."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inquiries received" value={total} hint="Recorded contact submissions" />
        <StatCard label="Inquiries won" value={won} hint="Status set to Won" />
        <StatCard label="Inquiry conversion" value={`${conversion}%`} hint="Won ÷ received" accent="text-brand" />
        <StatCard label="Customers" value={data?.customers ?? 0} hint="Total contact records" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-sm border border-border bg-white p-5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Inquiries per month
          </p>
          {trend.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No inquiry data yet" description="The chart fills in as inquiries arrive." />
            </div>
          ) : (
            <div className="mt-5 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#E7E7EA" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} stroke="#8A8A93" />
                  <YAxis tickLine={false} axisLine={false} fontSize={10} stroke="#8A8A93" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 4, border: "1px solid #E7E7EA", fontSize: 11 }}
                    labelStyle={{ fontSize: 11 }}
                  />
                  <Bar dataKey="count" name="Inquiries" fill="#4F46E5" radius={[2, 2, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-border bg-white p-5">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Inquiry pipeline</p>
          <ul className="mt-4 space-y-2.5">
            {byStatus.map((row) => (
              <li key={row.status} className="flex items-center justify-between gap-3 text-[12px]">
                <span className="text-foreground/75">{row.status}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-sm border border-dashed border-border bg-white/60 p-5">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Traffic analytics — setup required
        </p>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Visitors, page views, popular pages, traffic sources and device categories need an analytics service connected
          to the published site. None is connected yet, so this app shows no traffic figures rather than invented ones.
          Once a provider is connected, those metrics can be added here.
        </p>
      </div>
    </div>
  );
}