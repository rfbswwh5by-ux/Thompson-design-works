import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export function ServicesOverview({ services = [] }) {
  const shown = services.slice(0, 7);
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <p className="eyebrow">What we do</p>
              <h2 className="mt-3 font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
                Everything a website needs to earn its place.
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                From a single landing page to a full storefront, each engagement is scoped around what your business
                actually needs — and built to a standard you can point at.
              </p>
              <Link
                to="/services"
                className="group mt-7 inline-flex items-center gap-2 text-[13.5px] font-medium text-brand"
              >
                Explore all services
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Reveal>
          </div>

          <div>
            {shown.map((s, i) => (
              <Reveal key={s.slug || s.id} delay={i * 0.04}>
                <Link
                  to="/services"
                  hash={s.slug}
                  className="group flex items-start gap-5 border-b border-border py-5 transition-colors first:border-t hover:border-foreground/20"
                >
                  <span className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-4">
                      <span className="font-heading text-[17px] font-medium transition-colors group-hover:text-brand">
                        {s.name}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
                      {s.summary}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}