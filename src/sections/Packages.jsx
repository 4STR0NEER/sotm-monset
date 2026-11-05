import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import { Link } from "@/lib/router";
import { PACKAGES, peso } from "@/data/site";

const SHORT = { overnight: "Overnight", dayuse: "Day use", event: "Events", birthday: "Birthday", wedding: "Wedding" };

// Day use has two published rates; a small toggle swaps them with a quick vertical roll.
function Price({ pkg }) {
  const [weekend, setWeekend] = useState(false);
  const p = weekend && pkg.weekend ? pkg.weekend : pkg;
  return (
    <div>
      {pkg.weekend && (
        <div className="mb-4 inline-flex rounded-full bg-night/[0.06] p-1 text-xs font-medium">
          {["Weekday", "Weekend"].map((l, i) => (
            <button
              key={l}
              type="button"
              onClick={() => setWeekend(!!i)}
              className={`rounded-full px-3 py-1.5 transition-colors duration-200 ${weekend === !!i ? "bg-pine text-mist" : "text-night/55"}`}
            >
              {l}
            </button>
          ))}
        </div>
      )}
      <div className="relative h-[4.2rem] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={p.price ?? "ask"}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="tnum font-display text-6xl font-light text-pine-deep"
          >
            {p.price ? peso(p.price) : "On request"}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-1 text-sm text-night/55">
        {p.unit}
        {pkg.sample && <span className="ml-2 rounded-full bg-lantern/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-wood">Sample rate</span>}
      </p>
    </div>
  );
}

function Panel({ pkg }) {
  return (
    <div className="grid gap-0 overflow-hidden rounded-[2rem] bg-white/60 md:grid-cols-[1fr_1.1fr]">
      <div className="relative h-64 md:h-auto">
        <img src={pkg.src} alt="" loading="lazy" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-7 p-7 md:p-12">
        <h3 className="font-display text-3xl italic text-night/80">{pkg.name}</h3>
        <Price pkg={pkg} />
        <ul className="space-y-3">
          {pkg.lines.map((l) => (
            <li key={l} className="flex gap-3 text-night/75">
              <Check size={18} className="mt-0.5 shrink-0 text-moss" aria-hidden="true" />
              {l}
            </li>
          ))}
        </ul>
        <Link
          to={`/book?package=${pkg.id}`}
          className="mt-auto self-start rounded-full bg-pine px-7 py-3.5 font-semibold text-mist transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
        >
          {pkg.price ? "Book this" : "Ask for a quote"}
        </Link>
      </div>
    </div>
  );
}

export default function Packages() {
  return (
    <section id="packages" className="relative bg-mist px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="stamp mb-5 text-xs text-moss">Rates & packages</p>
          <h2 data-split className="mx-auto max-w-[16ch] font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1] text-pine-deep">
            Stay the night, or just the afternoon.
          </h2>
        </div>
        <div className="reveal">
          <SmoothTab
            className="max-w-none gap-8"
            label="Packages"
            activeColor="bg-pine"
            activeTextColor="text-mist"
            items={PACKAGES.map((p) => ({ id: p.id, title: SHORT[p.id], content: <Panel pkg={p} /> }))}
          />
        </div>
        <p className="mt-6 text-center text-xs text-night/45">Swipe the card or tap a tab. Rates as published by the resort; the overnight rate is a sample.</p>
      </div>
    </section>
  );
}
