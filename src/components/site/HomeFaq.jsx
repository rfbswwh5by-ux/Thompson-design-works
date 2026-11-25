import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";
import { FAQS } from "@/lib/site-defaults";

export function HomeFaq({ faqs = FAQS.slice(0, 5) }) {
  return (
    <section className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">Questions</p>
          <h2 className="mt-3 font-heading text-[clamp(1.8rem,3.2vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            Answers before
            <br />
            you ask.
          </h2>
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-muted-foreground">
            Still unsure about something? Ask directly — you will get a real answer, not a sales pitch.
          </p>
          <Link
            to="/faq"
            className="group mt-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-brand"
          >
            All questions
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.id || faq.question} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="group py-5 text-left font-heading text-[15.5px] font-medium hover:no-underline [&>svg]:hidden">
                  <span className="flex flex-1 items-center justify-between gap-6">
                    {faq.question}
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pr-8 text-[14px] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}