import { Star } from "lucide-react";
import { REVIEWS } from "@/data/site";

// Two rows drifting in opposite directions (CSS, linear: constant motion), paused on hover.
function Row({ items, reverse }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 gap-5 pr-5 [animation:marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:[animation:none]"
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {items.map((r) => (
            <li key={r.name} className="w-[min(78vw,24rem)] shrink-0 rounded-3xl border border-mist/10 bg-mist/[0.04] p-7">
              <div className="mb-4 flex gap-0.5 text-lantern" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" aria-hidden="true" />)}
              </div>
              <p className="font-display text-xl leading-snug text-mist/90">“{r.text}”</p>
              <p className="stamp mt-5 text-xs text-moss">{r.name}</p>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="grain relative overflow-hidden bg-pine-deep py-28 text-mist md:py-36">
      <div className="mx-auto mb-14 max-w-6xl px-4 sm:px-8">
        <p className="stamp mb-5 text-xs text-lantern">Guest words</p>
        <h2 id="reviews-title" data-split className="max-w-[18ch] font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1]">
          “Why go to Baguio?”
        </h2>
      </div>
      <div className="space-y-5">
        <Row items={REVIEWS.slice(0, 3)} />
        <Row items={REVIEWS.slice(3)} reverse />
      </div>
    </section>
  );
}
