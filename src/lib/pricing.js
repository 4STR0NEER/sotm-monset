// Prices a booking. Overnight rates, extras and the deposit come from the owner (Nov 2026);
// day use, events and the wedding from sotmretreatresort.com (/packages and /faqs).
import { PACKAGES, STAYS, ADDONS, nightlyRate } from "../data/site.js";

const pkg = (id) => PACKAGES.find((p) => p.id === id);

export const EVENT_FEE = pkg("event").price; // ₱7,000 venue use
export const VISITOR = 500; // per day visitor / non-staying guest, until 8pm
export const PET_OVERNIGHT = 700;
export const PET_DAY = 500;
export const DAY_WEEKDAY = { base: pkg("dayuse").price, included: 4 }; // Mon–Thu
export const DAY_WEEKEND = { base: pkg("dayuse").weekend.price, included: 12 }; // Fri–Sun (site omits Sat; we treat it as weekend)
export const DAY_EXTRA = 500;
export const DAY_CHILD = 250; // under 7
export const DAY_MAX = 40;
export const WEDDING = pkg("wedding").price; // all-inclusive, 2 nights, up to 50
export const WEDDING_MAX = 50;
export const DEPOSIT_RATE = 0.5;

// What each bookable choice puts on the calendar: fixed nights (null = guest picks a range)
export const KINDS = {
  lodge: { nights: null, minNights: 1, maxGuests: STAYS.lodge.guests[1] },
  chalet: { nights: null, minNights: 1, maxGuests: STAYS.chalet.guests[1] },
  dayuse: { nights: 1, maxGuests: DAY_MAX },
  birthday: { nights: 1, maxGuests: 30 },
  wedding: { nights: 2, maxGuests: WEDDING_MAX },
};
export const isStay = (id) => id === "lodge" || id === "chalet";
// Which accommodation a booking occupies. Day use and functions run at the Cabin Lodge (pool, deck).
// ponytail: assumption until the owner confirms where day use / events happen.
export const unitOf = (id) => (id === "chalet" ? "chalet" : "lodge");

const dow = (iso) => new Date(iso + "T00:00:00Z").getUTCDay(); // 0 Sun … 6 Sat
export const isWeekendDay = (iso) => ![1, 2, 3, 4].includes(dow(iso));
export const nightsBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const s = (n, word, plural = word + "s") => `${n} ${n === 1 ? word : plural}`;

/**
 * b = { package, checkIn, checkOut, guests, kids, pets, event, visitors, addons }
 *   guests: people counted (8 and up); kids: children 1–7; addons: { id: qty }
 * Returns { lines: [[label, amount]], total, deposit, onRequest }
 */
export function quote(b) {
  // Nothing to price until the dates are in (the birthday package is quoted by phone either way)
  if (!b.checkIn && b.package !== "birthday") return { lines: [], total: 0, deposit: 0, onRequest: false };
  const lines = [];
  const add = (label, amount) => amount && lines.push([label, amount]);
  const guests = Math.max(0, b.guests | 0);
  const kids = Math.max(0, b.kids | 0);
  const pets = Math.max(0, b.pets | 0);

  if (isStay(b.package)) {
    const n = b.checkIn && b.checkOut ? nightsBetween(b.checkIn, b.checkOut) : 0;
    const stay = STAYS[b.package];
    add(`${stay.name}, ${s(Math.max(guests, 10), "guest")} × ${s(n, "night")}`, nightlyRate(b.package, guests) * n);
    add(s(pets, "pet") + " (cleaning fee)", pets * PET_OVERNIGHT);
    add(s(b.visitors | 0, "day visitor"), (b.visitors | 0) * VISITOR);
    if (b.event) add("Event venue use", EVENT_FEE);
    for (const a of ADDONS) {
      const qty = b.addons?.[a.id] | 0;
      add(a.per === "each" ? `${a.name} × ${qty}` : a.name, qty * a.price);
    }
  } else if (b.package === "dayuse") {
    const rate = b.checkIn && isWeekendDay(b.checkIn) ? DAY_WEEKEND : DAY_WEEKDAY;
    if (b.checkIn) add(`Day use, ${rate === DAY_WEEKEND ? "weekend" : "weekday"} (${rate.included} guests)`, rate.base);
    const extra = Math.max(0, Math.min(guests, DAY_MAX) - rate.included);
    add(s(extra, "extra guest"), extra * DAY_EXTRA);
    add(s(kids, "child", "children") + " under 7", kids * DAY_CHILD);
    add(s(pets, "pet") + " (cleaning fee)", pets * PET_DAY);
  } else if (b.package === "wedding") {
    if (b.checkIn) add("Intimate wedding, all-inclusive", WEDDING);
    add(s(pets, "pet") + " (cleaning fee)", pets * PET_OVERNIGHT);
  } else if (b.package === "birthday") {
    return { lines: [["Birthday package", null]], total: 0, deposit: 0, onRequest: true };
  }

  const total = lines.reduce((sum, [, a]) => sum + a, 0);
  return { lines, total, deposit: Math.round(total * DEPOSIT_RATE), onRequest: false };
}
