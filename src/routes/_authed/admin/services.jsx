import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/admin/EntityManager";
import { SERVICE_ICONS } from "@/lib/serviceIcons";
import { slugify } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/services")({
  component: ServicesAdmin,
  head: () => ({ meta: [{ title: "Services — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "name", label: "Service name", full: true },
  { name: "slug", label: "URL anchor", hint: "lowercase-with-dashes" },
  { name: "icon", label: "Icon", type: "select", options: Object.keys(SERVICE_ICONS) },
  { name: "summary", label: "Short summary", type: "textarea", full: true },
  { name: "description", label: "Full description", type: "textarea", full: true },
  { name: "benefits", label: "Benefits", type: "list", full: true, hint: "One per line" },
  { name: "image_url", label: "Supporting image", type: "image", full: true },
  { name: "is_published", label: "Published", type: "switch" },
];

function ServicesAdmin() {
  return (
    <EntityManager
      entity="Service"
      queryKey={["admin-services"]}
      fields={FIELDS}
      defaults={{ is_published: true, icon: "Sparkles", benefits: [] }}
      addLabel="Add service"
      searchPlaceholder="Search services…"
      searchKeys={["name", "summary", "category"]}
      emptyTitle="No services yet"
      emptyDescription="Add the services you offer. Published services appear on the services page."
      renderItem={(item) => (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13.5px] font-medium">{item.name}</p>
            <span className="font-mono text-[10px] text-muted-foreground">#{item.slug || slugify(item.name)}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{item.summary || item.description}</p>
          {item.benefits?.length > 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground/80">{item.benefits.length} benefits listed</p>
          )}
        </div>
      )}
    />
  );
}