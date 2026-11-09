import { useEffect, useRef } from "react";
import { animate, stagger, utils } from "animejs";

// Night falls: the string lights from the deck come on one by one (anime.js), then flicker
// gently like the real bulbs, over a slow bonfire clip.
const BULBS = 18;

export default function Bonfire() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    const bulbs = el.querySelectorAll("[data-bulb]");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return utils.set(bulbs, { opacity: 1 });
    let flicker;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(bulbs, {
        opacity: [0, 1],
        scale: [0.4, 1],
        duration: 500,
        delay: stagger(70, { from: "first" }),
        ease: "out(4)",
        onComplete: () => {
          flicker = animate(bulbs, {
            opacity: () => utils.random(0.55, 1, 2),
            duration: () => utils.random(500, 1400),
            delay: () => utils.random(0, 800),
            loop: true,
            alternate: true,
            ease: "inOut(2)",
          });
        },
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => (io.disconnect(), flicker?.revert());
  }, []);

  return (
    <section ref={root} aria-labelledby="bonfire-title" className="grain relative flex min-h-[110vh] items-end overflow-hidden bg-night text-mist">
      <video className="absolute inset-0 h-full w-full object-cover opacity-70" src="/video/bonfire.mp4" poster="/video/bonfire.jpg" autoPlay muted loop playsInline />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/80" />

      {/* the string of lights: a catenary sag drawn in SVG, bulbs hung along it */}
      <svg className="absolute inset-x-0 top-[12%] h-24 w-full" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 10 Q500 110 1000 10" stroke="rgb(238 240 233 / 0.25)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-x-0 top-[12%] h-24" aria-hidden="true">
        {Array.from({ length: BULBS }, (_, i) => {
          const t = (i + 0.5) / BULBS;
          const y = 10 + 100 * 2 * t * (1 - t); // the quadratic curve above, at t
          return (
            <span
              key={i}
              data-bulb
              className="absolute size-2.5 -translate-x-1/2 rounded-full bg-lantern opacity-0 shadow-[0_0_18px_6px_rgb(233_166_80/0.55)]"
              style={{ left: `${t * 100}%`, top: `${y}%` }}
            />
          );
        })}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8 md:pb-28">
        <p className="stamp mb-5 text-xs text-lantern">After dark</p>
        <h2 id="bonfire-title" data-split className="max-w-[15ch] font-display text-[clamp(2.6rem,6.5vw,6rem)] font-light leading-[0.98]">
          Signature bonfire sessions under a sky full of stars.
        </h2>
        <p className="reveal mt-8 max-w-md text-lg leading-relaxed text-fog/75">
          The air turns cold up here at night. Pull the chairs in close and let the valley go quiet below you. Marshmallows and long forks included, ₱500 for the whole group.
        </p>
      </div>
    </section>
  );
}
