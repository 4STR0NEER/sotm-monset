import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Minus, Moon, PartyPopper, Plus, ShowerHead, Sparkles, UtensilsCrossed, Waves, WifiOff } from "lucide-react";
import StayPicker from "@/components/kokonutui/stay-picker";
import BookingSummary from "@/components/booking/BookingSummary";
import Confirmation from "@/components/booking/Confirmation";
import { useSearch } from "@/lib/router";
import { initScrollFx } from "@/lib/scroll-fx";
import { createBooking, takenDates, useBookings } from "@/lib/bookings";
import { KINDS, quote, isStay, unitOf, isWeekendDay, DAY_WEEKDAY, DAY_WEEKEND, VISITOR, EVENT_FEE } from "@/lib/pricing";
import { ADDONS, BOOKABLE, KITCHEN, RESORT, STAYS, nightlyRate, peso } from "@/data/site";

const CHOICES = Object.entries(BOOKABLE).map(([id, c]) => ({ id, ...c }));

// What a guest must know before paying, in one glance. The full rules live on /terms.
const GOOD_TO_KNOW = [
  [Clock, `Check-in ${RESORT.checkIn}, check-out ${RESORT.checkOut}.`],
  [UtensilsCrossed, "Self-catering. Bring your own food, no corkage fee."],
  [ShowerHead, "Bring towels, toothbrushes and a sweater. Toiletries and hair dryers are provided."],
  [Waves, "Swimwear only in the pool and hot tub. No cotton, denim or wool."],
  [WifiOff, "No phone signal up here. Vendo WiFi is ₱10 per gadget for 7 hours."],
  [Moon, "Quiet hours 10pm – 7am. No smoking indoors or on the deck."],
];
const EASE = [0.23, 1, 0.32, 1];

