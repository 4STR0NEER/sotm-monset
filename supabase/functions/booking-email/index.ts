// Emails a new booking request: a confirmation to the guest, a copy to the owner.
// Called by the website right after it files a request: POST { id }.
//
// It never trusts the request body beyond the id: it reads the booking itself with the service
// role, and only sends once per booking (emailed_at) and only within 15 minutes of creation,
// so the endpoint can't be used to spam guests.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   from resend.com
//   RESEND_FROM      e.g. "Sermon on the Mount <bookings@sotmretreatresort.com>" (domain verified in Resend)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "npm:@supabase/supabase-js@2.119.0";

const OWNER = "sermononthemount.ph@gmail.com";
const SITE = Deno.env.get("SITE_URL") ?? "https://sotmretreatresort.com"; // optional secret: the live site's URL
const NAMES: Record<string, string> = {
  lodge: "Cabin Lodge", chalet: "Upper Room Chalet", dayuse: "Day use",
  birthday: "Birthday package", wedding: "Intimate wedding",
};
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const day = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-PH", { weekday: "short", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

function body(b: Record<string, any>, forOwner: boolean) {
  const stay = NAMES[b.package] ?? b.package;
  const dates = b.package === "dayuse" ? `${day(b.check_in)}, 1pm – 8pm` : `${day(b.check_in)} → ${day(b.check_out)}`;
  const rows: [string, string][] = [
    ["Reference", b.id],
    ["Stay", stay],
    ["Dates", dates],
    ["Guests", `${b.guests}${b.kids ? ` + ${b.kids} children 1–7` : ""}${b.pets ? ` · ${b.pets} pet(s)` : ""}${b.visitors ? ` · ${b.visitors} day visitor(s)` : ""}`],
    ...(b.total ? [["Total", peso(b.total)], ["Deposit to hold the dates (50%)", peso(b.deposit)]] as [string, string][] : [["Price", "We'll send your quote"]] as [string, string][]),
    ...(forOwner ? [["Guest", `${b.name} · ${b.phone} · ${b.email}`]] as [string, string][] : []),
    ...(b.notes ? [["Notes", b.notes]] as [string, string][] : []),
  ];
  const table = rows.map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6c7f63">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("");
  const intro = forOwner
    ? `<p>New booking request from <b>${esc(b.name)}</b>. Confirm it in the <a href="${SITE}/owner">owner dashboard</a>.</p>`
    : `<p>Hi ${esc(b.name.split(" ")[0])},</p><p>Thank you! We've received your booking request. It isn't confirmed yet: we'll reply with payment details, and your dates are secured once the 50% deposit is paid. Dates go first come, first served.</p>`;
  const next = forOwner ? "" : `
    <p><b>What happens next</b></p>
    <ol>
      <li>Pay the deposit with the details we send, and reply with a screenshot of your receipt.</li>
      <li>Send us your guest list before your stay, including any day visitors.</li>
      <li>Settle the balance a few days before you arrive. Check-in is 2pm, check-out 11am.</li>
    </ol>
    <p>Our <a href="${SITE}/terms">Terms &amp; Conditions</a> apply, including the cancellation policy. Just reply to this email with any questions.</p>
    <p>See you up the mountain,<br>Sermon on the Mount Retreat Resort</p>`;
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0d1712;max-width:560px">${intro}<table style="border-collapse:collapse;margin:16px 0">${table}</table>${next}</div>`;
}

async function send(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("RESEND_FROM"), to: [to], reply_to: OWNER, subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

  const { id } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || !/^SOTM-[A-Z0-9]{6}$/.test(id)) return json({ error: "bad id" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  // claim the booking first, so two calls can't both send
  const { data: b } = await db
    .from("bookings")
    .update({ emailed_at: new Date().toISOString() })
    .eq("id", id)
    .is("emailed_at", null)
    .gte("created_at", new Date(Date.now() - 15 * 60_000).toISOString())
    .select()
    .maybeSingle();
  if (!b) return json({ skipped: true });

  try {
    await send(b.email, `Booking request received · ${b.id}`, body(b, false));
    await send(OWNER, `New booking request · ${NAMES[b.package] ?? b.package} · ${b.check_in} · ${b.name}`, body(b, true));
    return json({ sent: true });
  } catch (e) {
    await db.from("bookings").update({ emailed_at: null }).eq("id", id); // let a retry try again
    console.error(e);
    return json({ error: "email failed" }, 502);
  }
});
