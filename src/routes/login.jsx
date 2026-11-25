import { createFileRoute, redirect } from "@tanstack/react-router";

// Old sign-in links keep working: the dashboard has its own access-code screen.
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
