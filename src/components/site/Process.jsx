import { Reveal } from "@/components/site/Reveal";
import { PROCESS } from "@/lib/site-defaults";

export function Process() {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="eyebrow">The process</p>
          <h2 className="mt-3 font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            Clear steps. No guesswork.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
            You always know what is happening, what comes next, and what is needed from you.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-14">
        <div aria-hidden="true" className="absolute left-0 right-0 top-[13px] hidden h-px bg-border lg:block" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {PROCESS.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.08}>
              <div className="relative">
                <span className="relative z-10 flex h-[27px] w-[27px] items-center justify-center rounded-full border border-border bg-background font-mono text-[9px] tracking-wider text-foreground">
                  {step.step}
                </span>
                <h3 className="mt-5 font-heading text-[16px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}