const k = (n) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(n));
const fmt = (iso, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-PH", { ...opts, timeZone: "UTC" });
const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => today().slice(0, 7);

// Phone: Philippine mobile, with or without +63 / spaces / dashes.
const PHONE = /^(\+?63|0)9\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Step({ n, title, hint, children }) {
  return (
    <section className="border-t border-night/10 py-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="stamp text-xs text-lantern">0{n}</span>
        <div>
          <h2 className="font-display text-3xl font-light text-pine-deep">{title}</h2>
          {hint && <p className="mt-1 text-sm text-night/55">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// A counter whose number rolls up or down depending on the direction of the change.
function Stepper({ label, sub, value, min = 0, max, onChange }) {
  const [dir, setDir] = useState(1);
  const set = (v) => {
    const next = Math.min(max, Math.max(min, v));
    if (next === value) return;
    setDir(next > value ? 1 : -1);
    onChange(next);
  };
  const btn = "grid size-10 place-items-center rounded-full border border-night/15 text-night/70 transition-[transform,border-color] duration-150 ease-[var(--ease-out)] hover:border-night/40 active:scale-[0.94] disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-night/85">{label}</p>
        {sub && <p className="text-sm text-night/50">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus size={16} />
        </button>
        <div className="relative h-7 w-9 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.span
              key={value}
              custom={dir}
              initial={{ y: dir * 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: dir * -18, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="tnum absolute inset-0 text-xl font-medium"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, ...props }) {
  const Tag = props.rows ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-sm font-medium text-night/70">{label}</span>
      <Tag
        {...props}
        aria-invalid={!!error}
        className="mt-1.5 block w-full rounded-2xl border border-night/15 bg-white/70 px-4 py-3 text-night outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-night/30 focus:border-pine focus:shadow-[0_0_0_4px_rgb(33_80_58/0.12)] aria-[invalid=true]:border-crimson"
      />
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 block text-sm text-crimson"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

export default function Book() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const asked = params.get("package");

  const [pkgId, setPkgId] = useState(KINDS[asked] ? asked : "lodge");
  const [event, setEvent] = useState(asked === "event");
  const [visitors, setVisitors] = useState(0);
  const [addons, setAddons] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [dates, setDates] = useState(null);
  const [guests, setGuests] = useState(10);
  const [kids, setKids] = useState(0);
  const [pets, setPets] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [touched, setTouched] = useState({});
  const [done, setDone] = useState(null);
  const bookings = useBookings();

  useEffect(initScrollFx, [done]);

  const kind = KINDS[pkgId];
  const taken = useMemo(() => takenDates(bookings, unitOf(pkgId)), [bookings, pkgId]);
  const stay = isStay(pkgId);
  const t = today();

  const booking = {
    package: pkgId,
    checkIn: dates?.checkIn ?? null,
    checkOut: dates?.checkOut ?? null,
    guests, kids, pets,
    event: pkgId === "lodge" && event,
    visitors: stay ? visitors : 0,
    addons: stay ? addons : {},
  };
  const q = quote(booking);

  const errors = {
    name: form.name.trim().length < 2 ? "Please enter your name." : null,
    phone: !PHONE.test(form.phone.replace(/[\s-]/g, "")) ? "Enter a PH mobile number, e.g. 0917 123 4567." : null,
    email: !form.email.trim() ? "We email your confirmation and receipts, so we need this." : !EMAIL.test(form.email.trim()) ? "That email doesn't look right, e.g. name@gmail.com." : null,
  };
  const missing = [
    !dates && "pick your dates",
    errors.name && "your name",
    errors.phone && "a mobile number",
    errors.email && "your email",
    !agreed && "agree to the terms",
  ].filter(Boolean);
  const setAddon = (id, qty) => setAddons((a) => ({ ...a, [id]: qty }));

  const choosePackage = (id) => {
    if (id === pkgId) return;
    setPkgId(id);
    setDates(null);
    setGuests((g) => Math.min(g, KINDS[id].maxGuests));
  };

  const getNight = (iso) => {
    const blocked = iso <= t || taken.has(iso);
    const price =
      stay ? nightlyRate(pkgId, guests)
      : pkgId === "dayuse" ? (isWeekendDay(iso) ? DAY_WEEKEND.base : DAY_WEEKDAY.base)
      : pkgId === "wedding" ? 90000 : 0;
    return { price, blocked };
  };

  const summaryText = (a, b) => {
    if (!a) return { lodge: "Pick a check-in night", chalet: "Pick a check-in night", dayuse: "Pick your day", birthday: "Pick the party date", wedding: "Pick your wedding day" }[pkgId];
    if (!b) return `Check-in ${fmt(a)}. Now pick check-out`;
    if (pkgId === "dayuse") return `${fmt(a)} · 1pm – 8pm · ${isWeekendDay(a) ? "weekend" : "weekday"} rate`;
    const n = Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
    return `${fmt(a)} – ${fmt(b)} · ${n} night${n > 1 ? "s" : ""}`;
  };

  const confirm = async () => {
    setTouched({ name: true, phone: true, email: true });
    if (missing.length) throw new Error("incomplete");
    const b = createBooking({ ...booking, ...form, email: form.email.trim(), phone: form.phone.replace(/[\s-]/g, "") });
    setTimeout(() => {
      setDone(b);
      scrollTo({ top: 0 });
    }, 900);
  };

  if (done) return <Confirmation booking={done} onAgain={() => (setDone(null), setDates(null))} />;

  const pkg = BOOKABLE[pkgId];
  const guestLabel = stay
    ? `${STAYS[pkgId].name} sleeps ${STAYS[pkgId].guests.join("–")}. ${peso(nightlyRate(pkgId, guests))} a night for ${Math.max(guests, 10)}.`
    : pkgId === "dayuse" ? "Price includes 4 (weekday) or 12 (weekend)" : `Up to ${kind.maxGuests}`;

  return (
    <>
      <header className="grain relative flex h-[52vh] min-h-[380px] items-end overflow-hidden bg-night text-mist">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={pkg.src}
            src={pkg.src}
            alt=""
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
          <p className="stamp mb-4 text-xs text-lantern">Reservations only · {RESORT.address}</p>
          <h1 data-split className="max-w-[14ch] font-display text-[clamp(2.6rem,6vw,5.5rem)] font-light leading-[0.98]">
            Book the mountain.
          </h1>
        </div>
      </header>

      <div className="bg-mist px-4 pb-28 pt-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div data-stagger>
            <Step n={1} title="Choose your stay">
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Package">
                {CHOICES.map((p) => {
                  const on = p.id === pkgId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => choosePackage(p.id)}
                      className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl border p-3 text-left transition-[border-color,background-color,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.98] ${
                        on ? "border-pine bg-white" : "border-night/10 bg-white/40 hover:border-night/30"
                      }`}
                    >
                      <img src={p.src} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
                      <div className="min-w-0">
                        <p className="font-medium text-night/90">{p.short}</p>
                        <p className="mt-0.5 text-sm text-night/50">{p.from}</p>
                      </div>
                      <span className={`absolute right-3 top-3 grid size-6 place-items-center rounded-full transition-[background-color,transform] duration-200 ${on ? "scale-100 bg-pine text-mist" : "scale-75 bg-night/10 text-transparent"}`}>
                        <Check size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence initial={false}>
                {pkgId === "lodge" && (
                  <motion.label
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="block overflow-hidden"
                  >
                    <span className="mt-4 flex cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-night/20 p-4">
                      <input type="checkbox" checked={event} onChange={(e) => setEvent(e.target.checked)} className="size-5 accent-[var(--color-pine)]" />
                      <PartyPopper size={20} className="text-ember" aria-hidden="true" />
                      <span className="text-sm text-night/75">
                        <b className="font-medium text-night/90">Add an event</b> with florists or balloon stylists: {peso(EVENT_FEE)} venue use, incl. power for lights and sound.
                      </span>
                    </span>
                  </motion.label>
                )}
              </AnimatePresence>
            </Step>

            <Step n={2} title="Pick your dates" hint={stay ? `Hatched nights are taken. The ${STAYS[pkgId].name} goes to one group at a time.` : "Hatched days are already taken."}>
              <StayPicker
                key={pkgId}
                month={thisMonth()}
                currency="₱"
                minNights={kind.minNights ?? 1}
                fixedNights={kind.nights}
                getNight={getNight}
                cellPrice={(p) => (p ? k(p) : "")}
                unit={stay ? "a night" : "for the day"}
                summary={summaryText}
                onChange={setDates}
                showFooter={false}
                className="max-w-md rounded-[2rem] border-night/10 bg-white/80 p-5"
              />
            </Step>

            <Step n={3} title="Who's coming" hint={guestLabel}>
              <div className="divide-y divide-night/10">
                <Stepper label="Guests" sub="Adults and children 8+" value={guests} min={1} max={kind.maxGuests} onChange={setGuests} />
                <Stepper
                  label="Children 1–7"
                  sub={pkgId === "dayuse" ? `${peso(250)} each` : "Free when sharing a bed with parents"}
                  value={kids}
                  max={20}
                  onChange={setKids}
                />
                <Stepper label="Pets" sub={`We're pet-friendly · ${peso(pkgId === "dayuse" ? 500 : 700)} each`} value={pets} max={5} onChange={setPets} />
                {stay && (
                  <Stepper label="Day visitors" sub={`Not staying the night · ${peso(VISITOR)} each, until 8pm`} value={visitors} max={100} onChange={setVisitors} />
                )}
              </div>
            </Step>

            {stay && (
              <Step n={4} title="Add extras" hint="Optional, and easier to arrange now than on the day.">
                <div className="divide-y divide-night/10">
                  {ADDONS.map((a) =>
                    a.per === "each" ? (
                      <Stepper key={a.id} label={a.name} sub={`${peso(a.price)} per ${a.unit} · ${a.note}`} value={addons[a.id] | 0} max={40} onChange={(v) => setAddon(a.id, v)} />
                    ) : (
                      <label key={a.id} className="flex cursor-pointer items-center justify-between gap-4 py-4">
                        <span>
                          <span className="block font-medium text-night/85">{a.name}</span>
                          <span className="block text-sm text-night/50">{peso(a.price)} per group · {a.note}</span>
                        </span>
                        <input type="checkbox" checked={!!addons[a.id]} onChange={(e) => setAddon(a.id, e.target.checked ? 1 : 0)} className="size-5 shrink-0 accent-[var(--color-pine)]" />
                      </label>
                    )
                  )}
                </div>
                <p className="mt-4 text-sm text-night/50">Feeding a crowd? Ask about party trays (₱2,000 – 2,300, serves 15–17) in your notes below.</p>
              </Step>
            )}

            <section className="border-t border-night/10 py-10" aria-labelledby="know-title">
              <h2 id="know-title" className="font-display text-3xl font-light text-pine-deep">Good to know</h2>
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {GOOD_TO_KNOW.map(([Icon, text]) => (
                  <li key={text} className="flex gap-3 text-[15px] leading-snug text-night/70">
                    <Icon size={18} className="mt-0.5 shrink-0 text-moss" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              {stay && (
                <details className="faq mt-6 rounded-3xl border border-night/10 bg-white/50 px-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-medium text-night/80">
                    What's in the kitchen, and what to bring
                    <Plus size={18} className="plus shrink-0 text-moss" aria-hidden="true" />
                  </summary>
                  <div className="grid gap-6 pb-5 text-sm text-night/65 sm:grid-cols-2">
                    {[["We provide", KITCHEN.provided], ["You bring", KITCHEN.bring]].map(([t, items]) => (
                      <div key={t}>
                        <p className="mb-2 font-medium text-night/80">{t}</p>
                        <ul className="space-y-1.5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </section>

            <Step n={stay ? 5 : 4} title="Your details" hint="Your confirmation and official receipts are sent to your email.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => setTouched({ ...touched, name: true })} error={touched.name && errors.name} />
                <Field label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onBlur={() => setTouched({ ...touched, phone: true })} error={touched.phone && errors.phone} />
                <div className="sm:col-span-2">
                  <Field label="Email" type="email" inputMode="email" autoComplete="email" placeholder="name@gmail.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => setTouched({ ...touched, email: true })} error={touched.email && errors.email} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Anything we should know?" rows={3} placeholder="Celebration, tray orders, all-day breakfast (₱240), arrival time…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-night/70">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--color-pine)]" />
                <span>
                  I've read and agree to the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="font-medium text-pine underline decoration-pine/30 underline-offset-4 hover:decoration-pine">Terms & Conditions</a>
                  , including the 50% deposit and the rebooking-only cancellation policy.
                </span>
              </label>
            </Step>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingSummary pkg={pkg} booking={booking} quote={q} missing={missing} onConfirm={confirm} datesText={dates ? summaryText(dates.checkIn, dates.checkOut) : null} />
            <p className="mt-4 flex items-start gap-2 px-2 text-xs leading-relaxed text-night/45">
              <Sparkles size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Demo booking: saved in this browser only, and visible in the owner dashboard. Nothing is charged online yet.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
