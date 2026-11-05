// node src/lib/stats.check.mjs
import assert from "node:assert/strict";
import { revenueByMonth, occupancy, money, mix, addMonths, daysInMonth } from "./stats.js";

const list = [
  { package: "overnight", checkIn: "2026-11-30", checkOut: "2026-12-02", total: 56000, paid: 28000, deposit: 28000, status: "confirmed" },
  { package: "dayuse", checkIn: "2026-11-10", checkOut: "2026-11-11", total: 4500, paid: 0, deposit: 2250, status: "requested" },
  { package: "dayuse", checkIn: "2026-11-12", checkOut: "2026-11-13", total: 4500, paid: 0, deposit: 2250, status: "cancelled" },
  { package: "wedding", checkIn: "2026-10-01", checkOut: "2026-10-03", total: 90000, paid: 90000, deposit: 45000, status: "completed" },
];

assert.equal(addMonths("2026-11", 2), "2027-01");
assert.equal(addMonths("2026-01", -1), "2025-12");
assert.equal(daysInMonth("2026-02"), 28);
assert.deepEqual(revenueByMonth(list, ["2026-10", "2026-11"]), [
  { key: "2026-10", secured: 90000, pending: 0 },
  { key: "2026-11", secured: 56000, pending: 4500 }, // cancelled excluded
]);
// Nov: the 30th (overnight's first night) + the 10th (day use); the cancelled 12th doesn't count
assert.equal(occupancy(list, "2026-11"), 2 / 30);
// Dec: the overnight's second night spills into December
assert.equal(occupancy(list, "2026-12"), 1 / 31);
assert.deepEqual(money(list), { collected: 118000, outstanding: 28000, pendingDeposits: 2250 });
assert.deepEqual(mix(list, ["overnight", "dayuse", "wedding"]), { overnight: 1, dayuse: 1, wedding: 1 });
console.log("stats ok");
