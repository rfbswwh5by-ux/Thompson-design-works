import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Reveal } from "@/components/site/Reveal";
import { ConceptMockup, hasConceptDesign } from "@/components/site/ConceptMockup";

function ProjectTile({ project, className, tall }) {
  return (
    <Link
      to="/portfolio/$slug"
      params={{ slug: project.slug }}
      className={`group relative block overflow-hidden rounded-sm border border-border bg-white ${className || ""}`}
    >
      <div className={`relative w-full overflow-hidden bg-neutral-100 ${tall ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        {hasConceptDesign(project.slug) ? (
          <div className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
            <ConceptMockup slug={project.slug} />
          </div>
        ) : (
          <Image
            src={project.thumbnail_url}
            alt={`${project.title} website design`}
            fittingType="fill"
            className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute bottom-4 left-4 flex translate-y-3 items-center gap-1.5 text-[12px] font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View project <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="flex items-start justify-between gap-4 px-4 py-4">
        <div>
          <p className="font-heading text-[15px] font-medium">{project.title}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{project.industry} · {project.category}</p>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {project.is_concept ? "Concept" : "Client"}
        </span>
      </div>
    </Link>
  );
}

export function SelectedWork({ projects = [] }) {
  const featured = projects[0];
  const rest = projects.slice(1, 3);
  if (!featured) return null;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <Reveal>
          <p className="eyebrow">Selected work</p>
          <h2 className="mt-3 max-w-lg font-heading text-[clamp(1.9rem,3.6vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.03em]">
            Design you can judge for yourself.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link to="/portfolio" className="group inline-flex items-center gap-2 text-[13.5px] font-medium">
            All projects
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors group-hover:border-foreground group-hover:bg-obsidian group-hover:text-white">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Reveal><ProjectTile project={featured} tall /></Reveal>
        <div className="grid gap-5">
          {rest.map((p, i) => (
            <Reveal key={p.id || p.slug} delay={0.08 + i * 0.08}><ProjectTile project={p} /></Reveal>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12px] text-muted-foreground">
        Concept projects are original design studies created to demonstrate capability. They are clearly labeled as concepts.
      </p>
    </section>
  );
}