import { Reveal } from "@/components/site/Reveal";

export function PageIntro({ eyebrow, title, accent, description, children }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rule-grid opacity-60" />
      <div className="relative mx-auto max-w-[1240px] px-5 pb-14 pt-32 sm:px-8 sm:pb-20 sm:pt-40">
        <Reveal>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-4 max-w-4xl font-heading text-[clamp(2.4rem,5.6vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            {title}
            {accent && <span className="display italic text-brand"> {accent}</span>}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-muted-foreground">{description}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}