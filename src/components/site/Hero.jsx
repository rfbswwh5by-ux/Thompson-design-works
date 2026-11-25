import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { BrowserFrame, PhoneFrame } from "@/components/site/BrowserFrame";
import { ConceptMockup, ConceptPhoneMockup } from "@/components/site/ConceptMockup";
import { HERO } from "@/lib/site-defaults";

const EASE = [0.16, 1, 0.3, 1];

export function Hero({ content = HERO }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 22 });
  const sy = useSpring(my, { stiffness: 120, damping: 22 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [4, -4]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-3, 3]);
  const driftX = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32" onMouseMove={onMove} ref={ref}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rule-grid opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-brand/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-[1240px] px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {content.eyebrow}
              </span>
            </motion.div>

            <h1 className="mt-7 font-heading text-[clamp(2.6rem,6.2vw,4.9rem)] font-medium leading-[0.95] tracking-[-0.035em]">
              {[content.headlineTop, content.headlineAccent, content.headlineBottom].map((line, i) => (
                <motion.span
                  key={i}
                  className="block overflow-hidden"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.08 + i * 0.09, ease: EASE }}
                >
                  {i === 1 ? (
                    <span className="display italic text-brand">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.36, ease: EASE }}
              className="mt-7 max-w-[30rem] text-[16.5px] font-medium leading-snug text-foreground/85"
            >
              {content.headline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.44, ease: EASE }}
              className="mt-3 max-w-[31rem] text-[15px] leading-relaxed text-muted-foreground"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.52, ease: EASE }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-obsidian px-6 py-3.5 text-[14px] font-medium text-white transition-all duration-300 hover:bg-brand hover:shadow-[0_18px_40px_-16px_rgba(79,70,229,0.7)]"
              >
                {content.primaryCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/portfolio"
                className="group inline-flex items-center justify-center gap-2 rounded-sm border border-border bg-white px-6 py-3.5 text-[14px] font-medium transition-colors hover:border-foreground/30"
              >
                {content.secondaryCta}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.66 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5"
            >
              {["Custom designed, never templated", "Mobile-first and fast", "Direct communication"].map((t) => (
                <li key={t} className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-brand" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <motion.div style={{ x: driftX }}>
              <BrowserFrame label="maisonverre.com" className="relative z-10">
                <ConceptMockup slug="maison-verre" />
              </BrowserFrame>
            </motion.div>

            <div className="absolute -bottom-12 -left-4 z-20 w-[26%] min-w-[92px] sm:-bottom-14 sm:-left-8">
              <PhoneFrame>
                <ConceptPhoneMockup slug="maison-verre" />
              </PhoneFrame>
            </div>

            <div className="absolute -right-2 -top-6 z-20 rounded-sm border border-black/10 bg-white/95 px-3.5 py-2.5 shadow-[0_18px_40px_-20px_rgba(10,10,11,0.4)] backdrop-blur sm:-right-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Design → Build → Launch</p>
              <p className="mt-1 text-[12px] font-medium">One studio, end to end</p>
            </div>

            <div className="absolute -bottom-4 right-2 z-20 hidden rounded-sm border border-black/10 bg-obsidian px-3.5 py-2.5 text-white sm:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">Performance</p>
              <p className="mt-0.5 text-[12px] font-medium">Built to load fast</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}