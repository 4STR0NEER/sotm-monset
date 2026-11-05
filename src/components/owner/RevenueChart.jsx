import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { peso } from "@/data/site";

// Revenue by check-in month, two stacked parts: secured (confirmed + completed) and pending
// (requested, hatched). One axis, thin bars with rounded tops anchored to the baseline, a 2px gap
// between the stacked parts, a hover tooltip per bar, and the bars grow up once (anime.js).
const H = 220;
const k = (n) => (n >= 1e6 ? `₱${+(n / 1e6).toFixed(1)}M` : n >= 1000 ? `₱${Math.round(n / 1000)}k` : `₱${n}`);

export default function RevenueChart({ data, current }) {
  const root = useRef(null);
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.secured + d.pending));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = animate(root.current.querySelectorAll("[data-bar]"), {
      scaleY: [0, 1],
      duration: 900,
      delay: stagger(50),
      ease: "out(4)",
    });
    return () => a.revert();
  }, []);

  const label = (key) => new Date(key + "-01T00:00:00Z").toLocaleDateString("en-PH", { month: "short", timeZone: "UTC" });

  return (
    <figure ref={root} className="relative">
      <figcaption className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-night/60">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-pine" />Secured</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-pine/60" style={{ backgroundImage: "repeating-linear-gradient(45deg,#21503a66 0 1.5px,transparent 1.5px 4px)" }} />
          Pending requests
        </span>
      </figcaption>
      <div className="relative flex gap-3 pl-10" style={{ height: H }}>
        {ticks.map((t) => (
          <div key={t} className="pointer-events-none absolute inset-x-0 flex items-center gap-2" style={{ bottom: (t / top) * H - 6 }}>
            <span className="tnum w-8 text-right text-[11px] text-night/40">{k(t)}</span>
            <span className="h-px flex-1 bg-night/[0.07]" />
          </div>
        ))}
        {data.map((d, i) => {
          const hs = (d.secured / top) * H;
          const hp = (d.pending / top) * H;
          return (
            <button
              key={d.key}
              type="button"
              className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${label(d.key)}: ${peso(d.secured)} secured, ${peso(d.pending)} pending`}
            >
              <div data-bar className="flex w-full max-w-9 origin-bottom flex-col items-stretch gap-[2px]">
                {hp > 0 && (
                  <div
                    className="rounded-t-[4px] border border-pine/50"
                    style={{ height: Math.max(hp - 2, 2), backgroundImage: "repeating-linear-gradient(45deg,#21503a55 0 1.5px,transparent 1.5px 4px)" }}
                  />
                )}
                {hs > 0 && (
                  <div
                    className={`${hp > 0 ? "" : "rounded-t-[4px]"} transition-opacity duration-150 ${d.key === current ? "bg-pine" : "bg-pine/75"} ${hover !== null && hover !== i ? "opacity-50" : ""}`}
                    style={{ height: hs }}
                  />
                )}
              </div>
              <span className={`tnum absolute -bottom-6 text-[11px] ${d.key === current ? "font-semibold text-night" : "text-night/45"}`}>{label(d.key)}</span>
              {hover === i && (
                <div className="pointer-events-none absolute z-10 w-max rounded-xl bg-night px-3 py-2 text-left text-xs text-mist shadow-lg" style={{ bottom: hs + hp + 10 }}>
                  <p className="font-semibold">{new Date(d.key + "-01T00:00:00Z").toLocaleDateString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
                  <p className="tnum mt-1 text-fog/80">Secured {peso(d.secured)}</p>
                  <p className="tnum text-fog/80">Pending {peso(d.pending)}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="h-6" />
    </figure>
  );
}
