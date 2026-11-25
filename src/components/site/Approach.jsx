import { Reveal } from "@/components/site/Reveal";
import { APPROACH } from "@/lib/site-defaults";

export function Approach() {
  return (
    <section className="relative overflow-hidden bg-obsidian text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] noise" />
      <div className="relative mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Our approach</p>
            <h2 className="mt-5 font-heading text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.035em]">
              Most websites are built.
              <br />
              <span className="display italic text-white/55">Ours are considered.</span>
            </h2>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/55">
              There is no theme to stretch and no template to fill. Each project starts with your business, then earns
              every element on the page — from the first headline to the last footnote.
            </p>
            <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">Principles</span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-[10px] text-white/35">03</span>
            </div>
          </Reveal>

          <div className="space-y-0">
            {APPROACH.map((item, i) => (
              <Reveal key={item.number} delay={i * 0.1}>
                <div className="group border-t border-white/10 py-7 last:border-b">
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-[10px] tracking-wider text-brand">{item.number}</span>
                    <div>
                      <h3 className="font-heading text-[19px] font-medium">{item.title}</h3>
                      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/50">{item.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}