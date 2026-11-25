import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { SelectedWork } from "@/components/site/SelectedWork";
import { ServicesOverview } from "@/components/site/ServicesOverview";
import { Approach } from "@/components/site/Approach";
import { WhyUs } from "@/components/site/WhyUs";
import { Industries } from "@/components/site/Industries";
import { Process } from "@/components/site/Process";
import { HomeFaq } from "@/components/site/HomeFaq";
import { FinalCta } from "@/components/site/FinalCta";
import { heroFrom, useSiteContent } from "@/components/site/SiteContentContext";

export const Route = createFileRoute("/_site/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Thompson’s Design Work — Websites That Work as Hard as You Do" },
      {
        name: "description",
        content:
          "Custom website design for businesses of all sizes. Modern websites, restaurant sites, e-commerce, landing pages and redesigns — thoughtfully designed and built to perform.",
      },
    ],
  }),
});

function HomePage() {
  const { settings, services, faqs, projects, content } = useSiteContent();
  const shownProjects = projects ?? [];

  return (
    <>
      <Hero content={heroFrom(content)} />
      <SelectedWork projects={shownProjects} />
      <ServicesOverview services={services} />
      <Approach />
      <WhyUs />
      <Industries />
      <Process />
      <HomeFaq faqs={faqs?.slice(0, 5)} />
      <FinalCta settings={settings} />
    </>
  );
}