import { useState } from "react";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
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

      <Board staff={staff} edit={(s) => setForm({ ...s, rate: String(s.rate) })} remove={remove} notify={notify} />
    </div>
  );
}

// Designation board: one column per role, drag a card across to re-designate. Columns come from
// the designations in use plus any the owner adds; empty added columns are kept in this browser.
const daysLabel = (d) => (d.length === 7 ? "Every day" : d.length ? d.map((x) => WEEKDAYS[x]).join(", ") : "No days set");
const loadCols = () => { try { return JSON.parse(localStorage.getItem("sotm-roles")) || ROLES.slice(0, 4); } catch { return ROLES.slice(0, 4); } };

function Board({ staff, edit, remove, notify }) {
  const [extra, setExtra] = useState(loadCols);
  const [over, setOver] = useState(null);
  const [adding, setAdding] = useState("");
  const keep = (list) => { setExtra(list); try { localStorage.setItem("sotm-roles", JSON.stringify(list)); } catch { /* private mode */ } };

  const cols = [...new Set([...extra, ...staff.map((s) => s.designation).filter(Boolean)])];
  if (staff.some((s) => !s.designation)) cols.unshift("");

  const move = async (id, designation) => {
    const s = staff.find((x) => x.id === id);
    if (!s || s.designation === designation) return;
    try {
      await saveRow("staff", { id, designation });
      notify(`${s.name} → ${designation || "Unassigned"}`, () => saveRow("staff", { id, designation: s.designation }).catch((e) => notify(e.message)));
    } catch (e) {
      notify(e.message);
    }
  };

  const addCol = (e) => {
    e.preventDefault();
    const name = adding.trim().slice(0, 80);
    if (name && !cols.includes(name)) keep([...extra, name]);
    setAdding("");
  };

  return (
    <div className={`${CARD} min-w-0`}>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {cols.map((col) => {
          const people = staff.filter((s) => s.designation === col);
          return (
            <section
              key={col || "none"}
              aria-label={col || "Unassigned"}
              onDragOver={(e) => (e.preventDefault(), setOver(col))}
              onDragLeave={() => setOver((o) => (o === col ? null : o))}
              onDrop={(e) => (e.preventDefault(), setOver(null), move(e.dataTransfer.getData("text/plain"), col))}
              className={`flex w-60 shrink-0 flex-col rounded-2xl p-2.5 transition-colors ${over === col ? "bg-pine/10 ring-2 ring-pine/40" : "bg-night/[0.04]"}`}
            >
              <header className="mb-2 flex items-center justify-between px-1.5">
                <h3 className="text-sm font-semibold text-night/80">{col || "Unassigned"} <span className="tnum font-normal text-night/40">{people.length}</span></h3>
                {col && !people.length && extra.includes(col) && (
                  <button onClick={() => keep(extra.filter((x) => x !== col))} className="rounded-full p-1 text-night/40 hover:text-crimson" aria-label={`Remove ${col} column`}><X size={14} /></button>
                )}
              </header>
              <div className="flex min-h-16 flex-col gap-2">
                {people.map((s) => (
                  <article
                    key={s.id}
                    draggable
                    onDragStart={(e) => (e.dataTransfer.setData("text/plain", s.id), (e.dataTransfer.effectAllowed = "move"))}
                    className="group cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-night/[0.06] active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical size={14} className="mt-0.5 shrink-0 text-night/25" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-night/85">{s.name}</p>
                        <p className="text-xs text-night/55">{daysLabel(s.on_call)}</p>
                        <p className="tnum mt-1 text-xs text-night/45">{peso(s.rate)} / {s.pay_type === "monthly" ? "month" : "day"}</p>
                      </div>
                      <div className="flex shrink-0 opacity-60 transition-opacity group-hover:opacity-100">
                        <button onClick={() => edit(s)} className="rounded-full p-1.5 text-night/60 hover:bg-night/5 hover:text-night" aria-label={`Edit ${s.name}`}><Pencil size={13} /></button>
                        <button onClick={() => remove(s)} className="rounded-full p-1.5 text-night/60 hover:bg-crimson/10 hover:text-crimson" aria-label={`Remove ${s.name}`}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </article>
                ))}
                {!people.length && <p className="rounded-xl border border-dashed border-night/15 p-3 text-center text-xs text-night/40">Drop staff here</p>}
              </div>
            </section>
          );
        })}
        <form onSubmit={addCol} className="w-52 shrink-0 self-start rounded-2xl border border-dashed border-night/15 p-2.5">
          <label className="flex items-center gap-1.5">
            <Plus size={15} className="text-night/40" aria-hidden="true" />
            <input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="Add designation" aria-label="New designation column" className="w-full bg-transparent py-1 text-sm outline-none" />
          </label>
        </form>
      </div>
      {staff.length === 0 && <p className="pt-4 text-center text-sm text-night/50">No staff yet. Add your first with the form.</p>}
    </div>
  );
}
