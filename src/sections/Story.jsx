import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { RESORT, STORY } from "@/data/site";

// The founding line lights up word by word as you read down (Motion, scroll-linked),
// then the numbers that define the place count up (anime.js, data-count in scroll-fx).
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, ["blur(3px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, filter: blur }} className="mr-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}

export default function Story() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = STORY.origin.split(" ");

  return (
    <section id="story" className="relative bg-mist px-4 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-6xl">
        <p className="stamp mb-10 text-xs text-moss">Est. {RESORT.opened} · Our story</p>
        <p ref={ref} className="font-display text-[clamp(1.9rem,4.4vw,4rem)] font-light leading-[1.12] tracking-[-0.01em] text-pine-deep">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w}
            </Word>
          ))}
        </p>

        <div className="mt-20 grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div className="reveal space-y-5 text-lg leading-relaxed text-night/75">
            <p>{STORY.opened} {STORY.place}</p>
            <p>
              It is a place for families, barkadas and teams who want the mountain to themselves: {STORY.design.toLowerCase()} Bring your own food, light the bonfire, and stay up for the stars.
            </p>
          </div>
          <dl data-stagger className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-night/10 pt-10">
            {[
              [RESORT.altitude, "", "m", "above sea level"],
              [RESORT.hectares, "", "ha", "of mountain forest"],
              [RESORT.kmFromCity, "", "km", "from Cebu City"],
              [12, "", "+", "guests, one group only"],
            ].map(([n, , unit, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-6xl font-light text-pine md:text-7xl">
                  <span className="tnum" data-count={n}>{n}</span>
                  <span className="ml-1 text-2xl italic text-moss">{unit}</span>
                </dd>
                <p className="stamp mt-2 text-xs text-night/50">{label}</p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
