// The booking "backend" for the demo: localStorage, seeded with sample bookings so the
// calendar and the owner dashboard have something in them. Swap these functions for fetch()
// calls to a real API later; nothing else in the app touches storage.
import { useSyncExternalStore } from "react";
import { quote, unitOf } from "./pricing.js";

const KEY = "sotm-bookings-v2";
const DAY = 86_400_000;
const iso = (t) => new Date(t).toISOString().slice(0, 10);
const todayUTC = () => Date.parse(iso(Date.now()));

// Seeded random so every visitor sees the same sample data on the same day.
function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}
const FIRST = ["Ana", "Mark", "Joy", "Paolo", "Kristine", "Jerome", "Bea", "Carlo", "Liza", "Rafael", "Grace", "Miguel", "Trisha", "Dennis", "Camille", "Noel"];
const LAST = ["Dela Cruz", "Santos", "Reyes", "Villanueva", "Ong", "Tan", "Lim", "Cabahug", "Abellana", "Go", "Fernandez", "Ybañez", "Lao", "Uy"];

function seed() {
  const r = rng(816);
  const t0 = todayUTC();
  const out = [];
  let day = -120;
  let n = 1;
  while (day < 90) {
    day += 2 + Math.floor(r() * 5);
    const pick = r();
    const pkg = pick < 0.3 ? "lodge" : pick < 0.45 ? "chalet" : pick < 0.82 ? "dayuse" : pick < 0.93 ? "birthday" : "wedding";
    const nights = pkg === "lodge" || pkg === "chalet" ? 1 + Math.floor(r() * 2) : pkg === "wedding" ? 2 : 1;
    const checkIn = iso(t0 + day * DAY);
    const checkOut = iso(t0 + (day + nights) * DAY);
    const guests = pkg === "dayuse" ? 4 + Math.floor(r() * 14) : pkg === "wedding" ? 40 + Math.floor(r() * 10) : pkg === "chalet" ? 10 + Math.floor(r() * 6) : 12 + Math.floor(r() * 14);
    const b = {
      package: pkg, checkIn, checkOut, guests,
      kids: Math.floor(r() * 4), pets: r() < 0.25 ? 1 : 0,
      event: pkg === "lodge" && r() < 0.2, visitors: 0,
    };
    const q = quote(b);
    const past = day + nights <= 0;
    const status = past ? (r() < 0.08 ? "cancelled" : "completed") : r() < 0.35 ? "requested" : r() < 0.06 ? "cancelled" : "confirmed";
    const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
    out.push({
      ...b,
      id: `SOTM-${String(1000 + n++)}`,
      name,
      phone: `09${Math.floor(100000000 + r() * 899999999)}`,
      email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      notes: "",
      total: pkg === "birthday" ? 0 : q.total,
      deposit: q.deposit,
      paid: status === "completed" ? q.total : status === "confirmed" ? q.deposit : 0,
      status,
      createdAt: new Date(t0 + (day - 7 - Math.floor(r() * 30)) * DAY).toISOString(),
      source: "sample",
    });
  }
  return out;
}

let cache = null;
function read() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY));
  } catch {}
  if (!Array.isArray(cache)) {
    cache = seed();
    write(cache);
  }
  return cache;
}
const listeners = new Set();
function write(list) {
  cache = list;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  listeners.forEach((fn) => fn());
}
// another tab (e.g. the owner dashboard) changed the bookings
addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  cache = null;
  listeners.forEach((fn) => fn());
});

export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export const listBookings = () => read();
export const useBookings = () => useSyncExternalStore(subscribe, read);

/** Dates (YYYY-MM-DD) a stay is taken: every night of a live booking there. No unit = either stay. */
export function takenDates(list = read(), unit) {
  const set = new Set();
  for (const b of list) {
    if (b.status === "cancelled" || (unit && unitOf(b.package) !== unit)) continue;
    for (let t = Date.parse(b.checkIn); t < Date.parse(b.checkOut); t += DAY) set.add(iso(t));
  }
  return set;
}

export function createBooking(input) {
  const list = read();
  const taken = takenDates(list, unitOf(input.package));
  for (let t = Date.parse(input.checkIn); t < Date.parse(input.checkOut); t += DAY) {
    if (taken.has(iso(t))) throw new Error("Those dates were just booked. Please pick others.");
  }
  const q = quote(input);
  const booking = {
    ...input,
    id: `SOTM-${Date.now().toString(36).slice(-5).toUpperCase()}`,
    total: q.total,
    deposit: q.deposit,
    paid: 0,
    status: "requested",
    createdAt: new Date().toISOString(),
    source: "web",
  };
  write([...list, booking]);
  return booking;
}

export function updateBooking(id, patch) {
  write(read().map((b) => (b.id === id ? { ...b, ...patch } : b)));
}

export function resetBookings() {
  write(seed());
}
