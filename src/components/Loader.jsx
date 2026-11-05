import { useEffect, useRef } from "react";
import { createTimeline, svg, utils } from "animejs";
import Mark from "./Mark";
import { RESORT } from "@/data/site";

// First arrival only: the emblem draws itself while the altimeter climbs from sea level to 816 m,
// then the fog curtain lifts off the hero. ~2.6s, skippable by reduced motion.
export default function Loader({ onDone }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const meters = el.querySelector("[data-m]");
    const alt = { v: 0 };
    const paths = svg.createDrawable(el.querySelectorAll("path"));
    const tl = createTimeline({ defaults: { ease: "inOut(3)" }, onComplete: onDone });
    tl.add(paths, { draw: ["0 0", "0 1"], duration: 1100, delay: (_, i) => i * 90 }, 0)
      .add(alt, {
        v: RESORT.altitude,
        duration: 1900,
        ease: "out(3)",
        onUpdate: () => (meters.textContent = Math.round(alt.v)),
      }, 100)
      .add(el.querySelector("[data-meta]"), { opacity: [0, 1], y: [8, 0], duration: 600, ease: "out(4)" }, 300)
      .add(el.querySelector("[data-inner]"), { opacity: 0, y: -24, filter: "blur(8px)", duration: 500, ease: "in(2)" }, 2050)
      .add(el, { clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"], duration: 900, ease: "inOut(4)" }, 2250);
    return () => {
      tl.revert();
      utils.remove(alt);
    };
  }, [onDone]);

  return (
    <div ref={root} className="grain fixed inset-0 z-[100] grid place-items-center bg-night text-mist" style={{ clipPath: "inset(0 0 0% 0)" }}>
      <div data-inner className="flex flex-col items-center gap-8">
        <Mark className="w-24 text-fog" />
        <div data-meta className="flex flex-col items-center gap-2 opacity-0">
          <p className="tnum font-display text-5xl italic">
            <span data-m>0</span>
            <span className="ml-1 text-2xl not-italic text-moss">m</span>
          </p>
          <p className="stamp text-xs text-moss">Climbing to Balamban</p>
        </div>
      </div>
    </div>
  );
}
