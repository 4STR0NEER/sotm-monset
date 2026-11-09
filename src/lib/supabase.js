import { createClient } from "@supabase/supabase-js";

// Public values: the anon key only reaches what the database's row-level security allows
// (supabase/migrations/0001_bookings.sql). Never put the service_role key in a VITE_* variable.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Missing keys take down booking and the dashboard, not the whole site.
export const supabase = url && key ? createClient(url, key) : null;
if (!supabase) console.error("Supabase is not configured: copy .env.example to .env.local and fill it in.");

export const OWNER_EMAIL = "sermononthemount.ph@gmail.com";
