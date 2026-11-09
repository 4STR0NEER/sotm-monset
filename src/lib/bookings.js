// Bookings live in Supabase (table `bookings`, see supabase/migrations/0001_bookings.sql).
// Guests can only file requests and read which nights are taken; the signed-in owner reads and
// edits everything. Nothing else in the app talks to the database about bookings.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { quote, unitOf } from "./pricing.js";
import { supabase } from "./supabase.js";

const DAY = 86_400_000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const OFFLINE = "Online booking is offline right now. Please call us to book.";

// The app speaks camelCase, the table snake_case.
const COLS = { checkIn: "check_in", checkOut: "check_out", createdAt: "created_at", emailedAt: "emailed_at" };
const BACK = Object.fromEntries(Object.entries(COLS).map(([a, b]) => [b, a]));
const toRow = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [COLS[k] ?? k, v]));
const fromRow = (r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [BACK[k] ?? k, v]));

/** Nights (YYYY-MM-DD) a stay is taken. Works on full bookings or booked_ranges() rows. No unit = either stay. */
export function takenDates(list, unit) {
  const set = new Set();
  for (const b of list) {
    if (b.status === "cancelled" || (unit && (b.unit ?? unitOf(b.package)) !== unit)) continue;
    for (let t = Date.parse(b.checkIn); t < Date.parse(b.checkOut); t += DAY) set.add(iso(t));
  }
  return set;
}

// ---- guests -------------------------------------------------------------------------------

/** Taken nights for one stay, from the dates-only booked_ranges() function. `refresh` re-fetches. */
export function useTakenDates(unit) {
  const [ranges, setRanges] = useState([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    supabase?.rpc("booked_ranges").then(({ data }) => live && data && setRanges(data.map(fromRow)));
    return () => { live = false; };
  }, [tick]);
  const taken = useMemo(() => takenDates(ranges, unit), [ranges, unit]);
  return [taken, () => setTick((t) => t + 1)];
}

const newId = () => {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I to misread over the phone
  return "SOTM-" + Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => abc[n % abc.length]).join("");
};

export async function createBooking(input) {
  if (!supabase) throw new Error(OFFLINE);
  const q = quote(input);
  const fields = ["package", "checkIn", "checkOut", "guests", "kids", "pets", "visitors", "event", "addons", "name", "phone", "email", "notes"];
  const booking = {
    ...Object.fromEntries(fields.map((k) => [k, input[k]])),
    kids: input.kids | 0, pets: input.pets | 0, visitors: input.visitors | 0, event: !!input.event, addons: input.addons ?? {},
    total: q.total, deposit: q.deposit, paid: 0, status: "requested", source: "web",
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newId();
    const { error } = await supabase.from("bookings").insert(toRow({ ...booking, id }));
    if (!error) {
      // confirmation to the guest + a copy to the owner (supabase/functions/booking-email)
      supabase.functions.invoke("booking-email", { body: { id } }).catch(() => {});
      return { ...booking, id, createdAt: new Date().toISOString() };
    }
    if (error.code === "23505") continue; // id collision: draw again
    if (error.code === "23P01") throw new Error("Those dates were just booked. Please pick others.");
    console.error(error);
    throw new Error("We couldn't send your request. Please try again, or call us.");
  }
  throw new Error("We couldn't send your request. Please try again, or call us.");
}

// ---- owner (RLS only returns rows to the owner account) -------------------------------------

let cache = [];
let channel = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

async function load() {
  const { data, error } = await supabase.from("bookings").select("*").order("check_in");
  if (error) return console.error(error);
  cache = data.map(fromRow);
  emit();
}

function start() {
  if (channel || !supabase) return;
  load();
  // a guest booking or an edit in another tab shows up straight away
  channel = supabase.channel("bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load).subscribe();
}

/** Call on sign-out so the next account starts clean. */
export function stopBookings() {
  if (channel) supabase.removeChannel(channel);
  channel = null;
  cache = [];
  emit();
}

const subscribe = (fn) => (listeners.add(fn), start(), () => listeners.delete(fn));
export const useBookings = () => useSyncExternalStore(subscribe, () => cache);

/** Optimistic: the dashboard updates at once, and rolls back to the server's copy if the save fails. */
export async function updateBooking(id, patch) {
  cache = cache.map((b) => (b.id === id ? { ...b, ...patch } : b));
  emit();
  const { error } = await supabase.from("bookings").update(toRow(patch)).eq("id", id);
  if (error) {
    load();
    throw new Error("That change didn't save. Check your connection and try again.");
  }
}
