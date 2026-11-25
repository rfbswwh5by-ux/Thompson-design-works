import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const SERIF = "Georgia, 'Times New Roman', serif";

const PHOTO = {
  atelier:
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80",
  atelierTwo:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  chair:
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=80",
  camera:
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80",
  sofa:
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80",
  dining:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
  plate:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
};

/** Architecture studio — warm paper, editorial serif, one large photograph. */
function AtelierNorth() {
  return (
    <div className="flex h-full w-full flex-col bg-[#F4F1EA] px-[4cqw] pb-[3cqw] pt-[3.2cqw] text-[#171512]">
      <div className="flex items-baseline justify-between">
        <span className="text-[1.75cqw] font-medium tracking-[0.3em]">ATELIER NORTH</span>
        <div className="flex gap-[2.4cqw] text-[1.05cqw] text-[#171512]/55">
          <span>Work</span>
          <span>Studio</span>
          <span>Journal</span>
          <span>Contact</span>
        </div>
      </div>

      <div className="mt-[2.6cqw] grid flex-1 grid-cols-[1.02fr_1fr] gap-[2.8cqw]">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[0.92cqw] uppercase tracking-[0.26em] text-[#171512]/40">
              Architecture &amp; interiors — Santiago
            </p>
            <h3
              className="mt-[1.5cqw] text-[5.2cqw] leading-[0.96] tracking-[-0.03em]"
              style={{ fontFamily: SERIF }}
            >
              Quiet buildings,
              <br />
              precise light.
            </h3>
            <p className="mt-[1.7cqw] max-w-[27cqw] text-[1.08cqw] leading-[1.75] text-[#171512]/60">
              A studio of nine, working slowly on houses, galleries and small civic rooms across Chile.
            </p>
          </div>
          <div className="flex items-end justify-between border-t border-[#171512]/15 pt-[1.3cqw] text-[0.95cqw] text-[#171512]/45">
            <span>Casa Norte — 2025</span>
            <span>Selected work ↓</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#E4DFD3]">
          <Image src={PHOTO.atelier} alt="" fittingType="fill" className="h-full w-full object-cover" />
          <span className="absolute bottom-[1.2cqw] left-[1.2cqw] rounded-full bg-white/85 px-[1cqw] py-[0.45cqw] text-[0.85cqw] tracking-[0.12em] text-[#171512]/70">
            Patagonia House
          </span>
        </div>
      </div>
    </div>
  );
}

/** Homeware store — cream, centred wordmark, three-up product grid. */
function FormAndField() {
  const products = [
    { name: "Oak Stool", price: "$148", src: PHOTO.chair },
    { name: "Field Camera", price: "$320", src: PHOTO.camera },
    { name: "Linen Sofa", price: "$1,240", src: PHOTO.sofa },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[#EFE9DE] px-[3.2cqw] pb-[2.6cqw] pt-[2.4cqw] text-[#1E1B16]">
      <div className="flex items-center justify-between">
        <div className="flex gap-[1.6cqw] text-[1cqw] text-[#1E1B16]/55">
          <span>Shop</span>
          <span>Journal</span>
        </div>
        <span className="text-[1.5cqw] font-medium tracking-[0.34em]">FORM &amp; FIELD</span>
        <div className="flex gap-[1.6cqw] text-[1cqw] text-[#1E1B16]/55">
          <span>Cart (2)</span>
        </div>
      </div>

      <div className="mt-[2.4cqw] flex items-end justify-between gap-[2cqw]">
        <h3
          className="text-[4.1cqw] leading-[0.98] tracking-[-0.02em]"
          style={{ fontFamily: SERIF }}
        >
          Objects for
          <br />
          the everyday.
        </h3>
        <p className="max-w-[22cqw] pb-[0.6cqw] text-[1.02cqw] leading-[1.7] text-[#1E1B16]/60">
          Made in small runs by people we know, built to be used until it shows.
        </p>
      </div>

      <div className="mt-[2.2cqw] grid flex-1 grid-cols-3 gap-[1.6cqw]">
        {products.map((product) => (
          <div key={product.name} className="flex flex-col">
            <div className="flex-1 overflow-hidden bg-[#E3DCCE]">
              <Image src={product.src} alt="" fittingType="fill" className="h-full w-full object-cover" />
            </div>
            <div className="mt-[0.9cqw] flex items-baseline justify-between">
              <span className="text-[1.05cqw]">{product.name}</span>
              <span className="text-[1.05cqw] text-[#1E1B16]/55">{product.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Restaurant — dark, brass accents, photography-led. */
function MaisonVerre() {
  return (
    <div className="flex h-full w-full flex-col bg-[#0E0D0C] px-[3.4cqw] pb-[2.6cqw] pt-[2.6cqw] text-[#EDE6DA]">
      <div className="flex items-center justify-between text-[0.95cqw] text-[#EDE6DA]/60">
        <span>Dinner Tue–Sat</span>
        <span className="text-[1.55cqw] tracking-[0.36em] text-[#EDE6DA]">MAISON VERRE</span>
        <span className="text-[#B08A5A]">Reserve</span>
      </div>

      <div className="mt-[2.4cqw] grid flex-1 grid-cols-[1fr_1.15fr] items-center gap-[2.6cqw]">
        <div>
          <p className="text-[0.9cqw] uppercase tracking-[0.26em] text-[#B08A5A]">Seasonal kitchen</p>
          <h3
            className="mt-[1.2cqw] text-[4.4cqw] leading-[0.98] tracking-[-0.01em]"
            style={{ fontFamily: SERIF }}
          >
            Cooking with
            <br />
            what the week gives.
          </h3>
          <p className="mt-[1.4cqw] max-w-[26cqw] text-[1.02cqw] leading-[1.75] text-[#EDE6DA]/55">
            A twelve-seat dining room in the old glassworks. One menu, written each morning.
          </p>
        </div>
        <div className="h-full overflow-hidden bg-[#1A1917]">
          <Image src={PHOTO.dining} alt="" fittingType="fill" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

/** Compact mobile screen for the phone frame. */
function MaisonVerreMobile() {
  return (
    <div className="flex h-full w-full flex-col bg-[#0E0D0C] px-[7cqw] py-[7cqw] text-[#EDE6DA]">
      <span className="text-center text-[5.6cqw] tracking-[0.24em]">MAISON VERRE</span>
      <div className="mt-[6cqw] flex-1 overflow-hidden bg-[#1A1917]">
        <Image src={PHOTO.plate} alt="" fittingType="fill" className="h-full w-full object-cover" />
      </div>
      <p className="mt-[5cqw] text-[5.2cqw] leading-[1.25]" style={{ fontFamily: SERIF }}>
        Tonight’s menu
      </p>
      <p className="mt-[2.4cqw] text-[4.2cqw] leading-[1.6] text-[#EDE6DA]/55">
        Six courses, written this morning.
      </p>
      <span className="mt-[4cqw] rounded-full bg-[#B08A5A] py-[3cqw] text-center text-[4.4cqw] font-medium text-[#0E0D0C]">
        Reserve a table
      </span>
    </div>
  );
}

const DESIGNS = {
  "atelier-north": AtelierNorth,
  "form-and-field": FormAndField,
  "maison-verre": MaisonVerre,
};

const MOBILE = {
  "maison-verre": MaisonVerreMobile,
};

export function hasConceptDesign(slug) {
  return Boolean(DESIGNS[slug]);
}

export function hasPhoneDesign(slug) {
  return Boolean(MOBILE[slug]);
}

/**
 * A concept project's website, drawn as real layout instead of a screenshot,
 * so it stays sharp at any size. Everything sizes in container units.
 */
export function ConceptMockup({ slug, className }) {
  const Design = DESIGNS[slug];
  if (!Design) return null;
  return (
    <div
      className={cn("h-full w-full overflow-hidden", className)}
      style={{ containerType: "inline-size" }}
    >
      <Design />
    </div>
  );
}

export function ConceptPhoneMockup({ slug, className }) {
  const Design = MOBILE[slug];
  if (!Design) return null;
  return (
    <div
      className={cn("h-full w-full overflow-hidden", className)}
      style={{ containerType: "inline-size" }}
    >
      <Design />
    </div>
  );
}