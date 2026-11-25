import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { BRAND, LOCATION_NOTE, savedText } from "@/lib/site-defaults";

export function SiteFooter({ settings }) {
  const email = savedText(settings, "email", BRAND.email).trim();
  const phone = savedText(settings, "phone", BRAND.phone).trim();
  const locationNote = savedText(settings, "location_note", LOCATION_NOTE);
  const socials = [
    settings?.social_instagram && { label: "Instagram", href: settings.social_instagram },
    settings?.social_linkedin && { label: "LinkedIn", href: settings.social_linkedin },
    settings?.social_facebook && { label: "Facebook", href: settings.social_facebook },
    settings?.social_x && { label: "X", href: settings.social_x },
  ].filter(Boolean);

  return (
    <footer className="relative overflow-hidden bg-obsidian text-white">
      <div className="mx-auto max-w-[1240px] px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-6 w-6" src={settings?.logo_url} tone="light" />
              <span className="font-heading text-sm font-semibold">Thompson’s Design Work</span>
            </div>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-white/55">
              Custom websites for businesses that take their work seriously. Designed with intent, built to perform.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Explore</p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/65">
              {[
                { label: "Home", to: "/" },
                { label: "Work", to: "/portfolio" },
                { label: "Services", to: "/services" },
                { label: "About", to: "/about" },
                { label: "FAQ", to: "/faq" },
                { label: "Contact", to: "/contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Get in touch</p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/65">
              {email && (
                <li>
                  <a href={`mailto:${email}`} className="break-all transition-colors hover:text-white">{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="transition-colors hover:text-white">{phone}</a>
                </li>
              )}
              {locationNote && <li className="text-white/40">{locationNote}</li>}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-white/55 hover:text-white"
                    >
                      {s.label} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 py-7 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Thompson’s Design Work. All rights reserved.</p>
          <Link to="/admin" className="transition-colors hover:text-white/70">Client & Studio Login</Link>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none select-none px-4 pb-4">
        <p className="whitespace-nowrap text-center font-heading text-[15vw] font-semibold leading-[0.85] tracking-[-0.05em] text-white/[0.045]">
          Thompson’s
        </p>
      </div>
    </footer>
  );
}