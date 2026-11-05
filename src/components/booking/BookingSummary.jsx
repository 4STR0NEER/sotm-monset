import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { animate } from "animejs";
import SlideToConfirm from "@/components/kokonutui/slide-to-confirm";
import { peso } from "@/data/site";

// The total tweens to its new value (anime.js) instead of jumping, so every change reads as a change.
function Total({ value }) {
  const ref = useRef(null);
  const shown = useRef({ v: value });
  useEffect(() => {
    const anim = animate(shown.current, {
      v: value,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600,
      ease: "out(4)",
      onUpdate: () => ref.current && (ref.current.textContent = peso(Math.round(shown.current.v))),
    });
    return () => anim.pause();
  }, [value]);
  return <span ref={ref} className="tnum">{peso(value)}</span>;
}

export default function BookingSummary({ pkg, booking, quote, missing, onConfirm, datesText }) {
  const ready = missing.length === 0;
  return (
    <div className="overflow-hidden rounded-[2rem] bg-pine-deep text-mist shadow-[0_30px_60px_-30px_rgb(13_23_18/0.6)]">
      <div className="relative h-36 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={pkg.src}
            src={pkg.src}
            alt=""
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-pine-deep to-transparent" />
      </div>

      <div className="space-y-6 p-6 pt-2 sm:p-8 sm:pt-2">
        <div>
          <p className="stamp text-xs text-lantern">Your stay</p>
          <p className="mt-1 font-display text-3xl italic">{pkg.name}</p>
          <p className="mt-1 text-sm text-fog/65">{datesText ?? "No dates yet"}</p>
          <p className="text-sm text-fog/65">
            {booking.guests} guest{booking.guests > 1 ? "s" : ""}
            {booking.kids ? ` · ${booking.kids} child${booking.kids > 1 ? "ren" : ""}` : ""}
            {booking.pets ? ` · ${booking.pets} pet${booking.pets > 1 ? "s" : ""}` : ""}
          </p>
        </div>

        <ul className="space-y-2 border-t border-mist/10 pt-5 text-sm">
          <AnimatePresence initial={false}>
            {quote.lines.map(([label, amount]) => (
              <motion.li
                key={label.replace(/\d+/g, "#")}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="flex justify-between gap-4 text-fog/80"
              >
                <span>{label}</span>
                <span className="tnum shrink-0">{amount == null ? "on request" : peso(amount)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="flex items-end justify-between border-t border-mist/10 pt-5">
          <div>
            <p className="text-sm text-fog/60">{quote.onRequest ? "Quote" : "Total"}</p>
            <p className="font-display text-4xl font-light">{quote.onRequest ? "On request" : <Total value={quote.total} />}</p>
          </div>
          {!quote.onRequest && quote.total > 0 && (
            <p className="text-right text-sm text-fog/60">
              Deposit to hold
              <br />
              <span className="tnum text-mist"><Total value={quote.deposit} /></span>
            </p>
          )}
        </div>

        <div className="rounded-full bg-mist p-0.5">
          <SlideToConfirm
            label={quote.onRequest ? "Slide to request a quote" : "Slide to request booking"}
            confirmingLabel="Sending"
            doneLabel="Requested"
            disabled={!ready}
            resetAfter={null}
            onConfirm={onConfirm}
            className="max-w-none"
          />
        </div>
        <AnimatePresence initial={false}>
          {!ready && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden text-center text-sm text-fog/55"
            >
              To continue: {missing.join(", ")}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
