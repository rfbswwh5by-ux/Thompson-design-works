import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { BRAND, savedText } from "@/lib/site-defaults";

export function FinalCta({ settings }) {
  const email = savedText(settings, "email", BRAND.email).trim();
  const phone = savedText(settings, "phone", BRAND.phone).trim();

  return (
    <section className="relative overflow-hidden bg-obsidian text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] noise" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-[130px]"
      />
      <div className="relative mx-auto max-w-[1240px] px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Start a project</p>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-[clamp(2.2rem,5.4vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            Let’s build a website your business
            <span className="display italic text-white/60"> actually deserves.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/55">
            Tell us about your business and what the site needs to do. You will receive a considered response with clear
            next steps — no pressure, no generic packages.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-sm bg-white px-7 py-4 text-[14px] font-medium text-obsidian transition-all duration-300 hover:bg-brand hover:text-white"
            >
              Start your project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-7 py-4 text-[14px] font-medium text-white/80 transition-colors hover:border-white/50 hover:text-white"
              >
                Email the studio
              </a>
            )}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[11px] tracking-wide text-white/35">
            {email && <a href={`mailto:${email}`} className="hover:text-white/70">{email}</a>}
            {email && phone && <span className="hidden h-3 w-px bg-white/15 sm:block" />}
            {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-white/70">{phone}</a>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}