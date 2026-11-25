import { Reveal } from "@/components/site/Reveal";
import { WHY_US } from "@/lib/site-defaults";

export function WhyUs() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rule-grid opacity-60" />
      <div className="relative mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <p className="eyebrow">Why businesses choose us</p>
          <h2 className="mt-3 max-w-2xl font-heading text-[clamp(1.9rem,3.8vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            A studio small enough to care about the details, structured enough to deliver them.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {WHY_US.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07}>
              <div className="group h-full bg-background p-7 transition-colors duration-500 hover:bg-white sm:p-9">
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-[17px] font-medium">{item.title}</h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">{item.body}</p>
                <span className="mt-6 block h-px w-8 bg-brand transition-all duration-500 group-hover:w-16" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}