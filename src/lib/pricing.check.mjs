// node src/lib/pricing.check.mjs — fails loudly if a published rate stops pricing right.
import assert from "node:assert/strict";
import { quote, isWeekendDay } from "./pricing.js";

// 2026-11-09 is a Monday, 2026-11-13 a Friday, 2026-11-14 a Saturday
assert.equal(isWeekendDay("2026-11-09"), false);
assert.equal(isWeekendDay("2026-11-13"), true);
assert.equal(isWeekendDay("2026-11-14"), true);

// Day use weekday: ₱4,500 for 4, +₱500 per extra head, ₱250 per child under 7, ₱500 per pet
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-09", guests: 4 }).total, 4500);
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-09", guests: 6, kids: 2, pets: 1 }).total, 4500 + 1000 + 500 + 500);
// Day use weekend: ₱10,000 for 12, capped at 40
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-13", guests: 12 }).total, 10000);
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-13", guests: 99 }).total, 10000 + 28 * 500);

// Overnight (sample rate) × nights, extra beds over 24, pets ₱700, event ₱7,000 + ₱500 per non-staying guest
const o = quote({ package: "overnight", checkIn: "2026-11-09", checkOut: "2026-11-11", guests: 26, pets: 1, event: true, nonStaying: 10 });
assert.equal(o.total, 28000 * 2 + 2 * 500 * 2 + 700 + 7000 + 5000);
assert.equal(o.deposit, Math.round(o.total / 2));

// Wedding ₱90,000 flat; birthday on request
assert.equal(quote({ package: "wedding", checkIn: "2026-11-09", checkOut: "2026-11-11", guests: 50 }).total, 90000);
assert.equal(quote({ package: "birthday", checkIn: "2026-11-09" }).onRequest, true);

// No dates yet: no charges
assert.equal(quote({ package: "dayuse", guests: 12, pets: 1 }).total, 0);
assert.equal(quote({ package: "overnight", guests: 30, pets: 2 }).lines.length, 0);

console.log("pricing ok");
