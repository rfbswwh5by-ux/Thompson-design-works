import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/BrandMark";
import { useSiteContent } from "@/components/site/SiteContentContext";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Work", to: "/portfolio" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const { settings } = useSiteContent();
  const logo = settings?.logo_url;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Wordmark src={logo} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="group hidden items-center gap-2 rounded-sm bg-obsidian px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:bg-brand sm:inline-flex"
          >
            Start a Project
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-border md:hidden"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-obsidian text-white md:hidden">
          <div className="flex h-[68px] items-center justify-between px-5">
            <Wordmark className="text-white" src={logo} tone="light" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/20"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <nav className="flex flex-col px-5 pt-6">
            {NAV.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between border-b border-white/10 py-5 font-heading text-3xl font-medium tracking-tight"
              >
                {item.label}
                <span className="font-mono text-[10px] text-white/35">0{i + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="px-5 pt-8">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-sm bg-white px-5 py-4 text-sm font-medium text-obsidian"
            >
              Start a Project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="absolute bottom-8 left-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Remote studio · Accepting projects
          </p>
        </div>
      )}
    </header>
  );
}