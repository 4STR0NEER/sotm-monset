import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Skiper 52 HoverExpand_001 (skiper-ui.com), adapted: the resort's room photos with captions,
// sizes from the container instead of fixed rems, a spring for the width so quick hovers never jump,
// and a swipeable row on touch screens (no hover there).
export default function HoverExpand({ images, className }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <div className={cn("hidden h-[30rem] w-full gap-2 md:flex", className)}>
        {images.map((img, i) => (
          <motion.button
            key={img.src}
            type="button"
            aria-label={img.alt}
            aria-pressed={active === i}
            className="relative h-full min-w-0 cursor-pointer overflow-hidden rounded-3xl"
            animate={{ flexGrow: active === i ? 6 : 1 }}
            style={{ flexBasis: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.55 }}
            onClick={() => setActive(i)}
            onHoverStart={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <img src={img.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="absolute inset-0 flex items-end bg-gradient-to-t from-night/70 to-transparent p-5 text-left"
                >
                  <p className="max-w-xs text-sm text-mist/90">{img.alt}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {images.map((img) => (
          <figure key={img.src} className="relative h-80 w-[78%] shrink-0 snap-center overflow-hidden rounded-3xl">
            <img src={img.src} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 p-4 text-sm text-mist/90">{img.alt}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

/**
 * Skiper 52 HoverExpand_001 — React + Motion
 * Free to use; attribution to Skiper UI (skiper-ui.com) is required for the free version.
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
