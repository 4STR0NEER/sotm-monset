import { useRef } from "react";
import { useScroll } from "motion/react";
import TrailPath from "@/components/ui/skiper-ui/skiper19";
import { Link } from "@/lib/router";
import { RESORT } from "@/data/site";

// The last climb: a trail draws itself up the page as you scroll, ending at the booking button.
export default function Closing() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  return (
    <section ref={ref} className="grain relative h-[150vh] overflow-clip bg-night text-mist">
      <TrailPath progress={scrollYProgress} className="absolute left-1/2 top-0 h-full -translate-x-1/2 text-moss" />
      <div className="sticky top-0 z-10 flex h-screen flex-col items-center justify-center px-6 text-center">
        <div aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[min(56rem,140vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,var(--color-night)_55%,transparent)]" />
        <span className="logo-mask mb-10 block w-20 text-fog" />
        <h2 data-split className="max-w-[14ch] font-display text-[clamp(2.6rem,7vw,6.5rem)] font-light leading-[0.98]">
          The mountain is waiting.
        </h2>
        <p className="reveal mt-6 max-w-sm text-fog/70">Strictly by reservation. Pick your dates and it's all yours.</p>
        <div className="reveal mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/book" className="rounded-full bg-lantern px-8 py-4 font-semibold text-night transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
            Check dates
          </Link>
          <a href={RESORT.phoneHref} className="rounded-full border border-mist/25 px-8 py-4 font-semibold transition-colors hover:border-mist/60">
            Call {RESORT.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
