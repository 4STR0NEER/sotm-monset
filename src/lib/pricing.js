// Prices a booking from the rules published on sotmretreatresort.com (/packages and /faqs).
// Anything the site doesn't state is a SAMPLE constant here, so it is easy to find and replace.
import { PACKAGES } from "../data/site.js";

const pkg = (id) => PACKAGES.find((p) => p.id === id);

export const OVERNIGHT_RATE = pkg("overnight").price; // SAMPLE (site publishes none)
export const OVERNIGHT_INCLUDED = 24; // both rooms (FAQ)
export const OVERNIGHT_MAX = 30; // with 3 extra beds per room (FAQ)
export const EXTRA_BED = 500; // SAMPLE: "extra charge" per extra head, amount not published
export const EVENT_FEE = pkg("event").price; // ₱7,000 venue use
export const NON_STAYING = 500; // per non-staying event guest
export const PET_OVERNIGHT = 700;
export const PET_DAY = 500;
export const DAY_WEEKDAY = { base: pkg("dayuse").price, included: 4 }; // Mon–Thu
export const DAY_WEEKEND = { base: pkg("dayuse").weekend.price, included: 12 }; // Fri–Sun (site omits Sat; we treat it as weekend)
export const DAY_EXTRA = 500;
export const DAY_CHILD = 250; // under 7
export const DAY_MAX = 40;
export const WEDDING = pkg("wedding").price; // all-inclusive, 2 nights, up to 50
export const WEDDING_MAX = 50;
export const DEPOSIT_RATE = 0.5; // SAMPLE: the site states no deposit policy

// What each package books on the calendar: fixed nights (null = guest picks a range)
export const KINDS = {
  overnight: { nights: null, minNights: 1, maxGuests: OVERNIGHT_MAX },
  dayuse: { nights: 1, maxGuests: DAY_MAX },
  birthday: { nights: 1, maxGuests: 30 },
  wedding: { nights: 2, maxGuests: WEDDING_MAX },
};

const dow = (iso) => new Date(iso + "T00:00:00Z").getUTCDay(); // 0 Sun … 6 Sat
export const isWeekendDay = (iso) => ![1, 2, 3, 4].includes(dow(iso));
export const nightsBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

/**
 * b = { package, checkIn, checkOut, guests, kids, pets, event, nonStaying }
 *   guests: people counted (8 and up); kids: children 1–7
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

  if (b.package === "overnight") {
    const n = b.checkIn && b.checkOut ? nightsBetween(b.checkIn, b.checkOut) : 0;
    add(`Whole property × ${n} night${n === 1 ? "" : "s"}`, OVERNIGHT_RATE * n);
    const extra = Math.max(0, Math.min(guests, OVERNIGHT_MAX) - OVERNIGHT_INCLUDED);
    add(`${extra} extra bed${extra === 1 ? "" : "s"} × ${n} night${n === 1 ? "" : "s"}`, extra * EXTRA_BED * n);
    add(`${pets} pet${pets === 1 ? "" : "s"}`, pets * PET_OVERNIGHT);
    if (b.event) {
      add("Event venue use", EVENT_FEE);
      add(`${b.nonStaying | 0} non-staying guest${(b.nonStaying | 0) === 1 ? "" : "s"}`, (b.nonStaying | 0) * NON_STAYING);
    }
  } else if (b.package === "dayuse") {
    const rate = b.checkIn && isWeekendDay(b.checkIn) ? DAY_WEEKEND : DAY_WEEKDAY;
    if (b.checkIn) add(`Day use, ${rate === DAY_WEEKEND ? "weekend" : "weekday"} (${rate.included} guests)`, rate.base);
    const extra = Math.max(0, Math.min(guests, DAY_MAX) - rate.included);
    add(`${extra} extra guest${extra === 1 ? "" : "s"}`, extra * DAY_EXTRA);
    add(`${kids} child${kids === 1 ? "" : "ren"} under 7`, kids * DAY_CHILD);
    add(`${pets} pet${pets === 1 ? "" : "s"}`, pets * PET_DAY);
  } else if (b.package === "wedding") {
    if (b.checkIn) add("Intimate wedding, all-inclusive", WEDDING);
    add(`${pets} pet${pets === 1 ? "" : "s"}`, pets * PET_OVERNIGHT);
  } else if (b.package === "birthday") {
    return { lines: [["Birthday package", null]], total: 0, deposit: 0, onRequest: true };
  }

  const total = lines.reduce((s, [, a]) => s + a, 0);
  return { lines, total, deposit: Math.round(total * DEPOSIT_RATE), onRequest: false };
}
