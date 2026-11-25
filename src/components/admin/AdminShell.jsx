import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { db } from "@/lib/db-client";
import { BrandMark } from "@/components/BrandMark";
import { useAdmin } from "@/lib/AdminContext";
import { cn } from "@/lib/utils";

const GROUPS = [
  { label: "Overview", items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }] },
  {
    label: "Customer Management",
    items: [
      { label: "Inbox", to: "/admin/inbox", icon: Inbox, badge: true },
      { label: "Customers", to: "/admin/customers", icon: Users },
      { label: "Projects", to: "/admin/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Website Management",
    items: [
      { label: "Portfolio", to: "/admin/portfolio", icon: Briefcase },
      { label: "Services", to: "/admin/services", icon: Sparkles },
      { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquareQuote },
      { label: "FAQs", to: "/admin/faqs", icon: MessageSquareQuote },
      { label: "Website Editor", to: "/admin/website", icon: PanelLeftClose },
    ],
  },
  {
    label: "Business Management",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Settings", to: "/admin/settings", icon: Settings },
      { label: "Account & Security", to: "/admin/account", icon: ShieldCheck },
    ],
  },
];

export function AdminShell({ children }) {
  const { name, businessName, logout } = useAdmin();
  const [open, setOpen] = useState(false);

  const { data: unread = 0 } = useQuery({
    queryKey: ["admin-unread-count"],
    queryFn: () => db.entities.Inquiry.count({ is_read: false }),
    refetchInterval: 30000,
  });

  const sidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link to="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <BrandMark className="h-6 w-6" />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[13px] font-semibold">Thompson’s</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground">Studio OS</span>
          </span>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close menu">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2.5 pb-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
              {group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-obsidian text-white" }}
                activeOptions={{ exact: item.to === "/admin" }}
                className="group mb-0.5 flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[12.5px] text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && unread > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="mb-2 flex items-center justify-between rounded-sm px-2.5 py-2 text-[12px] text-muted-foreground hover:bg-secondary"
        >
          View public site <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <div className="flex items-center justify-between gap-2 rounded-sm bg-secondary/60 px-2.5 py-2">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium">{name || "Owner"}</p>
            <p className="truncate text-[10.5px] text-muted-foreground">{businessName || "Signed in with access code"}</p>
          </div>
          <button type="button" onClick={() => logout()} aria-label="Sign out" className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-border lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-obsidian/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[270px] shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-sm border border-border">
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-heading text-[13px] font-semibold">Studio OS</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", unread > 0 ? "bg-brand text-white" : "bg-secondary text-muted-foreground")}>
            {unread} new
          </span>
        </header>
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}