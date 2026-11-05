"use client";;
/**
 * @author: @dorianbaffier
 * @description: Boarding Pass
 * @version: 1.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Plane } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1];
/** Radius of the notches on either side of the tear line, in px. */
const NOTCH = 10;

const BASE = {
  airline: "Northwind",
  number: "NW 214",
  from: { code: "LIS", city: "Lisbon", time: "10:40" },
  to: { code: "CPH", city: "Copenhagen", time: "15:05" },
  date: "Thu, 12 Nov",
  gate: "B12",
  boards: "10:05",
  seat: "14A",
  group: "2",
  passenger: "Maya Chen",
  status: "on-time",
};

const DEMO = [
  BASE,
  {
    ...BASE,
    gate: "B31",
    status: "gate-change",
    note: "Gate moved to B31, 6 min walk",
  },
  {
    ...BASE,
    gate: "B31",
    boards: "10:30",
    from: { ...BASE.from, time: "11:05" },
    to: { ...BASE.to, time: "15:30" },
    status: "delayed",
    note: "Delayed 25 min, late inbound aircraft",
  },
  {
    ...BASE,
    gate: "B31",
    boards: "10:30",
    from: { ...BASE.from, time: "11:05" },
    to: { ...BASE.to, time: "15:30" },
    status: "boarding",
    note: "Group 2 is boarding now",
  },
];

const STATUS = {
  requested: { label: "Requested", tone: "bg-lantern/20 text-wood" },
  confirmed: { label: "Confirmed", tone: "bg-pine/10 text-pine" },
  "on-time": { label: "On time", tone: "bg-pine/10 text-pine" },
  "gate-change": { label: "Gate change", tone: "bg-lantern/20 text-wood" },
  delayed: { label: "Delayed", tone: "bg-crimson/10 text-crimson" },
  boarding: { label: "Boarding", tone: "bg-pine/10 text-pine" },
};

/** Remembers the value before the last change, so it can sit struck under the new one. */
function usePrevious(value) {
  const [state, setState] = useState({
    now: value,
    was: null,
  });
  if (state.now !== value) {
    setState({ now: value, was: state.now });
  }
  return state.was;
}

/**
 * A value where only the characters that changed roll over, one after
 * another, like a departures board updating one slot.
 */
