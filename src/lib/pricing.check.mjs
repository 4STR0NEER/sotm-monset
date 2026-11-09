// node src/lib/pricing.check.mjs — fails loudly if a published rate stops pricing right.
import assert from "node:assert/strict";
import { quote, isWeekendDay } from "./pricing.js";
import { nightlyRate } from "../data/site.js";

// 2026-11-09 is a Monday, 2026-11-13 a Friday, 2026-11-14 a Saturday
assert.equal(isWeekendDay("2026-11-09"), false);
assert.equal(isWeekendDay("2026-11-13"), true);
assert.equal(isWeekendDay("2026-11-14"), true);

// Rate tiers: 10 → ₱14,500, 15 → ₱19,500 (both stays); Lodge 24/30/40; ₱1,000 per head above a tier
assert.equal(nightlyRate("chalet", 6), 14500); // under 10 still pays the 10-guest rate
assert.equal(nightlyRate("chalet", 12), 16500);
assert.equal(nightlyRate("chalet", 15), 19500);
assert.equal(nightlyRate("lodge", 20), 24500); // 15 + 5 extra beats the 24 tier
assert.equal(nightlyRate("lodge", 24), 29000);
assert.equal(nightlyRate("lodge", 28), 33000);
assert.equal(nightlyRate("lodge", 40), 45000);

// Overnight × nights + pets ₱700 + day visitors ₱500 + extras
const o = quote({
  package: "lodge", checkIn: "2026-11-09", checkOut: "2026-11-11", guests: 24, pets: 1, visitors: 3,
  addons: { bonfire: 1, towels: 4 },
});
assert.equal(o.total, 29000 * 2 + 700 + 1500 + 500 + 300);
assert.equal(o.deposit, Math.round(o.total / 2));

// Day use weekday: ₱4,500 for 4, +₱500 per extra head, ₱250 per child under 7, ₱500 per pet
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-09", guests: 4 }).total, 4500);
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-09", guests: 6, kids: 2, pets: 1 }).total, 4500 + 1000 + 500 + 500);
assert.equal(quote({ package: "dayuse", checkIn: "2026-11-13", guests: 99 }).total, 10000 + 28 * 500);

// Wedding ₱90,000 flat; birthday on request
assert.equal(quote({ package: "wedding", checkIn: "2026-11-09", checkOut: "2026-11-11", guests: 50 }).total, 90000);
assert.equal(quote({ package: "birthday", checkIn: "2026-11-09" }).onRequest, true);

// No dates yet: no charges
assert.equal(quote({ package: "chalet", guests: 15, pets: 2 }).lines.length, 0);

console.log("pricing ok");
