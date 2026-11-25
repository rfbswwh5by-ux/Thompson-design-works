import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/admin/EntityManager";

export const Route = createFileRoute("/_authed/admin/testimonials")({
  component: TestimonialsAdmin,
  head: () => ({ meta: [{ title: "Testimonials — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "customer_name", label: "Customer name" },
  { name: "business_name", label: "Business name" },
  { name: "quote", label: "Testimonial", type: "textarea", full: true },
  { name: "photo_url", label: "Photo or logo", type: "image", full: true },
  { name: "rating", label: "Rating (1-5)", type: "number" },
  { name: "is_featured", label: "Featured", type: "switch" },
  { name: "is_published", label: "Published", type: "switch" },
];

function TestimonialsAdmin() {
  return (
    <EntityManager
      entity="Testimonial"
      queryKey={["admin-testimonials"]}
      fields={FIELDS}
      defaults={{ is_published: true, is_featured: false }}
      addLabel="Add testimonial"
      searchPlaceholder="Search testimonials…"
      searchKeys={["customer_name", "business_name", "quote"]}
      emptyTitle="No testimonials yet"
      emptyDescription="Only add testimonials you have permission to publish. Nothing is invented for you."
      renderItem={(item) => (
        <div>
          <p className="text-[13.5px] font-medium">
            {item.customer_name}
            {item.business_name ? ` · ${item.business_name}` : ""}
          </p>
          <p className="mt-1 line-clamp-2 text-[12px] italic text-muted-foreground">“{item.quote}”</p>
          {item.rating ? <p className="mt-1 text-[11px] text-muted-foreground">{item.rating} / 5</p> : null}
        </div>
      )}
    />
  );
}