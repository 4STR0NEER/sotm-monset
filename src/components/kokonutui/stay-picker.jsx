"use client";;
// Adapted for SOTM: fixedNights (click one date, the stay length is set), cellPrice, unit,
// summary override, onChange, optional footer, "Booked" wording, resort palette.
/**
 * @author: @dorianbaffier
 * @description: Stay Picker
 * @version: 1.0.0
 * @date: 2026-10-22
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1];
const DAY_MS = 86_400_000;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
/** Height of one week row, in px. The pill is drawn in the same units. */
const ROW = 52;

/** Days since 1970, so ranges can cross months. */
const dayOf = (y, m, d) => Date.UTC(y, m, d) / DAY_MS;

const isoOf = (day) =>
  new Date(day * DAY_MS).toISOString().slice(0, 10);

const shortDate = (day) => {
  const date = new Date(day * DAY_MS);
  return `${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCDate()}`;
};

/** Seeded so the server and the browser price the same night the same way. */
function demoNight(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = dayOf(y, m - 1, d);
  let seed = (day * 7919) % 2_147_483_647;
  seed = (seed * 16_807) % 2_147_483_647;
  const weekday = (new Date(day * DAY_MS).getUTCDay() + 6) % 7;
  const weekend = weekday === 4 || weekday === 5;
  const price = 150 + (weekend ? 45 : 0) + (seed % 7) * 8;
  return { price, blocked: seed % 11 === 0 };
}

function useMonth(initial) {
  const [y, m] = initial.split("-").map(Number);
  return useState({ year: y, month: m - 1 });
}

const ARROW_STEP = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/**
 * Where a stay from `from` can end if you aim for `to`: it can't run
 * through a sold-out night, and it can't be shorter than the minimum.
 */
function settleStay(from, to, minNights, blocked) {
  let end = to;
  let note = null;
  for (let d = from; d < to; d++) {
    if (blocked(d)) {
      end = d;
      note = `Booked from ${shortDate(d)}`;
      break;
    }
  }
  if (end - from >= minNights) {
    return { end, note };
  }
  for (let d = from; d < from + minNights; d++) {
    if (blocked(d)) {
      return {
        end: null,
        note: `${minNights}-night minimum, and ${shortDate(d)} is booked`,
      };
    }
  }
  return {
    end: from + minNights,
    note:
      to - from < minNights
        ? `${minNights}-night minimum, so we added a night`
        : note,
  };
}

/**
 * One row of the pill as a clip over a full-width bar, so it grows and
 * shrinks on the GPU. Ends are round only where the stay starts or stops.
 */
function clipFor(s) {
  const left = (s.from / 7) * 100;
  const right = 100 - ((s.to + 1) / 7) * 100;
  const l = s.roundLeft ? "22px" : "0px";
  const r = s.roundRight ? "22px" : "0px";
  return `inset(0% ${right}% 0% ${left}% round ${l} ${r} ${r} ${l})`;
}

/** The stay, cut into one segment per week row it crosses. */
function segmentsFor(
  start,
  end,
  first,
  daysIn,
  lead
) {
  const segments = [];
  if (start === null || end === null) {
    return segments;
  }
  const a = Math.max(start, first);
  const b = Math.min(end, first + daysIn - 1);
  const ia = a - first + lead;
  const ib = b - first + lead;
  for (
    let row = Math.floor(ia / 7);
    a <= b && row <= Math.floor(ib / 7);
    row++
  ) {
    const from = Math.max(ia, row * 7);
    const to = Math.min(ib, row * 7 + 6);
    segments.push({
      row,
      from: from % 7,
      to: to % 7,
      roundLeft: from === ia && a === start,
      roundRight: to === ib && b === end,
    });
  }
  return segments;
}

function summaryFor(start, end) {
  if (start === null) {
    return "Pick a check-in night";
  }
  if (end === null) {
    return `Check-in ${shortDate(start)}. Now pick check-out`;
  }
  return `${shortDate(start)} – ${shortDate(end)} · ${end - start} nights`;
}

