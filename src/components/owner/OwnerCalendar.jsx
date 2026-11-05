import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PKG, fmtDate, today } from "./ui";
import { addMonths, daysInMonth, monthKey, occupancy } from "@/lib/stats";

// Month grid: each booked day carries a chip in its booking type's colour with the guest's name
// (so colour is never the only cue). Requested bookings are hatched and outlined, not solid.
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OwnerCalendar({ bookings, open }) {
  const [key, setKey] = useState(monthKey(today()));
  const [dir, setDir] = useState(1);
  const t = today();
  const go = (n) => (setDir(n), setKey((k) => addMonths(k, n)));

  const first = new Date(key + "-01T00:00:00Z");
  const lead = (first.getUTCDay() + 6) % 7;
  const days = Array.from({ length: daysInMonth(key) }, (_, i) => `${key}-${String(i + 1).padStart(2, "0")}`);
  const byDay = new Map();
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    for (let d = Date.parse(b.checkIn); d < Date.parse(b.checkOut); d += 864e5) {
      const iso = new Date(d).toISOString().slice(0, 10);
      if (iso.startsWith(key)) byDay.set(iso, b);
    }
  }
  const occ = Math.round(occupancy(bookings, key) * 100);

  return (
    <div className="rounded-[1.75rem] bg-white/75 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => go(-1)} className="grid size-9 place-items-center rounded-full border border-night/10 hover:border-night/30" aria-label="Previous month"><ChevronLeft size={18} /></button>
          <h2 className="w-44 text-center font-display text-2xl text-pine-deep">{fmtDate(key + "-01", { month: "long", year: "numeric" })}</h2>
          <button onClick={() => go(1)} className="grid size-9 place-items-center rounded-full border border-night/10 hover:border-night/30" aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-night/60">
          {Object.values(PKG).map((p) => (
            <span key={p.code} className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: p.color }} />{p.label}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full border border-night/40" style={{ backgroundImage: "repeating-linear-gradient(45deg,#0d171255 0 1px,transparent 1px 3px)" }} />Requested</span>
          <span className="tnum font-medium text-night/80">{occ}% occupied</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] uppercase tracking-wide text-night/40">
        {WEEK.map((w) => <span key={w} className="pb-1">{w}</span>)}
      </div>
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div
          key={key}
          custom={dir}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24, transition: { duration: 0.15 } }}
          transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
          className="grid grid-cols-7 gap-1.5"
        >
          {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
          {days.map((iso) => {
            const b = byDay.get(iso);
            const p = b && PKG[b.package];
            const pending = b?.status === "requested";
            const startsHere = b && (b.checkIn === iso || iso.endsWith("-01"));
            return (
              <button
                key={iso}
                disabled={!b}
                onClick={() => b && open(b.id)}
                aria-label={`${fmtDate(iso, { weekday: "long", month: "long", day: "numeric" })}${b ? `: ${p.label}, ${b.name}, ${b.status}` : ": free"}`}
                className={`relative flex min-h-20 flex-col rounded-xl border p-1.5 text-left transition-[transform,border-color] duration-150 ease-[var(--ease-out)] sm:min-h-24 sm:p-2 ${b ? "border-transparent hover:-translate-y-0.5" : "border-night/[0.06]"} ${iso < t ? "opacity-55" : ""}`}
                style={
                  b
                    ? pending
                      ? { borderColor: p.color, backgroundImage: `repeating-linear-gradient(45deg, ${p.color}26 0 2px, transparent 2px 7px)` }
                      : { background: `${p.color}1f`, borderColor: `${p.color}55` }
                    : undefined
                }
              >
                <span className={`tnum text-xs ${iso === t ? "grid size-6 place-items-center rounded-full bg-night font-semibold text-mist" : "text-night/60"}`}>{+iso.slice(8)}</span>
                {b && (
                  <span className="mt-auto">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-night/70"><span className="size-1.5 rounded-full" style={{ background: p.color }} />{p.code}</span>
                    {startsHere && <span className="hidden truncate text-[11px] font-medium text-night/80 sm:block">{b.name.split(" ")[0]}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
