import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { EntityManager } from "@/components/admin/EntityManager";
import { slugify } from "@/lib/admin-api";

export const Route = createFileRoute("/_authed/admin/portfolio")({
  component: PortfolioAdmin,
  head: () => ({ meta: [{ title: "Portfolio — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "title", label: "Project title" },
  { name: "slug", label: "URL slug", hint: "auto if blank" },
  { name: "business_name", label: "Business name" },
  { name: "industry", label: "Industry" },
  { name: "category", label: "Category", type: "select", options: ["Business", "Restaurant", "E-commerce", "Landing Page", "Redesign", "Other"] },
  { name: "description", label: "Project description", type: "textarea", full: true },
  { name: "thumbnail_url", label: "Thumbnail", type: "image", full: true },
  { name: "screenshots", label: "Screenshots", type: "list", full: true, hint: "One URL per line" },
  { name: "desktop_preview_url", label: "Desktop preview", type: "image", full: true },
  { name: "mobile_preview_url", label: "Mobile preview", type: "image", full: true },
  { name: "external_url", label: "Live website URL", full: true },
  { name: "tech", label: "Scope" },
  { name: "timeline", label: "Timeline" },
  { name: "is_featured", label: "Featured project", type: "switch" },
  { name: "is_concept", label: "Concept project", type: "switch", hint: "Labeled as a concept, not client work" },
  { name: "is_published", label: "Published", type: "switch" },
];

function PortfolioAdmin() {
  return (
    <EntityManager
      entity="PortfolioProject"
      queryKey={["admin-portfolio"]}
      fields={FIELDS}
      defaults={{ is_published: true, is_featured: false, is_concept: false, category: "Business" }}
      addLabel="Add project"
      searchPlaceholder="Search projects…"
      searchKeys={["title", "business_name", "industry"]}
      emptyTitle="No portfolio projects yet"
      emptyDescription="Add a project with a thumbnail and screenshots to show your work publicly."
      renderItem={(item) => (
        <div className="flex items-start gap-3">
          {item.thumbnail_url && (
            <div className="hidden w-20 shrink-0 overflow-hidden rounded-sm border border-border sm:block">
              <Image src={item.thumbnail_url} alt={item.title} fittingType="fill" className="aspect-[4/3] w-full" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[13.5px] font-medium">{item.title}</p>
              {item.is_featured && (
                <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-brand-ink">
                  Featured
                </span>
              )}
              {item.is_concept && (
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                  Concept
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {item.business_name} · {item.industry} · /portfolio/{item.slug || slugify(item.title)}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{item.description}</p>
          </div>
        </div>
      )}
    />
  );
}