function dayTone(edge, blocked) {
  if (edge) {
    return "";
  }
  return blocked
    ? "text-night/40 line-through decoration-night/25"
    : "text-pine-deep";
}

function priceTone(edge, cheap) {
  if (edge) {
    return "text-white/70";
  }
  return cheap
    ? "text-pine"
    : "text-night/40";
}

function DayCell({
  day,
  cell,
  label,
  night,
  cheap,
  edge,
  hoverEnd,
  inStay,
  focusable,
  money,
  cellPrice,
  unit,
  onKeyDown
}) {
  return (
    <button
      aria-label={`${shortDate(day)}, ${night.blocked ? "booked" : `${money(night.price)} ${unit}`}`}
      aria-pressed={edge}
      className="group absolute flex flex-col items-center justify-center outline-none"
      data-day={day}
      onKeyDown={(event) => onKeyDown(event, day)}
      style={{
        left: `${((cell % 7) / 7) * 100}%`,
        top: Math.floor(cell / 7) * ROW,
        width: `${100 / 7}%`,
        height: ROW,
      }}
      tabIndex={focusable ? 0 : -1}
      type="button"
    >
      <span
        className={cn(
          "relative flex size-11 flex-col items-center justify-center rounded-full leading-none transition-colors duration-150",
          "group-focus-visible:ring-2 group-focus-visible:ring-night/40",
          edge && "bg-pine-deep text-white",
          hoverEnd && "ring-1 ring-pine-deep ring-inset",
          !(edge || inStay || night.blocked) &&
            "group-hover:bg-fog"
        )}
      >
        {night.blocked && !edge && (
          <span
            aria-hidden="true"
            className="absolute inset-1 rounded-full text-night/10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 5px)",
            }}
          />
        )}
        <span
          className={cn(
            "relative font-medium text-[13px] tabular-nums",
            dayTone(edge, night.blocked)
          )}
        >
          {label}
        </span>
        {!night.blocked && (
          <span
            className={cn(
              "relative mt-1 text-[10px] tabular-nums",
              priceTone(edge, night.price <= cheap)
            )}
          >
            {cellPrice(night.price)}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * A date range for booking stays. Every night shows its price, sold-out
 * nights are hatched, and the stay is drawn as one pill that wraps from
 * row to row as you drag across the weeks.
 */
export default function StayPicker({
  month: initialMonth = "2026-11",
  getNight = demoNight,
  minNights = 2,
  currency = "$",
  onReserve,
  className,
  fixedNights = null,
  cellPrice = (p) => p,
  unit = "a night",
  summary: summaryOverride,
  onChange,
  showFooter = true
}) {
  const [view, setView] = useMonth(initialMonth);
  const [direction, setDirection] = useState(1);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [hover, setHover] = useState(null);
  const [note, setNote] = useState(null);
  const [reserved, setReserved] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());

  const dragging = useRef(false);
  // The month grid is keyed, so a ref on it goes null once the old month
  // finishes leaving; the card itself stays put.
  const rootRef = useRef(null);
  const noteTimer = useRef(undefined);

  useEffect(() => () => clearTimeout(noteTimer.current), []);

  // Report the picked range up; a ref so a new callback each render doesn't re-fire it.
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  useEffect(() => {
    changeRef.current?.(start !== null && end !== null ? { checkIn: isoOf(start), checkOut: isoOf(end) } : null);
  }, [start, end]);

  const first = dayOf(view.year, view.month, 1);
  const daysIn = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();
  const lead = (new Date(first * DAY_MS).getUTCDay() + 6) % 7;
  const rows = Math.ceil((lead + daysIn) / 7);
  const nights = new Map();
  const nightOf = (day) => {
    let night = nights.get(day);
    if (!night) {
      night = getNight(isoOf(day));
      nights.set(day, night);
    }
    return night;
  };

  const days = Array.from({ length: daysIn }, (_, i) => first + i);
  const prices = days
    .filter((d) => !nightOf(d).blocked)
    .map((d) => nightOf(d).price);
  // The month's lowest price is marked, so the good nights stand out.
  const cheap = prices.length ? Math.min(...prices) : 0;

  const say = (text) => {
    setNote(text);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(null), 2600);
  };

  const settle = (from, to, speak) => {
    const result = settleStay(from, to, minNights, (d) => nightOf(d).blocked);
    if (speak && result.note) {
      say(result.note);
    }
    return result.end;
  };

  const picking = start !== null && end === null;
  const shownEnd =
    picking && hover !== null && hover > start
      ? settle(start, hover, false)
      : end;

  const begin = (day) => {
    if (nightOf(day).blocked) {
      say("Already booked that day");
      return;
    }
    setReserved(false);
    if (fixedNights) {
      const out = settle(day, day + fixedNights, true);
      if (out === null || out - day < fixedNights) {
        say(`Needs ${fixedNights} free ${fixedNights > 1 ? "nights" : "day"} in a row`);
        return;
      }
      setStart(day);
      setEnd(out);
      return;
    }
    setStart(day);
    setEnd(null);
  };

  const choose = (day) => {
    if (fixedNights || start === null || end !== null || day <= start) {
      begin(day);
      return;
    }
    const out = settle(start, day, true);
    if (out === null) {
      return;
    }
    setEnd(out);
    setHover(null);
  };

  const dayAt = (event) => {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const cell = el?.closest("[data-day]");
    return cell ? Number(cell.dataset.day) : null;
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    const day = dayAt(event);
    if (day === null) {
      return;
    }
    dragging.current = true;
    // A press on a fresh day starts a stay; a press while picking ends one.
    if (fixedNights || start === null || end !== null || day <= start) {
      begin(day);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const day = dayAt(event);
    if (day === null) {
      return;
    }
    if (start !== null && end === null) {
      setHover(day);
    }
  };

  const onPointerUp = (event) => {
    if (!dragging.current) {
      return;
    }
    dragging.current = false;
    const day = dayAt(event);
    if (day !== null && start !== null && day > start && end === null) {
      choose(day);
    }
  };

  const onKeyDown = (event, day) => {
    if (event.key in ARROW_STEP) {
      event.preventDefault();
      const next = day + ARROW_STEP[event.key];
      const focusDay = () =>
        rootRef.current
          ?.querySelector(`[data-day="${next}"]`)
          ?.focus();
      if (next < first || next >= first + daysIn) {
        // Off the edge of the month: turn the page, then land on the day.
        go(next < first ? -1 : 1);
        requestAnimationFrame(focusDay);
      } else {
        focusDay();
      }
      if (start !== null && end === null) {
        setHover(next);
      }
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(day);
    }
  };

  const go = (delta) => {
    setDirection(delta);
    setView(({ year, month }) => {
      const m = month + delta;
      return { year: year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const segments = segmentsFor(start, shownEnd ?? null, first, daysIn, lead);

  const stayNights =
    start !== null && end !== null
      ? Array.from({ length: end - start }, (_, i) => nightOf(start + i).price)
      : [];
  const total = stayNights.reduce((sum, p) => sum + p, 0);
  const money = (n) => `${currency}${n.toLocaleString("en-US")}`;

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring", duration: 0.35, bounce: 0 };
  const fade = { duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT };

  const summary = summaryOverride
    ? summaryOverride(start === null ? null : isoOf(start), end === null ? null : isoOf(end))
    : summaryFor(start, end);
  // The one day Tab lands on: check-in when it's in this month, else the 1st.
  const tabDay =
    start !== null && start >= first && start < first + daysIn ? start : first;

  return (
    <div
      className={cn(
        "w-full max-w-sm select-none rounded-3xl border border-night/10 bg-white p-4",
        className
      )}
      ref={rootRef}
    >
      <div className="flex items-center justify-between px-1">
        <div className="relative h-5 flex-1 overflow-hidden">
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.p
              animate={{ opacity: 1, x: 0 }}
              className="font-medium text-sm text-pine-deep"
              exit={{ opacity: 0, x: -12 * direction }}
              initial={{ opacity: 0, x: 12 * direction }}
              key={`${view.year}-${view.month}`}
              transition={fade}
            >
              {MONTHS[view.month]} {view.year}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          {[-1, 1].map((delta) => (
            <button
              aria-label={delta < 0 ? "Previous month" : "Next month"}
              className="flex size-8 items-center justify-center rounded-full text-night/55 outline-none transition-colors duration-150 hover:bg-fog hover:text-pine-deep focus-visible:ring-2 focus-visible:ring-night/40"
              key={delta}
              onClick={() => go(delta)}
              type="button"
            >
              {delta < 0 ? (
                <ChevronLeft aria-hidden className="size-4" />
              ) : (
                <ChevronRight aria-hidden className="size-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-night/40">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="mt-1"
          exit={{ opacity: 0, x: -16 * direction }}
          initial={{ opacity: 0, x: 16 * direction }}
          key={`${view.year}-${view.month}`}
          transition={fade}
        >
          <div
            className="relative touch-none"
            onPointerCancel={() => {
              dragging.current = false;
            }}
            onPointerDown={onPointerDown}
            onPointerLeave={() => setHover(null)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ height: rows * ROW }}
          >
            {/* The stay: one pill per row, ends rounded only where the stay
              really starts and stops, so it reads as a single shape. */}
            {segments.map((s) => (
              <motion.div
                animate={{ clipPath: clipFor(s), opacity: 1 }}
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-x-0 h-11 bg-fog",
                  picking && "bg-fog/70"
                )}
                initial={{
                  clipPath: clipFor({
                    ...s,
                    to: s.from,
                    roundLeft: true,
                    roundRight: true,
                  }),
                  opacity: 0,
                }}
                key={s.row}
                style={{ top: s.row * ROW + (ROW - 44) / 2 }}
                transition={{ ...spring, opacity: fade }}
              />
            ))}

            {days.map((day, i) => (
              <DayCell
                cell={i + lead}
                cheap={cheap}
                day={day}
                edge={
                  day === start || day === end || (day === shownEnd && !picking)
                }
                focusable={day === tabDay}
                hoverEnd={picking && day === shownEnd}
                inStay={
                  start !== null &&
                  shownEnd != null &&
                  day > start &&
                  day < shownEnd
                }
                key={day}
                label={i + 1}
                money={money}
                cellPrice={cellPrice}
                unit={unit}
                night={nightOf(day)}
                onKeyDown={onKeyDown}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div aria-live="polite" className="relative mt-2 h-4 px-1 text-xs">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              note
                ? "text-ember"
                : "text-night/55"
            )}
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: 4 }}
            key={note ?? summary}
            transition={fade}
          >
            {note ?? summary}
          </motion.p>
        </AnimatePresence>
      </div>

      {showFooter && <div className="mt-3 flex items-center justify-between gap-3 border-fog border-t px-1 pt-3">
        <div className="min-w-0 leading-tight">
          <p className="text-xs text-night/55">Total</p>
          <div className="relative h-6 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="font-semibold text-lg text-pine-deep tabular-nums tracking-tight"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                key={total}
                transition={fade}
              >
                {total ? money(total) : "—"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <button
          aria-disabled={!total}
          className={cn(
            "h-10 shrink-0 rounded-full px-5 font-medium text-sm outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-night/40 focus-visible:ring-offset-2",
            reserved &&
              "bg-pine text-white",
            !reserved &&
              (total
                ? "bg-pine-deep text-white hover:bg-pine"
                : "bg-fog text-night/40")
          )}
          onClick={() => {
            if (start === null || end === null) {
              return;
            }
            onReserve?.({ checkIn: isoOf(start), checkOut: isoOf(end), total });
            setReserved(true);
          }}
          type="button"
        >
          {reserved ? "Reserved" : "Reserve"}
        </button>
      </div>}
    </div>
  );
}
