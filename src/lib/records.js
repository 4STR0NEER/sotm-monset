// Owner-only tables (staff, expenses, payroll, advances — supabase/migrations/0002, 0003), one live
// store per table. Same shape as lib/bookings.js but plain rows, snake_case as stored.
import { useSyncExternalStore } from "react";
import { supabase } from "./supabase.js";

const ORDER = { staff: "name", expenses: "spent_on", payroll: "month", advances: "given_on" };
const stores = {};

function store(table) {
  if (stores[table]) return stores[table];
  const s = { rows: [], listeners: new Set(), channel: null };
  s.emit = () => s.listeners.forEach((fn) => fn());
  s.load = async () => {
    const { data, error } = await supabase.from(table).select("*").order(ORDER[table]);
    if (error) return console.error(error);
    s.rows = data;
    s.emit();
  };
  s.subscribe = (fn) => {
    s.listeners.add(fn);
    if (!s.channel && supabase) {
      s.load();
      s.channel = supabase.channel(table).on("postgres_changes", { event: "*", schema: "public", table }, s.load).subscribe();
    }
    return () => s.listeners.delete(fn);
  };
  return (stores[table] = s);
}

export const useRows = (table) => {
  const s = store(table);
  return useSyncExternalStore(s.subscribe, () => s.rows);
};

const fail = (error) => {
  console.error(error);
  throw new Error("That change didn't save. Check your connection and try again.");
};

/** Insert (no id) or update (with id). Returns the saved row. */
export async function saveRow(table, { id, created_at, ...row }) {
  const s = store(table);
  if (id) (s.rows = s.rows.map((r) => (r.id === id ? { ...r, ...row } : r))), s.emit(); // optimistic
  const q = id ? supabase.from(table).update(row).eq("id", id) : supabase.from(table).insert(row);
  const { data, error } = await q.select().single();
  if (error) (s.load(), fail(error));
  s.load();
  return data;
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) fail(error);
  store(table).load();
}

/** Call on sign-out so the next account starts clean. */
export function stopRecords() {
  for (const s of Object.values(stores)) {
    if (s.channel) supabase.removeChannel(s.channel);
    s.channel = null;
    s.rows = [];
    s.emit();
  }
}
