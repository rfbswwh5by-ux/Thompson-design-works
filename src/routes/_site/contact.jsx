import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageIntro } from "@/components/site/PageIntro";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { useSiteContent } from "@/components/site/SiteContentContext";
import { BRAND, CONTACT_INTRO, LOCATION_NOTE, savedText } from "@/lib/site-defaults";

export const Route = createFileRoute("/_site/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Thompson’s Design Work" },
      {
        name: "description",
        content:
          "Start a website project with Thompson’s Design Work. Tell us about your business and we will respond with clear next steps.",
      },
    ],
  }),
});

function ContactPage() {
  const { settings, content } = useSiteContent();
  const email = savedText(settings, "email", BRAND.email).trim();
  const phone = savedText(settings, "phone", BRAND.phone).trim();

  return (
    <>
      <PageIntro
        eyebrow="Start a project"
        title="Tell us about your business."
        accent=""
        description={
          savedText(content, "contact_intro", CONTACT_INTRO)
        }
      />

      <section className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <Reveal><ContactForm /></Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-6">
              <div className="rounded-sm border border-border bg-white p-6">
                <p className="eyebrow">Direct contact</p>
                <ul className="mt-4 space-y-4">
                  {email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Email</p>
                      <a href={`mailto:${email}`} className="mt-0.5 block break-all text-[13.5px] hover:text-brand">
                        {email}
                      </a>
                    </div>
                  </li>
                  )}
                  {phone && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                        className="mt-0.5 block text-[13.5px] hover:text-brand"
                      >
                        {phone}
                      </a>
                    </div>
                  </li>
                  )}
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Location</p>
                      <p className="mt-0.5 text-[13.5px]">
                        {savedText(settings, "location_note", LOCATION_NOTE)}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-sm bg-obsidian p-6 text-white">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">What happens next</p>
                <ol className="mt-4 space-y-4">
                  {[
                    "We read your inquiry and review the fit.",
                    "You receive a reply with questions and next steps.",
                    "We scope the project and send a written proposal.",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="font-mono text-[10px] text-brand">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] leading-relaxed text-white/70">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}