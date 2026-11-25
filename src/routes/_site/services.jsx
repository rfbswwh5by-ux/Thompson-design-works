import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { PageIntro } from "@/components/site/PageIntro";
import { Reveal } from "@/components/site/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { useSiteContent } from "@/components/site/SiteContentContext";
import { ServiceIcon } from "@/lib/serviceIcons";

export const Route = createFileRoute("/_site/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Thompson’s Design Work" },
      {
        name: "description",
        content:
          "Custom website development, restaurant websites, e-commerce, landing pages, redesigns, maintenance, mobile optimization and SEO.",
      },
    ],
  }),
});

function ServicesPage() {
  const { services, settings } = useSiteContent();

  return (
    <>
      <PageIntro
        eyebrow="Services"
        title="Everything your website needs,"
        accent="nothing it doesn’t."
        description="Each service is scoped around what your business actually needs. No bundles you did not ask for, no features that cannot be delivered."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {services.map((s) => (
            <a
              key={s.slug || s.id}
              href={`#${s.slug}`}
              className="rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] text-foreground/70 transition-colors hover:border-brand/40 hover:text-brand"
            >
              {s.name}
            </a>
          ))}
        </div>
      </PageIntro>

      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
        {services.map((service, i) => (
          <Reveal key={service.slug || service.id} delay={0.03}>
            <article
              id={service.slug}
              className="grid scroll-mt-28 gap-6 border-b border-border py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-white">
                    <ServiceIcon name={service.icon} className="h-4.5 w-4.5 text-brand" />
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 font-heading text-[clamp(1.35rem,2.4vw,1.9rem)] font-medium leading-tight tracking-[-0.02em]">
                  {service.name}
                </h2>
              </div>

              <div>
                <p className="max-w-xl text-[15px] leading-relaxed text-foreground/80">
                  {service.description || service.summary}
                </p>
                {service.benefits?.length > 0 && (
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {service.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.5} />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/contact"
                  className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-brand"
                >
                  Discuss this service
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <FinalCta settings={settings} />
    </>
  );
}