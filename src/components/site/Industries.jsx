import { Reveal } from "@/components/site/Reveal";
import { INDUSTRIES } from "@/lib/site-defaults";

export function Industries() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">Industries</p>
            <h2 className="mt-3 font-heading text-[clamp(1.5rem,2.6vw,2.1rem)] font-medium leading-tight tracking-[-0.02em]">
              Different businesses.
              <br />
              The same standard.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="flex flex-wrap gap-x-3 gap-y-3">
              {INDUSTRIES.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-border px-4 py-2 text-[13px] text-foreground/75 transition-colors duration-300 hover:border-brand/40 hover:bg-brand-soft hover:text-brand-ink"
                >
                  {name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}