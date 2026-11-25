import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { PageIntro } from "@/components/site/PageIntro";
import { Reveal } from "@/components/site/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { useSiteContent } from "@/components/site/SiteContentContext";
import { ConceptMockup, hasConceptDesign } from "@/components/site/ConceptMockup";

export const Route = createFileRoute("/_site/portfolio/")({
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: "Work — Thompson’s Design Work" },
      {
        name: "description",
        content:
          "Selected website design work: restaurant sites, business websites, e-commerce storefronts and design concepts.",
      },
    ],
  }),
});

function PortfolioPage() {
  const { projects, settings } = useSiteContent();
  const all = projects ?? [];
  const industries = ["All", ...Array.from(new Set(all.map((p) => p.industry).filter(Boolean)))];
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? all : all.filter((p) => p.industry === filter);

  return (
    <>
      <PageIntro
        eyebrow="Selected work"
        title="The proof is the work"
        accent="itself."
        description="A look at the kind of websites we design and build. Concept studies are labeled as concepts — never presented as client work."
      />

      <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
        {industries.length > 2 && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-8">
            {industries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => setFilter(industry)}
                className={`rounded-full border px-4 py-1.5 text-[12.5px] transition-colors ${
                  filter === industry
                    ? "border-obsidian bg-obsidian text-white"
                    : "border-border bg-white text-foreground/70 hover:border-foreground/30"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project, i) => (
            <Reveal key={project.id || project.slug} delay={(i % 3) * 0.06}>
              <Link
                to="/portfolio/$slug"
                params={{ slug: project.slug }}
                className={`group block ${project.is_featured ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <div className="relative overflow-hidden rounded-sm border border-border bg-neutral-100">
                  {hasConceptDesign(project.slug) ? (
                    <div
                      className={`w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] ${
                        project.is_featured ? "aspect-[16/9]" : "aspect-[4/3]"
                      }`}
                    >
                      <ConceptMockup slug={project.slug} />
                    </div>
                  ) : (
                    <Image
                      src={project.thumbnail_url}
                      alt={`${project.title} website design`}
                      fittingType="fill"
                      className={`w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] ${
                        project.is_featured ? "aspect-[16/9]" : "aspect-[4/3]"
                      }`}
                    />
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {project.is_concept && (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-obsidian backdrop-blur">
                        Concept
                      </span>
                    )}
                    {project.is_featured && (
                      <span className="rounded-full bg-brand px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-[17px] font-medium">{project.title}</h2>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {project.business_name} · {project.category}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {shown.length === 0 && (
          <p className="py-20 text-center text-[14px] text-muted-foreground">No projects in this category yet.</p>
        )}
      </section>

      <FinalCta settings={settings} />
    </>
  );
}