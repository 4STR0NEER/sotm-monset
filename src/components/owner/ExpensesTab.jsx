import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CARD, FIELD, PRIMARY, fmtDate, thisMonth, today } from "./ui";
import { deleteRow, saveRow, useRows } from "@/lib/records";
import { peso } from "@/data/site";

const CATEGORIES = ["Utilities", "Supplies", "Food", "Maintenance", "Fuel", "Marketing", "Taxes & fees", "Other"];

export default function ExpensesTab({ notify }) {
  const expenses = useRows("expenses");
  const payroll = useRows("payroll");
  const [month, setMonth] = useState(thisMonth());
  const [form, setForm] = useState({ spent_on: today(), category: "Utilities", description: "", amount: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const rows = expenses.filter((e) => e.spent_on.startsWith(month)).reverse();
  const spent = rows.reduce((s, e) => s + e.amount, 0);
  const wages = payroll.filter((p) => p.month === month).reduce((s, p) => s + p.amount, 0);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await saveRow("expenses", { ...form, description: form.description.trim(), amount: Number(form.amount) });
      notify(`${peso(Number(form.amount))} logged`);
      setForm((f) => ({ ...f, description: "", amount: "" }));
    } catch (err) {
      notify(err.message);
    }
  };

  const remove = async (x) => {
    try {
      await deleteRow("expenses", x.id);
      notify("Expense deleted", () => saveRow("expenses", { ...x, id: undefined }).catch((err) => notify(err.message)));
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Expenses", spent], ["Payroll paid", wages], ["Total out", spent + wages]].map(([label, v]) => (
          <div key={label} className={CARD}>
            <p className="text-xs uppercase tracking-wide text-night/45">{label}</p>
            <p className="tnum mt-1 font-display text-3xl text-pine-deep">{peso(v)}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className={`${CARD} grid gap-3 sm:grid-cols-[9rem_10rem_1fr_8rem_auto] sm:items-end`}>
        <label className="text-sm text-night/70">Date<input required type="date" value={form.spent_on} onChange={set("spent_on")} className={`${FIELD} mt-1`} /></label>
        <label className="text-sm text-night/70">Category
          <select value={form.category} onChange={set("category")} className={`${FIELD} mt-1`}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="text-sm text-night/70">What for<input value={form.description} onChange={set("description")} maxLength={300} placeholder="e.g. Electric bill" className={`${FIELD} mt-1`} /></label>
        <label className="text-sm text-night/70">Amount<input required type="number" min={1} inputMode="numeric" value={form.amount} onChange={set("amount")} className={`${FIELD} tnum mt-1`} /></label>
        <button className={PRIMARY}>Add</button>
      </form>

      <div className={`${CARD} overflow-x-auto`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-pine-deep">This month</h2>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" className={`${FIELD} w-auto`} />
        </div>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night/45">
            <tr><th className="py-3 pl-3 font-medium">Date</th><th className="font-medium">Category</th><th className="font-medium">What for</th><th className="text-right font-medium">Amount</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-t border-night/[0.06]">
                <td className="tnum py-3.5 pl-3 text-night/70">{fmtDate(x.spent_on)}</td>
                <td className="text-night/80">{x.category}</td>
                <td className="text-night/70">{x.description || "—"}</td>
                <td className="tnum text-right text-night/85">{peso(x.amount)}</td>
                <td className="pr-2 text-right">
                  <button onClick={() => remove(x)} className="rounded-full p-2 text-night/50 hover:bg-crimson/10 hover:text-crimson" aria-label={`Delete ${x.category} expense`}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-night/50">No expenses logged for this month.</p>}
      </div>
    </div>
  );
}
