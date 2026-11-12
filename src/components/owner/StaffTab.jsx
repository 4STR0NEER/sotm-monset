import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CARD, FIELD, PRIMARY } from "./ui";
import { deleteRow, saveRow, useRows } from "@/lib/records";
import { DEDUCTIONS, WEEKDAYS } from "@/lib/payroll";
import { peso } from "@/data/site";

const BLANK = { name: "", designation: "", pay_type: "monthly", rate: "", on_call: [], phone: "", deductions: {} };
const ROLES = ["Caretaker", "Housekeeping", "Cook", "Security", "Gardener", "Pool attendant", "Driver"];

export default function StaffTab({ notify }) {
  const staff = useRows("staff");
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleDay = (d) => setForm((f) => ({ ...f, on_call: f.on_call.includes(d) ? f.on_call.filter((x) => x !== d) : [...f.on_call, d].sort() }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveRow("staff", { ...form, name: form.name.trim(), designation: form.designation.trim(), rate: Number(form.rate) || 0,
        deductions: Object.fromEntries(Object.entries(form.deductions).map(([k, v]) => [k, Number(v) | 0]).filter(([, v]) => v > 0)),
      });
      notify(form.id ? "Staff updated" : `${form.name.trim()} added`);
      setForm(BLANK);
    } catch (err) {
      notify(err.message);
    }
    setBusy(false);
  };

  const remove = async (s) => {
    if (!confirm(`Remove ${s.name}? Past payroll stays on record.`)) return;
    try {
      await deleteRow("staff", s.id);
      notify(`${s.name} removed`);
      if (form.id === s.id) setForm(BLANK);
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
      <form onSubmit={submit} className={`${CARD} space-y-4 self-start`}>
        <h2 className="font-display text-2xl text-pine-deep">{form.id ? "Edit staff" : "Add staff"}</h2>
        <label className="block text-sm text-night/70">Name
          <input required minLength={2} value={form.name} onChange={set("name")} className={`${FIELD} mt-1`} />
        </label>
        <label className="block text-sm text-night/70">Designation
          <input list="roles" value={form.designation} onChange={set("designation")} placeholder="e.g. Caretaker" className={`${FIELD} mt-1`} />
          <datalist id="roles">{ROLES.map((r) => <option key={r} value={r} />)}</datalist>
        </label>
        <label className="block text-sm text-night/70">Phone
          <input type="tel" value={form.phone} onChange={set("phone")} className={`${FIELD} mt-1`} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-night/70">Paid
            <select value={form.pay_type} onChange={set("pay_type")} className={`${FIELD} mt-1`}>
              <option value="monthly">Monthly</option>
              <option value="daily">Per day</option>
            </select>
          </label>
          <label className="block text-sm text-night/70">{form.pay_type === "monthly" ? "Monthly salary" : "Daily rate"}
            <input required type="number" min={0} inputMode="numeric" value={form.rate} onChange={set("rate")} className={`${FIELD} tnum mt-1`} />
          </label>
        </div>
        <fieldset>
          <legend className="text-sm text-night/70">Days on call</legend>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d, i) => (
              <button
                type="button"
                key={d}
                aria-pressed={form.on_call.includes(i)}
                onClick={() => toggleDay(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${form.on_call.includes(i) ? "bg-pine text-mist" : "bg-night/[0.06] text-night/60 hover:bg-night/10"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm text-night/70">Monthly deductions <span className="text-night/40">(taken at payroll)</span></legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {DEDUCTIONS.map((k) => (
              <label key={k} className="text-xs text-night/55">{k}
                <input
                  type="number" min={0} inputMode="numeric" placeholder="0"
                  value={form.deductions[k] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, deductions: { ...f.deductions, [k]: e.target.value } }))}
                  className={`${FIELD} tnum mt-0.5 py-2`}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex gap-2 pt-1">
          <button disabled={busy} className={PRIMARY}>{form.id ? "Save changes" : "Add staff"}</button>
          {form.id && <button type="button" onClick={() => setForm(BLANK)} className="rounded-full px-4 py-2.5 text-sm text-night/60 hover:text-night">Cancel</button>}
        </div>
      </form>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night/45">
            <tr>
              <th className="py-3 pl-3 font-medium">Name</th>
              <th className="font-medium">Designation</th>
              <th className="font-medium">On call</th>
              <th className="text-right font-medium">Pay</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-night/[0.06]">
                <td className="py-3.5 pl-3">
                  <p className="font-medium text-night/85">{s.name}</p>
                  {s.phone && <a href={`tel:${s.phone}`} className="text-xs text-night/45">{s.phone}</a>}
                </td>
                <td className="text-night/70">{s.designation || "—"}</td>
                <td className="text-night/70">{s.on_call.length === 7 ? "Every day" : s.on_call.map((d) => WEEKDAYS[d]).join(", ") || "—"}</td>
                <td className="tnum text-right text-night/80">
                  {peso(s.rate)}<span className="text-night/45"> / {s.pay_type === "monthly" ? "month" : "day"}</span>
                  {Object.keys(s.deductions).length > 0 && <p className="text-xs text-night/45">less {peso(Object.values(s.deductions).reduce((a, b) => a + b, 0))} deductions</p>}
                </td>
                <td className="pr-2 text-right">
                  <button onClick={() => setForm({ ...s, rate: String(s.rate) })} className="rounded-full p-2 text-night/50 hover:bg-night/5 hover:text-night" aria-label={`Edit ${s.name}`}><Pencil size={15} /></button>
                  <button onClick={() => remove(s)} className="rounded-full p-2 text-night/50 hover:bg-crimson/10 hover:text-crimson" aria-label={`Remove ${s.name}`}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <p className="py-16 text-center text-sm text-night/50">No staff yet. Add your first on the left.</p>}
      </div>
    </div>
  );
}
