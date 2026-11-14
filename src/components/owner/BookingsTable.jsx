import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate, stagger } from "animejs";
import { Search } from "lucide-react";
import { PKG, PayState, PkgTag, STATUS, StatusBadge, fmtDate, nightsOf, today } from "./ui";
import { peso } from "@/data/site";

const FILTERS = [["all", "All"], ["requested", "Requested"], ["upcoming", "Upcoming"], ["completed", "Past"], ["cancelled", "Cancelled"]];

export default function BookingsTable({ bookings, open, filter, setFilter }) {
  const [q, setQ] = useState("");
  const [stays, setStays] = useState([]); // stay chips switched on; none = every stay
  const toggle = (id) => setStays((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const byStay = (b) => !stays.length || stays.includes(b.package);
  const body = useRef(null);
  const t = today();

  const match = (b) =>
    filter === "all" ? true
    : filter === "upcoming" ? b.status === "confirmed" && b.checkOut > t
    : filter === "completed" ? b.status === "completed" || (b.status === "confirmed" && b.checkOut <= t)
    : b.status === filter;
  const needle = q.trim().toLowerCase();
  const rows = bookings
    .filter(match)
    .filter(byStay)
    .filter((b) => !needle || `${b.name} ${b.id} ${b.phone}`.toLowerCase().includes(needle))
    .sort((a, b) => (filter === "completed" || filter === "cancelled" ? b.checkIn.localeCompare(a.checkIn) : a.checkIn.localeCompare(b.checkIn)));
  const count = (f) => bookings.filter(byStay).filter((b) => (f === "all" ? true : f === "upcoming" ? b.status === "confirmed" && b.checkOut > t : f === "completed" ? b.status === "completed" || (b.status === "confirmed" && b.checkOut <= t) : b.status === f)).length;

  // rows ripple in whenever the filter changes (anime.js)
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !body.current) return;
    const a = animate(body.current.querySelectorAll("tr"), { opacity: [0, 1], x: [-8, 0], duration: 420, delay: stagger(25, { start: 40 }), ease: "out(4)" });
    return () => a.revert();
  }, [filter, stays]);

  return (
    <div className="rounded-[1.75rem] bg-white/75 p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter bookings">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === id ? "text-mist" : "text-night/60 hover:text-night"}`}
            >
              {filter === id && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-pine" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
              <span className="relative">{label} <span className="tnum opacity-60">{count(id)}</span></span>
            </button>
          ))}
        </div>
        <label className="relative block lg:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-night/40" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone or ref"
            aria-label="Search bookings"
            className="w-full rounded-full border border-night/10 bg-mist/60 py-2.5 pl-10 pr-4 text-sm outline-none transition-[border-color] focus:border-pine"
          />
        </label>
      </div>

      {/* stay chips: tap to show only those stays; colours match the calendar */}
      <div className="-mx-1 mb-4 flex flex-wrap gap-2 px-1" role="group" aria-label="Filter by stay">
        {Object.entries(PKG).map(([id, p]) => {
          const on = stays.includes(id);
          const n = bookings.filter((b) => b.package === id && match(b)).length;
          return (
            <button
              key={id}
              aria-pressed={on}
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
              style={on ? { background: p.color, borderColor: p.color, color: "#fff" } : { borderColor: `${p.color}55`, background: `${p.color}12`, color: "rgb(13 23 18 / 0.75)" }}
            >
              <span className="size-2 rounded-full" style={{ background: on ? "#fff" : p.color }} aria-hidden="true" />
              {p.label} <span className="tnum opacity-70">{n}</span>
            </button>
          );
        })}
        {stays.length > 0 && <button onClick={() => setStays([])} className="px-2 text-xs font-medium text-pine underline underline-offset-4">Show all stays</button>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night/45">
            <tr>
              <th className="py-3 pl-3 font-medium">Guest</th>
              <th className="font-medium">Stay</th>
              <th className="font-medium">Dates</th>
              <th className="font-medium">Guests</th>
              <th className="text-right font-medium">Total</th>
              <th className="pl-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody ref={body} key={filter + stays.join()}>
            {rows.map((b) => (
              <tr
                key={b.id}
                onClick={() => open(b.id)}
                onKeyDown={(e) => e.key === "Enter" && open(b.id)}
                tabIndex={0}
                className="cursor-pointer border-t border-night/[0.06] outline-none transition-colors hover:bg-night/[0.025] focus-visible:bg-lantern/10"
              >
                <td className="py-3.5 pl-3">
                  <p className="font-medium text-night/85">{b.name}</p>
                  <p className="text-xs text-night/45">{b.id}{b.source === "web" && <span className="ml-1.5 rounded bg-lantern/25 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-wood">web</span>}</p>
                </td>
                <td><PkgTag pkg={b.package} /></td>
                <td className="tnum text-night/70">
                  {fmtDate(b.checkIn)}
                  {b.package !== "dayuse" && <span className="text-night/40"> · {nightsOf(b)}n</span>}
                </td>
                <td className="tnum text-night/70">{b.guests + (b.kids | 0)}{b.pets ? <span className="text-night/40"> +{b.pets} pet</span> : ""}</td>
                <td className="tnum text-right text-night/80">{b.total ? peso(b.total) : <span className="text-night/40">quote</span>}</td>
                <td className="pl-6">
                  <div className="flex flex-col items-start gap-0.5">
                    <StatusBadge status={b.status} />
                    {b.status === "confirmed" && <PayState b={b} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-16 text-center text-sm text-night/50">No bookings match{needle ? ` “${q}”` : ""}{stays.length ? " for those stays" : ""}.</p>}
      </div>
    </div>
  );
}
