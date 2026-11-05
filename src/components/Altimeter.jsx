import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { useRef } from "react";
import { RESORT } from "@/data/site";

// The page is a climb: scrolling from the top to the bottom takes you from sea level to 816 m.
// A thin rail on the right edge, with a needle and a live readout. Desktop only.
export default function Altimeter() {
  const { scrollYProgress } = useScroll();
  const top = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
  const out = useRef(null);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (out.current) out.current.textContent = Math.round(p * RESORT.altitude);
  });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-5 top-1/2 z-40 hidden h-[46vh] -translate-y-1/2 mix-blend-difference xl:block">
      <div className="relative h-full w-px bg-white/25">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute right-0 h-px w-2 bg-white/40" style={{ top: `${i * 12.5}%` }} />
        ))}
        <motion.div className="absolute right-0 flex -translate-y-1/2 items-center gap-2" style={{ top }}>
          <span className="tnum stamp whitespace-nowrap text-[11px] text-white">
            <span ref={out}>0</span> m
          </span>
          <span className="h-px w-4 bg-white" />
        </motion.div>
      </div>
    </div>
  );
}
