import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageIntro } from "@/components/site/PageIntro";
import { Reveal } from "@/components/site/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { useSiteContent } from "@/components/site/SiteContentContext";

export const Route = createFileRoute("/_site/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Thompson’s Design Work" },
      {
        name: "description",
        content:
          "Answers about website development, pricing, timelines, redesigns, maintenance, e-commerce, mobile compatibility and revisions.",
      },
    ],
  }),
});

function FaqPage() {
  const { faqs, settings } = useSiteContent();

  return (
    <>
      <PageIntro
        eyebrow="Frequently asked"
        title="Straight answers,"
        accent="no runaround."
        description="If your question is not here, send it through the contact form — you will get a real answer."
      />

      <section className="mx-auto max-w-[900px] px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.id || faq.question} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="group py-6 text-left font-heading text-[16px] font-medium hover:no-underline [&>svg]:hidden">
                  <span className="flex flex-1 items-start justify-between gap-6">
                    <span className="flex gap-4">
                      <span className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {faq.question}
                    </span>
                    <Plus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-9 pr-8 text-[14px] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <FinalCta settings={settings} />
    </>
  );
}