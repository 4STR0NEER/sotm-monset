import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { createTimeline, splitText, stagger, utils } from "animejs";
import { ArrowDown } from "lucide-react";
import { Link } from "@/lib/router";
import { RESORT } from "@/data/site";

// Fog rolling over the ridges (stock clip), the headline rising out of it once the loader lifts.
// Scrolling away pushes the video back and lets the copy drift up into the fog.
export default function Hero({ ready }) {
  const root = useRef(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const split = splitText(el.querySelector("h1"), { words: { wrap: "clip" } });
    if (reduce) return () => split.revert();
    const tl = createTimeline({ defaults: { ease: "out(4)" } });
    tl.add(el.querySelector("[data-video]"), { scale: [1.12, 1], opacity: [0, 1], duration: 2200 }, 0)
      .add(split.words, { y: ["110%", "0%"], duration: 1100, delay: stagger(60) }, 250)
      .add(el.querySelectorAll("[data-in]"), { opacity: [0, 1], y: [16, 0], duration: 800, delay: stagger(90) }, 800);
    return () => (tl.revert(), split.revert());
  }, [ready]);

  return (
    <section ref={root} className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-night text-mist">
      <motion.div className="absolute inset-0" style={{ scale }}>
        <video
          data-video
          className="h-full w-full object-cover opacity-0"
          src="/video/hero-fog.mp4"
          poster="/video/hero-fog.jpg"
          autoPlay
          muted
          loop
          playsInline
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-night/50 via-night/10 to-night/85" />

      <motion.div style={{ y: copyY, opacity: fade }} className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 sm:px-8 md:pb-20">
        <p data-in className="stamp mb-6 text-xs text-fog/80 opacity-0 sm:text-sm">
          Balamban, Cebu · {RESORT.altitude} m above sea level
        </p>
        <h1 className="max-w-[14ch] font-display text-[clamp(2.9rem,8.2vw,7.5rem)] font-light leading-[0.95] tracking-[-0.02em]">
          Above the fog, the <em className="text-lantern">whole mountain</em> is yours.
        </h1>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p data-in className="max-w-md text-base leading-relaxed text-fog/85 opacity-0 sm:text-lg">
            An exclusive mountain retreat {RESORT.driveFromCity} from Cebu City, overlooking Mt. Manunggal. Two private stays, each to one group at a time.
          </p>
          <div data-in className="flex flex-wrap gap-3 opacity-0">
            <Link to="/book" className="rounded-full bg-lantern px-7 py-3.5 font-semibold text-night transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
              Book the mountain
            </Link>
            <Link to="/#packages" className="rounded-full border border-mist/30 px-7 py-3.5 font-semibold text-mist backdrop-blur-sm transition-colors duration-200 hover:border-mist/70">
              See packages
            </Link>
          </div>
        </div>
      </motion.div>

      <ArrowDown aria-hidden="true" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-mist/50 md:block" size={18} />
    </section>
  );
}
