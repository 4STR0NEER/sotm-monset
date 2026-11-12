import { useState } from "react";
import { ShieldCheck, Trash2, User } from "lucide-react";
import { CARD, FIELD, PRIMARY, fmtDate } from "./ui";
import { refresh, useRows } from "@/lib/records";
import { supabase } from "@/lib/supabase";

const BLANK = { name: "", email: "", password: "", role: "staff" };
const ROLE = {
  admin: ["Admin", "Everything, including money and accounts"],
  staff: ["Staff", "Bookings and calendar only"],
};

// Calls supabase/functions/accounts, which checks the caller is an admin before touching auth users.
async function call(body) {
  const { data, error } = await supabase.functions.invoke("accounts", { body });
  if (error) throw new Error((await error.context?.json?.().catch(() => null))?.error ?? "Couldn't reach the server. Try again.");
  refresh("roles");
  return data;
}

export default function AccountsTab({ me, notify }) {
  const people = useRows("roles");
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await call({ action: "create", ...form });
      notify(`Account for ${form.email} created. Share the password with them directly.`);
      setForm(BLANK);
    } catch (err) {
      notify(err.message);
    }
    setBusy(false);
  };

  const changeRole = async (p, role) => {
    const { error } = await supabase.from("roles").update({ role }).eq("user_id", p.user_id);
    refresh("roles");
    notify(error ? "That change didn't save." : `${p.name || p.email} is now ${ROLE[role][0].toLowerCase()}`);
  };

  const remove = async (p) => {
    if (!confirm(`Delete the account for ${p.email}? They won't be able to sign in any more.`)) return;
    try {
      await call({ action: "delete", user_id: p.user_id });
      notify(`${p.email} deleted`);
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
      <form onSubmit={create} className={`${CARD} space-y-4 self-start`}>
        <h2 className="font-display text-2xl text-pine-deep">Create account</h2>
        <label className="block text-sm text-night/70">Name<input value={form.name} onChange={set("name")} maxLength={120} className={`${FIELD} mt-1`} /></label>
        <label className="block text-sm text-night/70">Email<input required type="email" autoComplete="off" value={form.email} onChange={set("email")} className={`${FIELD} mt-1`} /></label>
        <label className="block text-sm text-night/70">Starting password
          <input required minLength={8} type="text" autoComplete="new-password" spellCheck={false} value={form.password} onChange={set("password")} className={`${FIELD} mt-1 font-mono`} />
          <span className="mt-1 block text-xs text-night/45">At least 8 characters. Give it to them in person or by text.</span>
        </label>
        <fieldset>
          <legend className="text-sm text-night/70">Role</legend>
          <div className="mt-1.5 grid gap-2">
            {Object.entries(ROLE).map(([id, [label, hint]]) => (
              <label key={id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${form.role === id ? "border-pine bg-pine/5" : "border-night/10"}`}>
                <input type="radio" name="role" value={id} checked={form.role === id} onChange={set("role")} className="mt-0.5 accent-[var(--color-pine)]" />
                <span><span className="block text-sm font-medium text-night/85">{label}</span><span className="text-xs text-night/50">{hint}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        <button disabled={busy} className={PRIMARY}>{busy ? "Creating…" : "Create account"}</button>
      </form>

      <div className={`${CARD} overflow-x-auto`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-night/45">
            <tr><th className="py-3 pl-3 font-medium">Person</th><th className="font-medium">Role</th><th className="font-medium">Added</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const self = p.email === me;
              const Icon = p.role === "admin" ? ShieldCheck : User;
              return (
                <tr key={p.user_id} className="border-t border-night/[0.06]">
                  <td className="py-3.5 pl-3">
                    <p className="flex items-center gap-1.5 font-medium text-night/85"><Icon size={14} className="text-moss" aria-hidden="true" />{p.name || p.email.split("@")[0]}{self && <span className="text-xs font-normal text-night/45">(you)</span>}</p>
                    <p className="text-xs text-night/45">{p.email}</p>
                  </td>
                  <td>
                    {self ? <span className="text-night/70">Admin</span> : (
                      <select value={p.role} onChange={(e) => changeRole(p, e.target.value)} aria-label={`Role for ${p.email}`} className={`${FIELD} w-auto py-1.5`}>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    )}
                  </td>
                  <td className="tnum text-night/60">{fmtDate(p.created_at.slice(0, 10), { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="pr-2 text-right">
                    {!self && <button onClick={() => remove(p)} className="rounded-full p-2 text-night/50 hover:bg-crimson/10 hover:text-crimson" aria-label={`Delete account for ${p.email}`}><Trash2 size={15} /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
