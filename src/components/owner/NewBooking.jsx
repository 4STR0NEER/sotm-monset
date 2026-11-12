import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { FIELD, PKG, PRIMARY, today } from "./ui";
import { createManualBooking, takenDates } from "@/lib/bookings";
import { KINDS, isStay, nightsBetween, quote, unitOf } from "@/lib/pricing";
import { peso } from "@/data/site";

const PHONE = /^(\+?63|0)9\d{9}$/;
const plusDays = (iso, n) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10);
const blank = () => ({
  package: "lodge", checkIn: today(), checkOut: plusDays(today(), 1), guests: 10, kids: 0, pets: 0,
  name: "", phone: "", email: "", notes: "", status: "confirmed", total: null, paid: 0,
});

// Phone, walk-in or Facebook bookings, entered by admin or staff. Price starts from the same
// pricing as the website and can be overridden; the database still refuses double bookings.
export default function NewBooking({ open, onClose, onCreated, bookings }) {
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { if (open) (setF(blank()), setError(null)); }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open, onClose]);

  const fixed = KINDS[f.package].nights; // day use, birthday, wedding have set lengths
  const checkOut = fixed ? plusDays(f.checkIn, fixed) : f.checkOut;
  const q = quote({ ...f, checkOut });
  const total = f.total ?? q.total;
  const set = (k, num) => (e) => setF((x) => ({ ...x, [k]: num ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }));

  const clash = useMemo(() => {
    const taken = takenDates(bookings, unitOf(f.package));
    for (let d = f.checkIn; d < checkOut; d = plusDays(d, 1)) if (taken.has(d)) return d;
    return null;
  }, [bookings, f.package, f.checkIn, checkOut]);

  const submit = async (e) => {
    e.preventDefault();
    const phone = f.phone.replace(/[\s-]/g, "");
    if (!PHONE.test(phone)) return setError("Enter a PH mobile number, e.g. 0917 123 4567.");
    if (checkOut <= f.checkIn) return setError("Check-out must be after check-in.");
    setBusy(true);
    setError(null);
    try {
      const id = await createManualBooking({ ...f, phone, checkOut, total, paid: Math.min(f.paid | 0, total || Infinity) });
      onCreated(id, f.name.trim());
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const label = "block text-sm text-night/70";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-night/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
          <motion.aside
            role="dialog" aria-modal="true" aria-label="New booking" data-lenis-prevent
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-mist shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", bounce: 0, duration: 0.42 }}
          >
            <form onSubmit={submit} className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-night/10 p-6">
                <div>
                  <p className="stamp text-xs text-moss">Phone · walk-in · social</p>
                  <h2 className="font-display text-3xl text-pine-deep">New booking</h2>
                </div>
                <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-night/5 text-night" aria-label="Close" autoFocus><X size={18} /></button>
              </div>

              <div className="flex-1 space-y-5 p-6">
                <label className={label}>Booking
                  <select value={f.package} onChange={(e) => setF((x) => ({ ...x, package: e.target.value, total: null }))} className={`${FIELD} mt-1`}>
                    {Object.entries(PKG).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className={label}>{isStay(f.package) ? "Check-in" : "Date"}
                    <input required type="date" value={f.checkIn} onChange={(e) => setF((x) => ({ ...x, checkIn: e.target.value, checkOut: x.checkOut > e.target.value ? x.checkOut : plusDays(e.target.value, 1), total: null }))} className={`${FIELD} mt-1`} />
                  </label>
                  {fixed ? (
                    <p className="self-end pb-2.5 text-sm text-night/55">{fixed === 1 ? "Single day" : `${fixed} nights, to ${checkOut.slice(5)}`}</p>
                  ) : (
                    <label className={label}>Check-out
                      <input required type="date" min={plusDays(f.checkIn, 1)} value={f.checkOut} onChange={(e) => setF((x) => ({ ...x, checkOut: e.target.value, total: null }))} className={`${FIELD} mt-1`} />
                    </label>
                  )}
                </div>
                {clash && <p role="alert" className="rounded-xl bg-crimson/10 px-3.5 py-2.5 text-sm text-crimson">{PKG[f.package].label} is already booked on {clash}. Pick other dates.</p>}

                <div className="grid grid-cols-3 gap-3">
                  <label className={label}>Guests<input required type="number" min={1} max={KINDS[f.package].maxGuests} value={f.guests} onChange={(e) => setF((x) => ({ ...x, guests: e.target.value === "" ? "" : Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                  <label className={label}>Kids 1–7<input type="number" min={0} max={50} value={f.kids} onChange={(e) => setF((x) => ({ ...x, kids: Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                  <label className={label}>Pets<input type="number" min={0} max={10} value={f.pets} onChange={(e) => setF((x) => ({ ...x, pets: Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                </div>

                <label className={label}>Guest name<input required minLength={2} maxLength={120} value={f.name} onChange={set("name")} className={`${FIELD} mt-1`} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={label}>Mobile<input required type="tel" inputMode="tel" placeholder="0917 123 4567" value={f.phone} onChange={set("phone")} className={`${FIELD} mt-1`} /></label>
                  <label className={label}>Email <span className="text-night/40">(optional)</span><input type="email" value={f.email} onChange={set("email")} className={`${FIELD} mt-1`} /></label>
                </div>
                <label className={label}>Notes<textarea rows={2} maxLength={2000} value={f.notes} onChange={set("notes")} className={`${FIELD} mt-1 resize-none`} /></label>

                <div className="space-y-4 rounded-3xl bg-white/70 p-5">
                  <label className={label}>Total
                    <input required type="number" min={0} inputMode="numeric" value={total} onChange={set("total", true)} className={`${FIELD} tnum mt-1`} />
                    <span className="mt-1 block text-xs text-night/45">
                      {f.total == null ? (q.onRequest ? "Birthday packages are quoted. Enter the agreed amount." : "From the website rates. Change it if you agreed a different price.") : <button type="button" onClick={() => setF((x) => ({ ...x, total: null }))} className="underline">Reset to website rate ({peso(q.total)})</button>}
                    </span>
                  </label>
                  <div>
                    <label className={label}>Paid so far<input type="number" min={0} inputMode="numeric" value={f.paid} onChange={set("paid", true)} className={`${FIELD} tnum mt-1`} /></label>
                    <div className="mt-2 flex gap-1.5">
                      {[["None", 0], ["Deposit", Math.round(total / 2)], ["Full", total]].map(([l, v]) => (
                        <button type="button" key={l} onClick={() => setF((x) => ({ ...x, paid: v }))} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${f.paid === v ? "bg-pine text-mist" : "bg-night/[0.06] text-night/60"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <fieldset>
                    <legend className="text-sm text-night/70">Status</legend>
                    <div className="mt-1.5 flex gap-1.5">
                      {[["confirmed", "Confirmed"], ["requested", "Pencil in (requested)"]].map(([id, l]) => (
                        <button type="button" key={id} aria-pressed={f.status === id} onClick={() => setF((x) => ({ ...x, status: id }))} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${f.status === id ? "bg-pine text-mist" : "bg-night/[0.06] text-night/60"}`}>{l}</button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-night/10 bg-mist/95 p-5 backdrop-blur">
                {error && <p role="alert" className="mb-3 text-sm text-crimson">{error}</p>}
                <button disabled={busy || !!clash} className={`${PRIMARY} w-full`}>{busy ? "Saving…" : `Add booking${total ? ` · ${peso(total)}` : ""}`}</button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
