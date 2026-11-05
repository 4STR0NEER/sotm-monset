import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { animate, stagger, svg } from "animejs";

// "What's up here" as a walk around the property: a hand-drawn trail with photo pins. Hover (or tap)
// a pin and its photo flies out into a full card (Motion shared layout) while the trail lights up,
// lantern-orange, from the gate to that stop. anime.js draws the trail and drops the pins in on entry.

// Pin positions in % of the stage, for the wide map and the tall phone map. Gate first, creek last.
const WIDE = [[3, 84], [15, 58], [34, 26], [53, 62], [72, 28], [88, 60], [99, 90]];
const TALL = [[50, 1], [26, 13], [72, 30], [28, 48], [72, 65], [30, 83], [62, 99]];

// Smooth path through points (Catmull-Rom → cubic Bézier), one segment per hop.
function segments(pts) {
  const p = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  return pts.slice(0, -1).map((_, i) => {
    const [x0, y0] = p(i - 1), [x1, y1] = p(i), [x2, y2] = p(i + 1), [x3, y3] = p(i + 2);
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    return `M${x1} ${y1} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x2} ${y2}`;
  });
}

function useTall() {
  const q = "(max-width: 767px)";
  const [tall, setTall] = useState(() => matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const on = () => setTall(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return tall;
}

export default function TrailMap({ stops }) {
  const root = useRef(null);
  const tall = useTall();
  const [active, setActive] = useState(null);
  const pts = tall ? TALL : WIDE;
  const segs = segments(pts);
  const at = active === null ? -1 : stops.findIndex((s) => s.id === active);

  // the trail draws itself and the pins drop in, once, when the map scrolls into view
  useEffect(() => {
    const el = root.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pins = el.querySelectorAll("[data-pin]");
    const path = svg.createDrawable(el.querySelectorAll("[data-trail]"));
    const anims = [
      animate(path, { draw: "0 0", duration: 0 }),
      animate(pins, { opacity: 0, scale: 0.6, duration: 0 }),
    ];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      anims.push(
        animate(path, { draw: ["0 0", "0 1"], duration: 900, delay: stagger(220), ease: "inOut(2)" }),
        animate(pins, { opacity: 1, scale: 1, duration: 700, delay: stagger(220, { start: 300 }), ease: "out(4)" })
      );
    }, { threshold: 0.3 });
    io.observe(el);
    return () => (io.disconnect(), anims.forEach((a) => a.revert()));
  }, [tall]);

  const current = stops[at];
  const [px, py] = at >= 0 ? pts[at + 1] : [0, 0];
  // the card opens on the side of the map away from its pin
  const cardPos = tall
    ? { left: "7%", right: "7%", top: `${Math.min(Math.max(py - 20, 2), 52)}%` }
    : { [px < 50 ? "right" : "left"]: "4%", top: "50%", y: "-50%" };

  return (
    <LayoutGroup>
      <div
        ref={root}
        className={`relative mx-auto w-full max-w-7xl ${tall ? "aspect-[3/5]" : "aspect-[16/9]"}`}
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
      >
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {segs.map((d, i) => (
            <g key={i}>
              <path data-trail d={d} fill="none" stroke="rgb(13 23 18 / 0.28)" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <motion.path
                d={d}
                fill="none"
                stroke="var(--color-lantern)"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ pathLength: i <= at ? 1 : 0, opacity: i <= at ? 1 : 0 }}
                transition={{ duration: 0.45, delay: i <= at ? i * 0.09 : 0, ease: [0.77, 0, 0.175, 1] }}
              />
            </g>
          ))}
        </svg>

        {/* gate and creek */}
        {[
          [pts[0], "The gate"],
          [pts[pts.length - 1], "To the hidden creek & waterfalls"],
        ].map(([[x, y], label], n) => (
          <span
            key={label}
            className={`stamp absolute whitespace-nowrap text-[11px] text-night/50 ${n ? "-translate-x-full -translate-y-[160%]" : "translate-x-3 -translate-y-[140%]"}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {label}
          </span>
        ))}

        {stops.map((s, i) => {
          const [x, y] = pts[i + 1];
          const on = active === s.id;
          return (
            <div key={s.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%`, zIndex: on ? 5 : 1 }}>
              <div data-pin>
                <motion.button
                  type="button"
                  aria-expanded={on}
                  aria-label={s.title}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(s.id)}
                  onFocus={() => setActive(s.id)}
                  onClick={() => setActive(on ? null : s.id)}
                  animate={{
                    rotate: on ? 0 : i % 2 ? 4 : -4,
                    opacity: active && !on ? 0.5 : 1,
                    filter: active && !on ? "blur(1.5px) saturate(0.6)" : "blur(0px) saturate(1)",
                  }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="block w-24 rounded-2xl bg-mist p-1.5 shadow-[0_14px_30px_-12px_rgb(13_23_18/0.5)] sm:w-36"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-night/10">
                    {!on && <motion.img layoutId={`trail-${s.id}`} src={s.src} alt="" className="absolute inset-0 h-full w-full object-cover" transition={{ type: "spring", bounce: 0.1, duration: 0.55 }} />}
                  </span>
                  <span className="stamp block truncate px-1 pb-0.5 pt-1.5 text-center text-[10px] text-night/70 sm:text-[11px]">{s.title}</span>
                </motion.button>
              </div>
            </div>
          );
        })}

        <AnimatePresence>
          {current && (
            <motion.article
              key={current.id}
              onClick={() => setActive(null)}
              className="absolute z-10 w-auto cursor-pointer md:pointer-events-none overflow-hidden rounded-[1.75rem] bg-pine-deep text-mist shadow-[0_40px_80px_-30px_rgb(13_23_18/0.7)] md:w-[38%]"
              style={cardPos}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <motion.img layoutId={`trail-${current.id}`} src={current.src} alt={current.title} className="absolute inset-0 h-full w-full object-cover" transition={{ type: "spring", bounce: 0.1, duration: 0.55 }} />
              </div>
              <motion.div
                className="space-y-2 p-5 md:p-7"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
              >
                <p className="stamp text-xs text-lantern">Stop 0{at + 1} of 0{stops.length}</p>
                <h3 className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-light leading-[1.05]">{current.title}</h3>
                <p className="text-sm leading-relaxed text-fog/75 md:text-base">{current.body}</p>
              </motion.div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