function Flap({
  value,
  className,
  reduceMotion
}) {
  const was = usePrevious(value);
  let changed = 0;
  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{value}</span>
      {[...value].map((char, i) => {
        const moved = was !== null && was[i] !== char;
        const order = moved ? changed++ : 0;
        return (
          <span
            aria-hidden="true"
            className="relative inline-block overflow-hidden"
            key={`${i.toString()}-${value.length}`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ y: "0%", opacity: 1 }}
                className="inline-block whitespace-pre"
                exit={{ y: "100%", opacity: 0 }}
                initial={{ y: "-100%", opacity: 0 }}
                key={char}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.32, delay: order * 0.06, ease: EASE_OUT }
                }
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

function Field({
  label,
  value,
  previous,
  reduceMotion,
  large
}) {
  const changed = previous !== value;
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-night/55">{label}</p>
      <Flap
        className={cn(
          "font-semibold text-pine-deep tabular-nums tracking-tight transition-colors duration-300 ease-out",
          large ? "text-xl" : "text-base",
          changed && "text-ember"
        )}
        reduceMotion={reduceMotion}
        value={value}
      />
      <div className="mt-0.5 h-4">
        <AnimatePresence initial={false}>
          {changed && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-night/40 tabular-nums line-through decoration-night/30"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: -4 }}
              transition={{
                duration: reduceMotion ? 0 : 0.24,
                delay: reduceMotion ? 0 : 0.25,
                ease: EASE_OUT,
              }}
            >
              {previous}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** A barcode drawn from the passenger and flight, so each pass gets its own. */
function Barcode({
  seed
}) {
  let n = 7;
  for (const c of seed) {
    n = (n * 31 + c.charCodeAt(0)) % 2_147_483_647;
  }
  const bars = [];
  let x = 0;
  while (x < 200) {
    n = (n * 16_807) % 2_147_483_647;
    const w = 1 + (n % 3);
    n = (n * 16_807) % 2_147_483_647;
    const gap = 1 + (n % 3);
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg
      aria-hidden="true"
      className="h-10 w-full text-pine-deep"
      preserveAspectRatio="none"
      viewBox="0 0 200 40"
    >
      {bars.map((b) => (
        <rect fill="currentColor" height="40" key={b.x} width={b.w} x={b.x} />
      ))}
    </svg>
  );
}

/**
 * A boarding pass that keeps itself current. When the gate or times change,
 * only the characters that moved roll over, the new value turns orange, and
 * the old one stays underneath, struck through, so you can see what changed.
 */
// Adapted for SOTM: the 4 fields, the footnote, the passenger label and the icon come from props,
// so it can be a "mountain pass" for a booking instead of a flight.
export default function BoardingPass({
  flight,
  className,
  Icon = Plane,
  passengerLabel = "Passenger"
}) {
  const [step, setStep] = useState(0);
  const reduceMotion = Boolean(useReducedMotion());
  const current = flight ?? DEMO[step];
  // What the pass said when it was issued: the baseline for "changed".
  const [issued] = useState(current);
  const cardRef = useRef(null);
  const tearRef = useRef(null);
  const [tearY, setTearY] = useState(0);

  useEffect(() => {
    if (flight) {
      return;
    }
    const id = window.setInterval(
      () => setStep((s) => (s + 1) % DEMO.length),
      3200
    );
    return () => window.clearInterval(id);
  }, [flight]);

  useLayoutEffect(() => {
    const measure = () => {
      if (tearRef.current) {
        setTearY(tearRef.current.offsetTop);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const status = STATUS[current.status];
  const fade = { duration: reduceMotion ? 0 : 0.22, ease: EASE_OUT };
  const notches = `radial-gradient(circle ${NOTCH}px at 0 ${tearY}px, #0000 97%, #000 100%), radial-gradient(circle ${NOTCH}px at 100% ${tearY}px, #0000 97%, #000 100%)`;

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <div
        className="rounded-3xl border border-night/10 bg-white"
        ref={cardRef}
        style={{
          maskImage: notches,
          WebkitMaskImage: notches,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-medium text-sm text-pine-deep">
              <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-white">
                <Icon aria-hidden className="size-3.5" />
              </span>
              {current.airline}
              <span className="font-normal text-night/40">
                {current.number}
              </span>
            </p>
            <span
              className={cn(
                "relative inline-flex h-6 items-center overflow-hidden rounded-full px-2.5 font-medium text-[11px] transition-colors duration-300",
                status.tone
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={status.label}
                  transition={fade}
                >
                  {status.label}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-4xl text-pine-deep tracking-tight">
                {current.from.code}
              </p>
              <p className="truncate text-xs text-night/55">
                {current.from.city} ·{" "}
                <Flap
                  className={cn(
                    "tabular-nums transition-colors duration-300 ease-out",
                    current.from.time === issued.from.time
                      ? "text-night/70"
                      : "text-ember"
                  )}
                  reduceMotion={reduceMotion}
                  value={current.from.time}
                />
              </p>
            </div>
            <div className="mb-5 flex flex-1 items-center gap-1.5 text-night/25">
              <span className="h-px flex-1 border-current border-t border-dashed" />
              <Icon aria-hidden className="size-3.5 text-night/40" />
              <span className="h-px flex-1 border-current border-t border-dashed" />
            </div>
            <div className="min-w-0 text-right">
              <p className="font-semibold text-4xl text-pine-deep tracking-tight">
                {current.to.code}
              </p>
              <p className="truncate text-xs text-night/55">
                <Flap
                  className={cn(
                    "tabular-nums transition-colors duration-300 ease-out",
                    current.to.time === issued.to.time
                      ? "text-night/70"
                      : "text-ember"
                  )}
                  reduceMotion={reduceMotion}
                  value={current.to.time}
                />{" "}
                · {current.to.city}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            {(current.fields ?? [
              ["Gate", "gate"],
              ["Boards", "boards"],
              ["Seat", "seat"],
              ["Group", "group"],
            ]).map(([label, key]) => (
              <Field
                key={key}
                label={label}
                large
                previous={issued[key]}
                reduceMotion={reduceMotion}
                value={current[key]}
              />
            ))}
          </div>

          <div className="relative mt-2 h-4 text-xs">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="truncate text-night/55"
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 4 }}
                key={current.note ?? current.date}
                transition={fade}
              >
                {current.note ??
                  (current.footnote ?? `${current.date} · Doors close 15 min before departure`)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* The tear line, between the notches. */}
        <div className="relative mx-4" ref={tearRef}>
          <div className="border-night/10 border-t-2 border-dashed" />
        </div>

        <div className="flex items-center gap-4 p-5">
          <div className="min-w-0 flex-1">
            <Barcode seed={`${current.passenger}${current.number}`} />
          </div>
          <div className="shrink-0 text-right leading-tight">
            <p className="text-[11px] text-night/55">
              {passengerLabel}
            </p>
            <p className="font-medium text-sm text-pine-deep">
              {current.passenger}
            </p>
            <p className="mt-1 text-[11px] text-night/40 tabular-nums">
              {current.date}
            </p>
          </div>
        </div>
      </div>

      {/* Outlines for the notches, which the mask cut out of the border. */}
      {tearY > 0 &&
        [0, 1].map((side) => (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute text-night/10"
            height={NOTCH * 2 + 2}
            key={side}
            style={{
              top: tearY - NOTCH - 1,
              [side ? "right" : "left"]: -1,
            }}
            viewBox={`0 0 ${NOTCH + 1} ${NOTCH * 2 + 2}`}
            width={NOTCH + 1}
          >
            <path
              d={
                side
                  ? `M ${NOTCH + 1} 1 A ${NOTCH} ${NOTCH} 0 0 0 ${NOTCH + 1} ${NOTCH * 2 + 1}`
                  : `M 0 1 A ${NOTCH} ${NOTCH} 0 0 1 0 ${NOTCH * 2 + 1}`
              }
              fill="none"
              stroke="currentColor"
            />
          </svg>
        ))}
    </div>
  );
}
