// Pay maths for the owner dashboard. Pure, no React, no database.
import { daysInMonth } from "./stats.js";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DEDUCTIONS = ["SSS", "PhilHealth", "Pag-IBIG", "Other"];

/** How many dates in the month (YYYY-MM) fall on one of the staff member's on-call weekdays. */
export function onCallDays(onCall, key) {
  const [y, m] = key.split("-").map(Number);
  let n = 0;
  for (let d = 1; d <= daysInMonth(key); d++) if (onCall.includes(new Date(Date.UTC(y, m - 1, d)).getUTCDay())) n++;
  return n;
}

/** Monthly staff get their rate; daily staff get rate × days worked. */
export const payFor = (s, days) => (s.pay_type === "monthly" ? s.rate : s.rate * days);

/** Cash advanced to a staff member that payroll hasn't recovered yet. */
export const outstanding = (staffId, advances, payroll) =>
  advances.filter((a) => a.staff_id === staffId).reduce((t, a) => t + a.amount, 0) -
  payroll.filter((p) => p.staff_id === staffId).reduce((t, p) => t + (p.advance || 0), 0);

/**
 * Break gross pay into deductions, advance recovered and net. Never goes below zero: deductions
 * are taken in order until the pay runs out, then as much of the advance as is left; whatever
 * isn't recovered stays outstanding for the next payroll.
 */
export function slip(gross, standing = {}, owed = 0) {
  let left = gross;
  const deductions = {};
  for (const k of DEDUCTIONS) {
    const v = Math.min(left, Math.max(0, standing[k] | 0));
    if (v) (deductions[k] = v), (left -= v);
  }
  const advance = Math.min(left, Math.max(0, owed));
  return { gross, deductions, advance, net: left - advance };
}
