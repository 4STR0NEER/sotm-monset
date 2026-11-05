import Postcards from "@/components/Postcards";
import { ROOM } from "@/data/site";

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

export default function Rooms() {
  return (
    <section id="rooms" className="grain relative overflow-hidden px-4 py-28 text-mist sm:px-8 md:py-36" style={WOOD}>
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_1.35fr]">
        <div>
          <p className="stamp mb-5 text-xs text-lantern">Where you'll sleep</p>
          <h2 data-split className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1]">
            {ROOM.name}
          </h2>
          <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-fog/75">{ROOM.blurb}</p>
          <dl data-stagger className="mt-10 max-w-md">
            {ROOM.specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-mist/10 py-3.5">
                <dt className="stamp text-xs text-fog/45">{k}</dt>
                <dd className="text-right text-fog/85">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Postcards cards={ROOM.postcards} />
      </div>
    </section>
  );
}
