import { createFileRoute } from "@tanstack/react-router";
import { EntityManager } from "@/components/admin/EntityManager";

export const Route = createFileRoute("/_authed/admin/faqs")({
  component: FaqsAdmin,
  head: () => ({ meta: [{ title: "FAQs — Thompson’s Design Work" }] }),
});

const FIELDS = [
  { name: "question", label: "Question", full: true },
  { name: "answer", label: "Answer", type: "textarea", full: true },
  { name: "category", label: "Category", hint: "optional" },
  { name: "is_published", label: "Published", type: "switch" },
];

function FaqsAdmin() {
  return (
    <EntityManager
      entity="Faq"
      queryKey={["admin-faqs"]}
      fields={FIELDS}
      defaults={{ is_published: true }}
      addLabel="Add question"
      searchPlaceholder="Search questions…"
      searchKeys={["question", "answer"]}
      emptyTitle="No questions yet"
      emptyDescription="Questions you add here appear on the public FAQ page and the homepage."
      renderItem={(item) => (
        <div>
          <p className="text-[13.5px] font-medium">{item.question}</p>
          <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">{item.answer}</p>
        </div>
      )}
    />
  );
}