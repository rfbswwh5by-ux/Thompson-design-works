import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminProvider } from "@/lib/AdminContext";

// Everything under src/routes/_authed/ (the /admin dashboard) sits behind the
// site's own access-code sign-in. Rendered in the browser only.
export const Route = createFileRoute("/_authed")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <AdminProvider>
      <AdminGate>
        <Outlet />
      </AdminGate>
    </AdminProvider>
  );
}
