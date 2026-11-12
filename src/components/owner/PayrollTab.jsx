import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { CircleCheck, FileText, Trash2 } from "lucide-react";
import Payslip from "./Payslip";
import { CARD, FIELD, PRIMARY, fmtDate, thisMonth, today } from "./ui";
import { deleteRow, saveRow, useRows } from "@/lib/records";
import { onCallDays, outstanding, payFor, slip } from "@/lib/payroll";
import { peso } from "@/data/site";

const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

// One line per staff member for the chosen month. Daily staff default to their on-call days that
// month; the owner adjusts for absences or extra days before marking paid. Standing deductions and
// any outstanding cash advance come off automatically (lib/payroll.js slip()).
export default function PayrollTab({ notify }) {
  const staff = useRows("staff");
  const payroll = useRows("payroll");
  const advances = useRows("advances");
  const [month, setMonth] = useState(thisMonth());
  const [days, setDays] = useState({}); // `${staffId}|${month}` -> edited days
  const [slipRow, setSlipRow] = useState(null);

  const paidRows = payroll.filter((p) => p.month === month);
  const lines = staff.map((s) => {
    const paid = paidRows.find((p) => p.staff_id === s.id);
    if (paid) return { s, paid, days: paid.days, gross: paid.gross || paid.amount, deductions: paid.deductions, advance: paid.advance, net: paid.amount };
    const d = days[`${s.id}|${month}`] ?? onCallDays(s.on_call, month);
    return { s, days: d, ...slip(payFor(s, d), s.deductions, outstanding(s.id, advances, payroll)) };
  });
  // people paid this month who have since been removed
  const gone = paidRows.filter((p) => !staff.some((s) => s.id === p.staff_id));
  const total = lines.reduce((t, l) => t + l.net, 0) + gone.reduce((t, p) => t + p.amount, 0);
  const paidTotal = paidRows.reduce((t, p) => t + p.amount, 0);

  const pay = async (l) => {
    try {
      const row = await saveRow("payroll", {
        staff_id: l.s.id, name: l.s.name, month, days: l.s.pay_type === "daily" ? l.days : 0,
        gross: l.gross, deductions: l.deductions, advance: l.advance, amount: l.net,
      });
      notify(`${l.s.name} paid ${peso(l.net)}`, () => deleteRow("payroll", row.id).catch((e) => notify(e.message)));
    } catch (e) {
      notify(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={CARD}>
          <p className="text-xs uppercase tracking-wide text-night/45">Month</p>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Payroll month" className={`${FIELD} mt-2`} />
        </div>
        <div className={CARD}>
          <p className="text-xs uppercase tracking-wide text-night/45">Net payroll due</p>
          <p className="tnum mt-1 font-display text-3xl text-pine-deep">{peso(total)}</p>
        </div>
        <div className={CARD}>
          <p className="text-xs uppercase tracking-wide text-night/45">Paid so far</p>
          <p className="tnum mt-1 font-display text-3xl text-pine-deep">{peso(paidTotal)}</p>
        </div>
      </div>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night/45">
            <tr>
              <th className="py-3 pl-3 font-medium">Staff</th>
              <th className="font-medium">Days</th>
              <th className="text-right font-medium">Gross</th>
              <th className="text-right font-medium">Deductions</th>
              <th className="text-right font-medium">Advance</th>
              <th className="text-right font-medium">Net</th>
              <th className="pl-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.s.id} className="border-t border-night/[0.06]">
                <td className="py-3.5 pl-3">
                  <p className="font-medium text-night/85">{l.s.name}</p>
                  <p className="text-xs text-night/45">{l.s.designation}{l.s.designation && " · "}{peso(l.s.rate)} / {l.s.pay_type === "monthly" ? "month" : "day"}</p>
                </td>
                <td>
                  {l.s.pay_type === "monthly" ? <span className="text-night/40">—</span>
                  : l.paid ? <span className="tnum text-night/70">{l.days}</span>
                  : (
                    <input
                      type="number" min={0} max={31} inputMode="numeric"
                      value={l.days}
                      onChange={(e) => setDays((x) => ({ ...x, [`${l.s.id}|${month}`]: Math.min(31, Math.max(0, e.target.value | 0)) }))}
                      aria-label={`Days worked by ${l.s.name}`}
                      className={`${FIELD} tnum w-20 py-1.5`}
                    />
                  )}
                </td>
                <td className="tnum text-right text-night/75">{peso(l.gross)}</td>
                <td className="tnum text-right text-night/60" title={Object.entries(l.deductions || {}).map(([k, v]) => `${k} ${peso(v)}`).join(", ")}>{sum(l.deductions) ? `−${peso(sum(l.deductions))}` : "—"}</td>
                <td className="tnum text-right text-night/60">{l.advance ? `−${peso(l.advance)}` : "—"}</td>
                <td className="tnum text-right font-semibold text-night/85">{peso(l.net)}</td>
                <td className="pl-6">
                  {l.paid ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-pine/10 px-2.5 py-1 text-xs font-medium text-pine">
                        <CircleCheck size={13} aria-hidden="true" /> Paid {fmtDate(l.paid.paid_on)}
                      </span>
                      <button onClick={() => setSlipRow(l.paid)} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-night/60 hover:text-pine"><FileText size={13} /> Payslip</button>
                    </div>
                  ) : (
                    <button onClick={() => pay(l)} className="rounded-full border border-night/15 px-3.5 py-1.5 text-xs font-semibold text-night/80 hover:border-pine hover:text-pine">Mark paid</button>
                  )}
                </td>
              </tr>
            ))}
            {gone.map((p) => (
              <tr key={p.id} className="border-t border-night/[0.06] text-night/50">
                <td className="py-3.5 pl-3">{p.name} <span className="text-xs">(removed)</span></td>
                <td className="tnum">{p.days || "—"}</td>
                <td className="tnum text-right">{peso(p.gross || p.amount)}</td>
                <td className="tnum text-right">{sum(p.deductions) ? `−${peso(sum(p.deductions))}` : "—"}</td>
                <td className="tnum text-right">{p.advance ? `−${peso(p.advance)}` : "—"}</td>
                <td className="tnum text-right">{peso(p.amount)}</td>
                <td className="pl-6"><button onClick={() => setSlipRow(p)} className="inline-flex items-center gap-1 text-xs font-semibold hover:text-pine"><FileText size={13} /> Payslip</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && gone.length === 0 && <p className="py-12 text-center text-sm text-night/50">Add staff in the Staff tab to run payroll.</p>}
      </div>

      <Advances staff={staff} advances={advances} payroll={payroll} notify={notify} />

      <AnimatePresence>
        {slipRow && <Payslip row={slipRow} staff={staff.find((s) => s.id === slipRow.staff_id)} onClose={() => setSlipRow(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Advances({ staff, advances, payroll, notify }) {
  const [form, setForm] = useState({ staff_id: "", given_on: today(), amount: "", note: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const owing = staff.map((s) => [s, outstanding(s.id, advances, payroll)]).filter(([, v]) => v > 0);

  const submit = async (e) => {
    e.preventDefault();
    const s = staff.find((x) => x.id === form.staff_id);
    try {
      await saveRow("advances", { ...form, name: s.name, amount: Number(form.amount), note: form.note.trim() });
      notify(`Advance of ${peso(Number(form.amount))} to ${s.name} logged`);
      setForm((f) => ({ ...f, amount: "", note: "" }));
    } catch (err) {
      notify(err.message);
    }
  };

  const remove = async (a) => {
    try {
      await deleteRow("advances", a.id);
      notify("Advance deleted", () => saveRow("advances", { ...a, id: undefined }).catch((err) => notify(err.message)));
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div className={`${CARD} space-y-5`}>
      <div>
        <h2 className="font-display text-2xl text-pine-deep">Cash advances</h2>
        <p className="text-sm text-night/55">Recovered from the next payroll after deductions. Anything the pay can't cover carries over.</p>
      </div>

      {owing.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {owing.map(([s, v]) => (
            <span key={s.id} className="rounded-full bg-lantern/20 px-3 py-1.5 text-xs font-medium text-wood">{s.name} owes <span className="tnum">{peso(v)}</span></span>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_9rem_8rem_1fr_auto] sm:items-end">
        <label className="text-sm text-night/70">Staff
          <select required value={form.staff_id} onChange={set("staff_id")} className={`${FIELD} mt-1`}>
            <option value="" disabled>Choose…</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-night/70">Date<input required type="date" value={form.given_on} onChange={set("given_on")} className={`${FIELD} mt-1`} /></label>
        <label className="text-sm text-night/70">Amount<input required type="number" min={1} inputMode="numeric" value={form.amount} onChange={set("amount")} className={`${FIELD} tnum mt-1`} /></label>
        <label className="text-sm text-night/70">Note<input value={form.note} onChange={set("note")} maxLength={300} placeholder="optional" className={`${FIELD} mt-1`} /></label>
        <button className={PRIMARY}>Add advance</button>
      </form>

      {advances.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-night/45">
              <tr><th className="py-3 pl-3 font-medium">Date</th><th className="font-medium">Staff</th><th className="font-medium">Note</th><th className="text-right font-medium">Amount</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {[...advances].reverse().map((a) => (
                <tr key={a.id} className="border-t border-night/[0.06]">
                  <td className="tnum py-3 pl-3 text-night/70">{fmtDate(a.given_on)}</td>
                  <td className="text-night/80">{a.name}</td>
                  <td className="text-night/60">{a.note || "—"}</td>
                  <td className="tnum text-right text-night/85">{peso(a.amount)}</td>
                  <td className="pr-2 text-right">
                    <button onClick={() => remove(a)} className="rounded-full p-2 text-night/50 hover:bg-crimson/10 hover:text-crimson" aria-label={`Delete advance to ${a.name}`}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
