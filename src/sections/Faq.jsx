import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { FAQ } from "@/data/site";
import { Link } from "@/lib/router";

const EASE = [0.23, 1, 0.32, 1];
const pad = (n) => String(n + 1).padStart(2, "0");

// <details> keeps it keyboard and screen-reader friendly for free; the open/close animation is CSS (index.css).
// The photo beside the list follows the question being hovered, else the one last opened.
export default function Faq() {
  const [open, setOpen] = useState(0);
  const [hover, setHover] = useState(null);
  const i = hover ?? open;
  const [q, , src] = FAQ[i];

  return (
    <section id="faq" className="relative bg-mist px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_1.35fr] md:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="stamp mb-5 text-xs text-moss">Good to know</p>
          <h2 data-split className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1] text-pine-deep">
            Before you drive up.
          </h2>
          <figure className="reveal relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-3xl bg-night md:aspect-auto md:h-[min(58vh,540px)]">
            <AnimatePresence initial={false}>
              <motion.img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/80 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-mist" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={q}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="max-w-[24ch] font-display text-xl leading-tight"
                >
                  {q}
                </motion.span>
              </AnimatePresence>
              <span className="stamp shrink-0 text-xs tabular-nums text-mist/70">
                {pad(i)} / {pad(FAQ.length - 1)}
              </span>
            </figcaption>
          </figure>
        </div>

        <div data-stagger className="border-t border-night/10" onMouseLeave={() => setHover(null)}>
          {FAQ.map(([q, a], n) => (
            <details
              key={q}
              className="faq group border-b border-night/10"
              onToggle={(e) => e.currentTarget.open && setOpen(n)}
              onMouseEnter={() => setHover(n)}
            >
              <summary className="flex cursor-pointer items-center gap-5 py-6 text-lg font-medium text-night/90">
                <span className={`stamp w-6 shrink-0 text-xs tabular-nums transition-colors duration-200 ${n === i ? "text-lantern" : "text-night/30"}`}>
                  {pad(n)}
                </span>
                <span className="flex-1 transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1">{q}</span>
                <Plus size={20} className="plus shrink-0 text-moss" aria-hidden="true" />
              </summary>
              <p className="pb-6 pl-11 leading-relaxed text-night/65">{a}</p>
            </details>
          ))}
          <p className="pt-6 text-night/60">
            Deposits, cancellations and house rules in full:{" "}
            <Link to="/terms" className="font-medium text-pine underline decoration-pine/30 underline-offset-4 hover:decoration-pine">Terms & Conditions</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
