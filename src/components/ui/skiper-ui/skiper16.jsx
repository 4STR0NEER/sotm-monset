import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

// Skiper 16 StickyCard_001 (skiper-ui.com), adapted: cards hold a photo and copy instead of a bare
// image, size to the viewport, and use the site-wide Lenis. Each card pins, then shrinks back and
// dims as the next one slides over it, so the list reads like a stack of postcards.
function StickyCard({ i, item, progress, range, targetScale }) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const dim = useTransform(progress, range, [0, 0.45]);
  return (
    <div className="sticky top-0 flex h-screen items-center justify-center px-3 sm:px-6">
      <motion.article
        style={{ scale, top: `calc(-5vh + ${i * 22}px)` }}
        className="relative grid h-[78vh] w-full max-w-6xl origin-top grid-rows-[minmax(0,42%)_1fr] overflow-hidden rounded-[2rem] bg-pine-deep text-mist md:grid-rows-1 md:grid-cols-[1.35fr_1fr]"
      >
        <div className="relative min-h-0 overflow-hidden">
          <img src={item.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex min-h-0 flex-col justify-end gap-3 overflow-hidden p-6 md:gap-4 md:p-12">
          <span className="stamp text-xs text-lantern">0{i + 1}</span>
          <h3 className="font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-light leading-[1.02]">{item.title}</h3>
          <p className="max-w-sm text-[15px] leading-relaxed text-fog/75 md:text-base">{item.body}</p>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-night" />
      </motion.article>
    </div>
  );
}

export default function CardStack({ items }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  return (
    <div ref={container} className="relative">
      {items.map((item, i) => (
        <StickyCard
          key={item.id}
          i={i}
          item={item}
          progress={scrollYProgress}
          range={[i / items.length, 1]}
          targetScale={Math.max(0.6, 1 - (items.length - i - 1) * 0.05)}
        />
      ))}
    </div>
  );
}

/**
 * Skiper 16 StickyCard_001 — React + Motion
 * Free to use; attribution to Skiper UI (skiper-ui.com) is required for the free version.
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
