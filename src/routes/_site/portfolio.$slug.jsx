import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { BrowserFrame, PhoneFrame } from "@/components/site/BrowserFrame";
import { Reveal } from "@/components/site/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { useSiteContent } from "@/components/site/SiteContentContext";
import {
  ConceptMockup,
  ConceptPhoneMockup,
  hasConceptDesign,
  hasPhoneDesign,
} from "@/components/site/ConceptMockup";

export const Route = createFileRoute("/_site/portfolio/$slug")({
  component: ProjectPage,
});

function ProjectPage() {
  const { slug } = Route.useParams();
  const { projects, settings } = useSiteContent();
  const all = projects ?? [];
  const project = all.find((p) => p.slug === slug);

  if (!project) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-[1240px] flex-col items-center justify-center px-5 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 font-heading text-3xl font-medium">This project is no longer published.</h1>
        <Link to="/portfolio" className="mt-6 text-[13.5px] font-medium text-brand">
          ← Back to all work
        </Link>
      </section>
    );
  }

  const screenshots = project.screenshots?.length ? project.screenshots : [project.thumbnail_url].filter(Boolean);

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-28 sm:px-8 sm:pt-36">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All work
          </Link>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  {project.industry}
                </span>
                {project.is_concept && (
                  <span className="rounded-full bg-obsidian px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white">
                    Concept study
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-heading text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1] tracking-[-0.04em]">
                {project.title}
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                {project.business_name} · {project.category}
              </p>
            </div>
            {project.external_url && (
              <a
                href={project.external_url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-sm bg-obsidian px-5 py-3 text-[13px] font-medium text-white transition-colors hover:bg-brand"
              >
                Visit live site
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-sm border border-border">
            {hasConceptDesign(project.slug) ? (
              <div className="aspect-[16/9] w-full">
                <ConceptMockup slug={project.slug} />
              </div>
            ) : (
              <Image
                src={project.desktop_preview_url || project.thumbnail_url}
                alt={`${project.title} desktop preview`}
                fittingType="fill"
                className="aspect-[16/9] w-full"
              />
            )}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <Reveal>
              <h2 className="eyebrow">About this project</h2>
              <p className="mt-4 text-[16px] leading-[1.75] text-foreground/80">{project.description}</p>
            </Reveal>

            {screenshots.length > 1 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {screenshots.slice(1).map((src, i) => (
                  <Reveal key={src + i} delay={i * 0.05}>
                    <div className="overflow-hidden rounded-sm border border-border">
                      <Image
                        src={src}
                        alt={`${project.title} screen ${i + 2}`}
                        fittingType="fill"
                        className="aspect-[4/3] w-full"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          <div>
            <dl className="border-t border-border">
              {[
                { label: "Business", value: project.business_name },
                { label: "Industry", value: project.industry },
                { label: "Category", value: project.category },
                { label: "Scope", value: project.tech },
                { label: "Timeline", value: project.timeline },
                { label: "Type", value: project.is_concept ? "Concept study" : "Client project" },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b border-border py-3.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="max-w-[60%] text-right text-[13px]">{row.value}</dd>
                  </div>
                ))}
            </dl>

            {hasPhoneDesign(project.slug) ? (
              <div className="mt-8 flex justify-center">
                <PhoneFrame className="w-[58%]">
                  <ConceptPhoneMockup slug={project.slug} />
                </PhoneFrame>
              </div>
            ) : project.mobile_preview_url ? (
              <div className="mt-8 flex justify-center">
                <PhoneFrame src={project.mobile_preview_url} alt={`${project.title} mobile preview`} className="w-[58%]" />
              </div>
            ) : null}

            <Link
              to="/contact"
              className="mt-8 flex items-center justify-center gap-2 rounded-sm border border-border px-5 py-3 text-[13px] font-medium transition-colors hover:border-foreground/30"
            >
              Start a project like this <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <FinalCta settings={settings} />
    </>
  );
}