import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteContentProvider, useSiteContent } from "@/components/site/SiteContentContext";
import { getSiteContent } from "@/lib/public-fns";

export const Route = createFileRoute("/_site")({
  loader: () => getSiteContent(),
  component: SiteLayout,
});

function SiteLayout() {
  const data = Route.useLoaderData();
  return (
    <SiteContentProvider data={data}>
      <SiteShell />
    </SiteContentProvider>
  );
}

function SiteShell() {
  const { settings } = useSiteContent();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}