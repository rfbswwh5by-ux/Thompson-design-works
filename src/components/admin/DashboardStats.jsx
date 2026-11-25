import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db-client";
import { StatCard } from "@/components/admin/ui";

export function DashboardStats() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [total, unread, potential, active, review, completed] = await Promise.all([
        db.entities.Inquiry.count({}),
        db.entities.Inquiry.count({ is_read: false }),
        db.entities.Customer.count({ status: "Potential Customer" }),
        db.entities.Project.count({ stage: { $nin: ["Completed", "Website Launched"] } }),
        db.entities.Project.count({ stage: "Client Review" }),
        db.entities.Project.count({ stage: { $in: ["Completed", "Website Launched"] } }),
      ]);
      return { total, unread, potential, active, review, completed };
    },
  });

  const cards = [
    { label: "Total inquiries", value: data?.total ?? 0, hint: "All time" },
    { label: "Unread inquiries", value: data?.unread ?? 0, hint: "Awaiting review", accent: data?.unread ? "text-brand" : undefined },
    { label: "Potential customers", value: data?.potential ?? 0, hint: "Not yet active" },
    { label: "Active projects", value: data?.active ?? 0, hint: "In progress" },
    { label: "Awaiting client review", value: data?.review ?? 0, hint: "Client Review stage" },
    { label: "Completed projects", value: data?.completed ?? 0, hint: "Completed or launched" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}