import HoverExpand from "@/components/ui/skiper-ui/skiper52";
import { ROOM, STORY } from "@/data/site";

export default function Rooms() {
  return (
    <section id="rooms" className="relative bg-mist px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="stamp mb-5 text-xs text-moss">Where you'll sleep</p>
            <h2 data-split className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1] text-pine-deep">
              {ROOM.name}
            </h2>
          </div>
          <p className="reveal max-w-md text-lg leading-relaxed text-night/70">{ROOM.blurb}</p>
        </div>

        <HoverExpand images={ROOM.photos} />

        <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <blockquote className="reveal self-start border-l-2 border-crimson pl-6">
            <p className="font-display text-2xl italic leading-snug text-crimson">“{STORY.verse.text}”</p>
            <footer className="stamp mt-3 text-xs text-night/50">{STORY.verse.ref} · painted on the bedroom wall</footer>
          </blockquote>
          <dl data-stagger className="grid gap-x-10 sm:grid-cols-2">
            {ROOM.specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-night/10 py-4">
                <dt className="stamp text-xs text-night/45">{k}</dt>
                <dd className="text-right text-night/85">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
