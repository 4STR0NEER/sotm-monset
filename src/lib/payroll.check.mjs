// node src/lib/payroll.check.mjs
import assert from "node:assert/strict";
import { onCallDays, outstanding, payFor, slip } from "./payroll.js";

// Nov 2026 starts on a Sunday: 5 Sundays, 5 Mondays, 4 of every other day
assert.equal(onCallDays([0], "2026-11"), 5);
assert.equal(onCallDays([0, 1, 2], "2026-11"), 14);
assert.equal(onCallDays([], "2026-11"), 0);
assert.equal(onCallDays([0, 1, 2, 3, 4, 5, 6], "2026-02"), 28);

assert.equal(payFor({ pay_type: "monthly", rate: 15000 }, 3), 15000);
assert.equal(payFor({ pay_type: "daily", rate: 600 }, 14), 8400);
// deductions then advance, never below zero; the rest of the advance carries over
assert.deepEqual(slip(15000, { SSS: 450, PhilHealth: 250 }, 2000), { gross: 15000, deductions: { SSS: 450, PhilHealth: 250 }, advance: 2000, net: 12300 });
assert.deepEqual(slip(1000, { SSS: 450, "Pag-IBIG": 100 }, 5000), { gross: 1000, deductions: { SSS: 450, "Pag-IBIG": 100 }, advance: 450, net: 0 });
assert.deepEqual(slip(300, { SSS: 450 }, 100), { gross: 300, deductions: { SSS: 300 }, advance: 0, net: 0 });
assert.deepEqual(slip(800), { gross: 800, deductions: {}, advance: 0, net: 800 });

const adv = [{ staff_id: "a", amount: 3000 }, { staff_id: "a", amount: 1000 }, { staff_id: "b", amount: 500 }];
assert.equal(outstanding("a", adv, [{ staff_id: "a", advance: 2500 }, { staff_id: "b", advance: 500 }]), 1500);
console.log("payroll ok");
