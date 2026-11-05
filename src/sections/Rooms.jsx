import { useState } from "react";
import { motion } from "motion/react";
import Lantern from "@/components/Lantern";
import { ROOM, STORY } from "@/data/site";

// The rooms, explored at night by lantern light (components/Lantern.jsx).
export default function Rooms() {
  const [i, setI] = useState(0);
  const scenes = ROOM.scenes;

  return (
    <section id="rooms" className="grain relative bg-night px-4 py-28 text-mist sm:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="stamp mb-5 text-xs text-lantern">Where you'll sleep · by lantern light</p>
            <h2 data-split className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1]">
              {ROOM.name}
            </h2>
          </div>
          <div className="reveal max-w-md space-y-3">
            <p className="text-lg leading-relaxed text-fog/75">{ROOM.blurb}</p>
            <p className="stamp text-xs text-moss">
              <span className="[@media(pointer:coarse)]:hidden">Move the lantern through the room</span>
              <span className="[@media(pointer:fine)]:hidden">Tap anywhere to carry the lantern there</span>
            </p>
          </div>
        </div>

        <Lantern scene={scenes[i]} />

        <div className="mt-5 flex snap-x gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Rooms">
          {scenes.map((s, n) => (
            <button
              key={s.name}
              role="tab"
              aria-selected={i === n}
              onClick={() => setI(n)}
              className={`relative shrink-0 snap-start px-4 pb-3 pt-2 text-left transition-colors duration-200 ${i === n ? "text-mist" : "text-fog/45 hover:text-fog/80"}`}
            >
              <span className="stamp mr-2 text-[11px] text-lantern/80">0{n + 1}</span>
              <span className="text-sm sm:text-base">{s.name}</span>
              {i === n && (
                <motion.span
                  layoutId="room-tab"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-lantern shadow-[0_0_12px_rgb(233_166_80/0.8)]"
                  transition={{ type: "spring", bounce: 0, duration: 0.45 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <blockquote className="reveal self-start border-l-2 border-crimson pl-6">
            <p className="font-display text-2xl italic leading-snug text-[#e6a0ae]">“{STORY.verse.text}”</p>
            <footer className="stamp mt-3 text-xs text-fog/45">{STORY.verse.ref} · painted on the bedroom wall</footer>
          </blockquote>
          <dl data-stagger className="grid gap-x-10 sm:grid-cols-2">
            {ROOM.specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-mist/10 py-4">
                <dt className="stamp text-xs text-fog/45">{k}</dt>
                <dd className="text-right text-fog/85">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
