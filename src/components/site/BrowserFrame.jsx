import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

/** A calm, precise browser chrome used to frame website previews. */
export function BrowserFrame({ src, alt, label = "thompsondesignwork.com", className, imageClassName, children }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgba(10,10,11,0.45)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#F4F4F5] px-3 py-2">
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-black/15" />
          <i className="h-2 w-2 rounded-full bg-black/15" />
          <i className="h-2 w-2 rounded-full bg-black/15" />
        </span>
        <span className="ml-2 flex-1 truncate rounded-sm bg-white px-2 py-1 font-mono text-[9px] tracking-wide text-black/40">
          {label}
        </span>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        {children ?? (
          <Image src={src} alt={alt} fittingType="fill" className={cn("h-full w-full", imageClassName)} />
        )}
      </div>
    </div>
  );
}

/** A phone-shaped frame for mobile previews. */
export function PhoneFrame({ src, alt, className, children }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.6rem] border border-black/10 bg-white p-1.5 shadow-[0_30px_60px_-20px_rgba(10,10,11,0.5)]",
        className,
      )}
    >
      <div className="relative aspect-[9/17] overflow-hidden rounded-[1.2rem] bg-neutral-100">
        {children ?? <Image src={src} alt={alt} fittingType="fill" className="h-full w-full" />}
      </div>
    </div>
  );
}