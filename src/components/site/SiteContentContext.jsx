import { createContext, useContext } from "react";
import { BRAND, FAQS, HERO, SAMPLE_PROJECTS, SERVICES, savedText } from "@/lib/site-defaults";

const SiteContentContext = createContext(null);

/**
 * Published site content (settings, copy, services, portfolio, FAQs,
 * testimonials), loaded by the site layout. Falls back to the studio's own
 * default copy so the site is never blank while content is being set up.
 */
export function SiteContentProvider({ data, children }) {
  const value = {
    settings: data?.settings ?? { business_name: BRAND.name, email: BRAND.email, phone: BRAND.phone },
    content: data?.content ?? HERO,
    // Until the owner claims the dashboard (which copies these starter lists into
    // the database so they can be edited), the built-in lists are shown. After
    // that the database is the only source: deleting an item really removes it.
    services: data?.seeded ? data.services : SERVICES,
    faqs: data?.seeded ? data.faqs : FAQS,
    projects: data?.seeded ? data.projects : SAMPLE_PROJECTS,
    testimonials: data?.testimonials ?? [],
  };
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext) ?? {};
}

export function heroFrom(content) {
  if (!content) return HERO;
  return {
    eyebrow: savedText(content, "hero_eyebrow", HERO.eyebrow),
    headlineTop: savedText(content, "hero_headline_top", HERO.headlineTop),
    headlineAccent: savedText(content, "hero_headline_accent", HERO.headlineAccent),
    headlineBottom: savedText(content, "hero_headline_bottom", HERO.headlineBottom),
    headline: savedText(content, "hero_headline", HERO.headline),
    description: savedText(content, "hero_description", HERO.description),
    primaryCta: savedText(content, "hero_primary_cta", HERO.primaryCta),
    secondaryCta: savedText(content, "hero_secondary_cta", HERO.secondaryCta),
  };
}