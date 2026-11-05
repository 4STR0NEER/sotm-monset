// Numbers for the owner dashboard, computed from the booking list. Pure functions, no React.
const DAY = 86_400_000;
export const monthKey = (iso) => iso.slice(0, 7);
export const daysInMonth = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};
export const addMonths = (key, n) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};
const live = (b) => b.status !== "cancelled";

/** Revenue by check-in month: secured (confirmed + completed) and pending (requested). */
export function revenueByMonth(list, months) {
  return months.map((key) => {
    const inMonth = list.filter((b) => live(b) && monthKey(b.checkIn) === key);
    const sum = (f) => inMonth.filter(f).reduce((s, b) => s + (b.total || 0), 0);
    return {
      key,
      secured: sum((b) => b.status !== "requested"),
      pending: sum((b) => b.status === "requested"),
    };
  });
}

/** Share of days in the month the property is taken (any live booking). */
export function occupancy(list, key) {
  const days = new Set();
  for (const b of list.filter(live)) {
    for (let t = Date.parse(b.checkIn); t < Date.parse(b.checkOut); t += DAY) {
      const iso = new Date(t).toISOString().slice(0, 10);
      if (monthKey(iso) === key) days.add(iso);
    }
  }
  return days.size / daysInMonth(key);
}

export function money(list) {
  const collected = list.reduce((s, b) => s + (b.paid || 0), 0);
  const outstanding = list
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => s + Math.max(0, (b.total || 0) - (b.paid || 0)), 0);
  const pendingDeposits = list
    .filter((b) => b.status === "requested")
    .reduce((s, b) => s + (b.deposit || 0), 0);
  return { collected, outstanding, pendingDeposits };
}

export function mix(list, keys) {
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const b of list.filter(live)) if (b.package in counts) counts[b.package]++;
  return counts;
}
