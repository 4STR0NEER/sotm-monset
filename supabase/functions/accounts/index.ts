// Admin-only account management for the dashboard.
//   POST { action: "create", email, password, name, role }  → new sign-in, ready to use
//   POST { action: "delete", user_id }                      → removes the sign-in and its role
// The caller's own JWT decides: anyone whose my_role() isn't 'admin' gets 403. Creating users
// needs the service role, which is why this lives here and not in the browser.
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "POST only" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: me } = await caller.auth.getUser();
  const { data: role } = await caller.rpc("my_role");
  if (!me?.user || role !== "admin") return reply(403, { error: "Only admins can manage accounts." });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));

  if (body.action === "create") {
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim().slice(0, 120);
    const newRole = body.role === "admin" ? "admin" : "staff";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: "That email doesn't look right." });
    if (password.length < 8) return reply(400, { error: "Password needs at least 8 characters." });

    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
    if (error) return reply(400, { error: /already/i.test(error.message) ? "An account with that email already exists." : error.message });
    const { error: e2 } = await admin.from("roles").insert({ user_id: data.user.id, email, name, role: newRole });
    if (e2) {
      await admin.auth.admin.deleteUser(data.user.id); // don't leave a sign-in with no role
      return reply(500, { error: "Couldn't save the role. Nothing was created." });
    }
    return reply(200, { user_id: data.user.id });
  }

  if (body.action === "delete") {
    const id = String(body.user_id ?? "");
    if (id === me.user.id) return reply(400, { error: "You can't delete your own account." });
    const { error } = await admin.auth.admin.deleteUser(id); // roles row goes with it (on delete cascade)
    if (error) return reply(400, { error: error.message });
    return reply(200, { ok: true });
  }

  return reply(400, { error: "Unknown action." });
});
