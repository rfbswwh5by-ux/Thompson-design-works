import { cn } from "@/lib/utils";

export const DEFAULT_LOGO_URL = "/media/logo.png";

/**
 * The Thompson's Design Work TD monogram.
 * tone="dark" sits on light surfaces, tone="light" on dark surfaces.
 */
export function BrandMark({ className, src, tone = "dark" }) {
  return (
    <img
      src={src || DEFAULT_LOGO_URL}
      alt=""
      aria-hidden="true"
      className={cn(
        "h-7 w-7 shrink-0 object-contain",
        tone === "light" ? "invert mix-blend-screen" : "mix-blend-multiply",
        className,
      )}
    />
  );
}

export function Wordmark({ className, compact = false, src, tone = "dark" }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark src={src} tone={tone} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[15px] font-semibold tracking-[-0.01em]">Thompson’s</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            Design Work
          </span>
        </span>
      )}
    </span>
  );
}