import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Postcards from "@/components/Postcards";
import { Link } from "@/lib/router";
import { RATE_TIERS, STAYS, peso } from "@/data/site";

// The rooms as postcards left on the long wooden table (components/Postcards.jsx).
// The section itself is the table: dark timber grain under a warm pool of light.
const WOOD = {
  backgroundColor: "#2a1b12",
  backgroundImage: [
    "radial-gradient(ellipse 55% 60% at 68% 52%, rgb(233 166 80 / 0.22), transparent 70%)",
    "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.018) 0 2px, transparent 2px 9px, rgb(0 0 0 / 0.05) 9px 11px, transparent 11px 23px)",
    "repeating-linear-gradient(90deg, transparent 0 180px, rgb(0 0 0 / 0.35) 180px 182px)",
    "linear-gradient(180deg, #24170f, #33221a 50%, #22160e)",
  ].join(","),
};

// Two stays, one switch. The copy cross-fades through a slight blur (it reads as one thing changing,
// not two swapping); the postcard pile is re-dealt for the chosen stay.
export default function Rooms() {
  const [id, setId] = useState("lodge");
  const stay = STAYS[id];
  return (
    <section id="rooms" className="grain relative overflow-hidden px-4 py-28 text-mist sm:px-8 md:py-36" style={WOOD}>
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_1.35fr]">
        <div>
          <p className="stamp mb-5 text-xs text-lantern">Where you'll sleep</p>
          <h2 data-split className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1]">
            Two places, each yours alone.
          </h2>
          <div role="tablist" aria-label="Stays" className="reveal mt-8 inline-flex rounded-full bg-mist/[0.07] p-1">
            {Object.values(STAYS).map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={s.id === id}
                onClick={() => setId(s.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97] ${
                  s.id === id ? "bg-lantern text-night" : "text-fog/70 hover:text-mist"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={id}
              role="tabpanel"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              <p className="mt-6 max-w-md text-lg leading-relaxed text-fog/75">{stay.blurb}</p>
              <dl className="mt-8 max-w-md">
                {stay.specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 border-b border-mist/10 py-3.5">
                    <dt className="stamp text-xs text-fog/45">{k}</dt>
                    <dd className="text-right text-fog/85">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link to={`/book?package=${id}`} className="rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
                  Book the {stay.name}
                </Link>
                <span className="text-sm text-fog/60">From {peso(RATE_TIERS[0][1])} a night for 10</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <Postcards key={id} cards={stay.postcards} />
      </div>
    </section>
  );
}
