import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import { PageIntro } from "@/components/site/PageIntro";
import { Reveal } from "@/components/site/Reveal";
import { FinalCta } from "@/components/site/FinalCta";
import { useSiteContent } from "@/components/site/SiteContentContext";
import { ABOUT_BODY, APPROACH, STUDIO_IMAGE, savedText } from "@/lib/site-defaults";

export const Route = createFileRoute("/_site/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Thompson’s Design Work" },
      {
        name: "description",
        content:
          "Thompson’s Design Work builds custom websites for businesses of all types and sizes — with attention to detail, performance and user experience.",
      },
    ],
  }),
});

const PRINCIPLES = [
  "Attention to detail in every element",
  "Custom development, never a stretched template",
  "Understanding your business before designing",
  "Professional presentation that earns trust",
  "Performance and user experience as requirements",
  "A strong, lasting online presence",
];

function AboutPage() {
  const { content, settings } = useSiteContent();
  const savedBody = savedText(content, "about_body", null);
  const body = savedBody === null ? ABOUT_BODY : savedBody.split("\n").filter((line) => line.trim());
  const image = savedText(content, "about_image_url", STUDIO_IMAGE);

  return (
    <>
      <PageIntro
        eyebrow="About the studio"
        title="Every business deserves a website that represents the quality of its work."
        description="Most businesses are better than their website suggests. Closing that gap is the entire job."
      />

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            {body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={`text-[15.5px] leading-[1.75] text-foreground/80 ${i > 0 ? "mt-5" : ""}`}>
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.15}>
              <blockquote className="mt-10 border-l-2 border-brand pl-6">
                <p className="display text-[clamp(1.35rem,2.4vw,1.85rem)] italic leading-snug">
                  “We are not interested in making something that looks designed. We are interested in making
                  something that works.”
                </p>
              </blockquote>
            </Reveal>

            <Reveal delay={0.2}>
              <ul className="mt-10 grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
                {PRINCIPLES.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-foreground/75">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.5} />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="sticky top-28">
              {image && (
                <div className="overflow-hidden rounded-sm border border-border">
                  <Image
                    src={image}
                    alt="Minimalist design studio interior with natural light"
                    fittingType="fill"
                    className="aspect-[3/4] w-full"
                  />
                </div>
              )}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Studio</p>
                  <p className="mt-1 text-[13.5px]">Remote · Working anywhere</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Focus</p>
                  <p className="mt-1 text-[13.5px]">Custom web design</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <p className="eyebrow">How we think</p>
            <h2 className="mt-3 max-w-xl font-heading text-[clamp(1.7rem,3vw,2.4rem)] font-medium leading-tight tracking-[-0.03em]">
              Three commitments behind every project.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {APPROACH.map((item, i) => (
              <Reveal key={item.number} delay={i * 0.08}>
                <p className="font-mono text-[10px] tracking-wider text-brand">{item.number}</p>
                <h3 className="mt-3 font-heading text-[16.5px] font-medium">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCta settings={settings} />
    </>
  );
}