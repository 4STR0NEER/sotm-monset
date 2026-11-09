import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Mail, PawPrint, Phone, Users, X } from "lucide-react";
import { PKG, StatusBadge, fmtDate, nightsOf, today } from "./ui";
import { peso } from "@/data/site";

// Actions the owner can take from each status. `act(booking, patch, message)` applies the change
// and shows an undo toast (see Owner.jsx).
function actionsFor(b) {
  const t = today();
  if (b.status === "requested")
    return [
      ["Confirm booking", { status: "confirmed" }, "Booking confirmed", "primary"],
      ["Decline", { status: "cancelled" }, "Request declined", "danger"],
    ];
  if (b.status === "confirmed")
    return [
      b.paid < b.deposit && b.total && ["Deposit received", { paid: b.deposit }, `Deposit of ${peso(b.deposit)} recorded`, "primary"],
      b.paid < b.total && ["Paid in full", { paid: b.total }, "Marked as paid in full", b.paid >= b.deposit ? "primary" : "quiet"],
      b.checkOut <= t && ["Mark completed", { status: "completed", paid: b.total }, "Stay completed", "quiet"],
      ["Cancel booking", { status: "cancelled" }, "Booking cancelled", "danger"],
    ].filter(Boolean);
  return [];
}

const BTN = {
  primary: "bg-pine text-mist hover:bg-pine-deep",
  quiet: "border border-night/15 text-night/80 hover:border-night/40",
  danger: "text-crimson hover:bg-crimson/10",
};

export default function BookingDrawer({ booking: b, onClose, act }) {
  useEffect(() => {
    if (!b) return;
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [b, onClose]);

  return (
    <AnimatePresence>
      {b && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-night/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            data-lenis-prevent
            aria-modal="true"
            aria-label={`Booking ${b.id}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-mist shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", bounce: 0, duration: 0.42 }}
          >
            <div className="relative h-32 shrink-0" style={{ background: PKG[b.package].color }}>
              <div className="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent" />
              <button onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-mist/90 text-night" aria-label="Close" autoFocus>
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-6 text-mist">
                <p className="stamp text-xs opacity-80">{PKG[b.package].label} · {b.id}</p>
                <p className="font-display text-3xl">{b.name}</p>
              </div>
            </div>

            <div className="flex-1 space-y-7 p-6">
              <div className="flex items-center justify-between">
                <StatusBadge status={b.status} />
                <span className="text-xs text-night/45">Requested {fmtDate(b.createdAt.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })} · {b.source === "web" ? "website" : "sample"}</span>
              </div>

              <ul className="space-y-3 text-night/80">
                <li className="flex gap-3"><CalendarDays size={18} className="mt-0.5 text-moss" />
                  {b.package === "dayuse" ? `${fmtDate(b.checkIn, { weekday: "long", month: "long", day: "numeric" })}, 1pm – 8pm` : `${fmtDate(b.checkIn, { weekday: "short", month: "short", day: "numeric" })} – ${fmtDate(b.checkOut, { weekday: "short", month: "short", day: "numeric" })} · ${nightsOf(b)} night${nightsOf(b) > 1 ? "s" : ""}`}
                </li>
                <li className="flex gap-3"><Users size={18} className="mt-0.5 text-moss" />{b.guests} guests{b.kids ? `, ${b.kids} children 1–7` : ""}{b.visitors ? ` · ${b.visitors} day visitors` : ""}{b.event ? " · event" : ""}</li>
                {b.pets > 0 && <li className="flex gap-3"><PawPrint size={18} className="mt-0.5 text-moss" />{b.pets} pet{b.pets > 1 ? "s" : ""}</li>}
                <li className="flex gap-3"><Phone size={18} className="mt-0.5 text-moss" /><a className="underline decoration-night/20 underline-offset-4" href={`tel:${b.phone}`}>{b.phone}</a></li>
                {b.email && <li className="flex gap-3"><Mail size={18} className="mt-0.5 text-moss" /><a className="underline decoration-night/20 underline-offset-4" href={`mailto:${b.email}`}>{b.email}</a></li>}
              </ul>

              {b.notes && <p className="rounded-2xl bg-white/70 p-4 text-sm text-night/70">“{b.notes}”</p>}

              <div className="rounded-3xl bg-white/70 p-5">
                <div className="flex justify-between text-sm text-night/60"><span>Total</span><span className="tnum">{b.total ? peso(b.total) : "Quote"}</span></div>
                <div className="mt-2 flex justify-between text-sm text-night/60"><span>Deposit (50%)</span><span className="tnum">{peso(b.deposit)}</span></div>
                <div className="mt-2 flex justify-between font-medium text-night"><span>Paid</span><span className="tnum">{peso(b.paid)}</span></div>
                {b.total > 0 && (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-night/[0.07]" role="progressbar" aria-valuenow={Math.round((b.paid / b.total) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Paid so far">
                    <motion.div className="h-full origin-left rounded-full bg-pine" initial={false} animate={{ scaleX: b.paid / b.total }} transition={{ type: "spring", bounce: 0, duration: 0.6 }} />
                  </div>
                )}
              </div>
            </div>

            {actionsFor(b).length > 0 && (
              <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-night/10 bg-mist/95 p-5 backdrop-blur">
                {actionsFor(b).map(([label, patch, msg, tone]) => (
                  <button
                    key={label}
                    onClick={() => act(b, patch, msg)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] ${BTN[tone]}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
