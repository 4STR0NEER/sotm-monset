import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { FIELD, PKG, PRIMARY, today } from "./ui";
import { createManualBooking, takenDates, updateBooking } from "@/lib/bookings";
import { KINDS, isStay, nightsBetween, quote, unitOf } from "@/lib/pricing";
import { peso } from "@/data/site";

const PHONE = /^(\+?63|0)9\d{9}$/;
const plusDays = (iso, n) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10);
const blank = (day = today()) => ({
  package: "lodge", checkIn: day, checkOut: plusDays(day, 1), guests: 10, kids: 0, pets: 0, visitors: 0,
  name: "", phone: "", email: "", notes: "", status: "confirmed", total: null, paid: 0,
});

// New booking (phone, walk-in or Facebook), or editing one (`booking`). `open` is true, or a date
// (YYYY-MM-DD) when opened by tapping a free day on the calendar. Price starts from the website
// rates and can be overridden; the database still refuses double bookings.
// Editing: admins change anything. Staff only headcount, visitors, pets, notes and payment
// (walk-ins on the day); migration 0008 holds them to that. Changing the headcount keeps the
// agreed price and adds (or takes off) the difference at website rates.
export default function NewBooking({ open, booking, admin, onClose, onCreated, onSaved, bookings }) {
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const edit = !!booking;
  const locked = edit && !admin; // staff editing: stay, dates and contact stay as they are
  useEffect(() => {
    if (!open) return;
    setF(booking ? { ...blank(), ...booking, total: null } : blank(typeof open === "string" ? open : undefined));
    setError(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open, onClose]);

  const fixed = KINDS[f.package].nights; // day use, birthday, wedding have set lengths
  const checkOut = fixed ? plusDays(f.checkIn, fixed) : f.checkOut;
  const q = quote({ ...f, checkOut });
  const auto = edit ? Math.max(0, (booking.total | 0) + q.total - quote(booking).total) : q.total;
  const total = f.total ?? auto;
  const set = (k, num) => (e) => setF((x) => ({ ...x, [k]: num ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }));

  const clash = useMemo(() => {
    const taken = takenDates(bookings.filter((b) => b.id !== booking?.id), unitOf(f.package));
    for (let d = f.checkIn; d < checkOut; d = plusDays(d, 1)) if (taken.has(d)) return d;
    return null;
  }, [bookings, booking, f.package, f.checkIn, checkOut]);

  const submit = async (e) => {
    e.preventDefault();
    const phone = f.phone.replace(/[\s-]/g, "");
    if (!PHONE.test(phone)) return setError("Enter a PH mobile number, e.g. 0917 123 4567.");
    if (checkOut <= f.checkIn) return setError("Check-out must be after check-in.");
    setBusy(true);
    setError(null);
    try {
      if (edit) {
        const paid = Math.min(f.paid | 0, total || Infinity);
        const people = { guests: f.guests | 0 || 1, kids: f.kids | 0, pets: f.pets | 0, visitors: f.visitors | 0, notes: f.notes.trim(), total, deposit: Math.round(total / 2), paid };
        await updateBooking(booking.id, locked ? people : { ...people, package: f.package, checkIn: f.checkIn, checkOut, name: f.name.trim(), phone, email: f.email.trim() });
        setBusy(false);
        return onSaved(booking, total - booking.total);
      }
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
            role="dialog" aria-modal="true" aria-label={edit ? "Edit booking" : "New booking"} data-lenis-prevent
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-mist shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", bounce: 0, duration: 0.42 }}
          >
            <form onSubmit={submit} className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-night/10 p-6">
                <div>
                  <p className="stamp text-xs text-moss">{edit ? `${booking.id}${locked ? " · walk-ins and payment" : ""}` : "Phone · walk-in · social"}</p>
                  <h2 className="font-display text-3xl text-pine-deep">{edit ? (locked ? "Add walk-ins" : "Edit booking") : "New booking"}</h2>
                </div>
                <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-night/5 text-night" aria-label="Close" autoFocus><X size={18} /></button>
              </div>

              <div className="flex-1 space-y-5 p-6">
                {locked && <p className="rounded-xl bg-lantern/15 px-3.5 py-2.5 text-sm text-night/70">Ask an admin to change the stay, dates or guest details.</p>}
                <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
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
                </fieldset>
                {clash && <p role="alert" className="rounded-xl bg-crimson/10 px-3.5 py-2.5 text-sm text-crimson">{PKG[f.package].label} is already booked on {clash}. Pick other dates.</p>}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <label className={label}>Guests<input required type="number" min={1} max={KINDS[f.package].maxGuests} value={f.guests} onChange={(e) => setF((x) => ({ ...x, guests: e.target.value === "" ? "" : Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                  <label className={label}>Kids 1–7<input type="number" min={0} max={50} value={f.kids} onChange={(e) => setF((x) => ({ ...x, kids: Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                  <label className={label}>Pets<input type="number" min={0} max={10} value={f.pets} onChange={(e) => setF((x) => ({ ...x, pets: Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>
                  {isStay(f.package) && <label className={label}>Day visitors<input type="number" min={0} max={200} value={f.visitors} onChange={(e) => setF((x) => ({ ...x, visitors: Number(e.target.value), total: null }))} className={`${FIELD} tnum mt-1`} /></label>}
                </div>

                <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
                <label className={label}>Guest name<input required minLength={2} maxLength={120} value={f.name} onChange={set("name")} className={`${FIELD} mt-1`} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={label}>Mobile<input required type="tel" inputMode="tel" placeholder="0917 123 4567" value={f.phone} onChange={set("phone")} className={`${FIELD} mt-1`} /></label>
                  <label className={label}>Email <span className="text-night/40">(optional)</span><input type="email" value={f.email} onChange={set("email")} className={`${FIELD} mt-1`} /></label>
                </div>
                </fieldset>
                <label className={label}>Notes<textarea rows={2} maxLength={2000} value={f.notes} onChange={set("notes")} className={`${FIELD} mt-1 resize-none`} /></label>

                <div className="space-y-4 rounded-3xl bg-white/70 p-5">
                  <label className={label}>Total
                    <input required type="number" min={0} inputMode="numeric" value={total} onChange={set("total", true)} className={`${FIELD} tnum mt-1`} />
                    <span className="mt-1 block text-xs text-night/45">
                      {f.total == null
                        ? edit ? (total === booking.total ? "The agreed price. Changing the headcount adds the difference at website rates." : `Agreed ${peso(booking.total)}, ${total > booking.total ? "plus" : "less"} ${peso(Math.abs(total - booking.total))} for the change in headcount.`)
                        : q.onRequest ? "Birthday packages are quoted. Enter the agreed amount." : "From the website rates. Change it if you agreed a different price."
                        : <button type="button" onClick={() => setF((x) => ({ ...x, total: null }))} className="underline">Reset to {edit ? "the agreed price" : "website rate"} ({peso(auto)})</button>}
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
                  {!edit && <fieldset>
                    <legend className="text-sm text-night/70">Status</legend>
                    <div className="mt-1.5 flex gap-1.5">
                      {[["confirmed", "Confirmed"], ["requested", "Pencil in (requested)"]].map(([id, l]) => (
                        <button type="button" key={id} aria-pressed={f.status === id} onClick={() => setF((x) => ({ ...x, status: id }))} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${f.status === id ? "bg-pine text-mist" : "bg-night/[0.06] text-night/60"}`}>{l}</button>
                      ))}
                    </div>
                  </fieldset>}
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-night/10 bg-mist/95 p-5 backdrop-blur">
                {error && <p role="alert" className="mb-3 text-sm text-crimson">{error}</p>}
                <button disabled={busy || !!clash} className={`${PRIMARY} w-full`}>{busy ? "Saving…" : edit ? `Save changes${total !== booking.total ? ` · ${peso(total)}` : ""}` : `Add booking${total ? ` · ${peso(total)}` : ""}`}</button>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
