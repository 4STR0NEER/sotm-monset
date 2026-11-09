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

// Email-safe HTML: tables and inline styles only, no web fonts or images (many inboxes block them),
// so the header is a typeset wordmark in the site's pine and lantern colours.
const C = { pine: "#163828", lantern: "#e9a650", mist: "#eef0e9", fog: "#dde3da", moss: "#6c7f63", night: "#0d1712" };
const serif = "Georgia,'Times New Roman',serif";
const sans = "Arial,Helvetica,sans-serif";

function body(b: Record<string, any>, forOwner: boolean) {
  const stay = NAMES[b.package] ?? b.package;
  const dates = b.package === "dayuse" ? `${day(b.check_in)}, 1pm – 8pm` : `${day(b.check_in)} → ${day(b.check_out)}`;
  const rows: [string, string][] = [
    ["Reference", b.id],
    ["Stay", stay],
    ["Dates", dates],
    ["Guests", `${b.guests}${b.kids ? ` + ${b.kids} children 1–7` : ""}${b.pets ? ` · ${b.pets} pet(s)` : ""}${b.visitors ? ` · ${b.visitors} day visitor(s)` : ""}`],
    ...(forOwner ? [["Guest", `${b.name}`], ["Phone", b.phone], ["Email", b.email]] as [string, string][] : []),
    ...(b.notes ? [["Notes", b.notes]] as [string, string][] : []),
  ];
  const table = rows.map(([k, v]) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${C.fog};font:13px ${sans};color:${C.moss};width:38%;vertical-align:top">${esc(k)}</td>
      <td style="padding:12px 0;border-bottom:1px solid ${C.fog};font:15px ${sans};color:${C.night};vertical-align:top">${esc(v)}</td>
    </tr>`).join("");
  const money = b.total
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:${C.mist};border-radius:12px">
        <tr><td style="padding:18px 20px;font:13px ${sans};color:${C.moss}">Total<br><span style="font:26px ${serif};color:${C.pine}">${peso(b.total)}</span></td>
            <td align="right" style="padding:18px 20px;font:13px ${sans};color:${C.moss}">Deposit to hold the dates (50%)<br><span style="font:bold 18px ${sans};color:${C.night}">${peso(b.deposit)}</span></td></tr>
      </table>`
    : `<p style="margin:20px 0 0;font:15px ${sans};color:${C.night}">We'll send your quote shortly.</p>`;

  const first = esc(String(b.name).split(" ")[0]);
  const heading = forOwner ? `New request from ${esc(b.name)}` : `Thank you, ${first}.`;
  const intro = forOwner
    ? `A guest has asked for ${esc(stay)}. Review and confirm it in the dashboard.`
    : `We've received your booking request. It isn't confirmed yet: we'll reply with payment details, and your dates are secured once the 50% deposit is paid. Dates go first come, first served.`;
  const button = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;margin-top:28px;padding:14px 28px;background:${C.lantern};border-radius:999px;font:bold 15px ${sans};color:${C.night};text-decoration:none">${label}</a>`;
  const next = forOwner ? button(`${SITE}/owner`, "Open the dashboard") : `
    <h2 style="margin:32px 0 8px;font:normal 20px ${serif};color:${C.pine}">What happens next</h2>
    <ol style="margin:0;padding-left:20px;font:15px/1.6 ${sans};color:${C.night}">
      <li style="margin-bottom:6px">Pay the deposit with the details we send, and reply with a screenshot of your receipt.</li>
      <li style="margin-bottom:6px">Send us your guest list before your stay, including any day visitors.</li>
      <li>Settle the balance a few days before you arrive. Check-in is 2pm, check-out 11am.</li>
    </ol>
    <p style="margin:20px 0 0;font:15px/1.6 ${sans};color:${C.night}">Our <a href="${SITE}/terms" style="color:${C.pine}">Terms &amp; Conditions</a> apply, including the cancellation policy. Just reply to this email with any questions.</p>
    <p style="margin:24px 0 0;font:italic 17px ${serif};color:${C.pine}">See you up the mountain.</p>`;
  const preheader = forOwner ? `${stay} · ${dates} · ${b.name}` : `Your ${stay} request ${b.id} is in. Here's what happens next.`;

  return `<!doctype html><html><body style="margin:0;padding:0;background:${C.mist}">
<div style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist}"><tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:${C.pine};padding:32px 36px">
      <div style="font:bold 11px ${sans};letter-spacing:3px;text-transform:uppercase;color:${C.lantern}">Balamban, Cebu · 816 m</div>
      <div style="margin-top:8px;font:normal 28px ${serif};color:${C.mist}">Sermon on the Mount</div>
      <div style="margin-top:2px;font:13px ${sans};color:${C.fog};opacity:.75">Retreat Resort</div>
    </td></tr>
    <tr><td style="padding:32px 36px 36px">
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fbefdc;font:bold 11px ${sans};letter-spacing:1px;text-transform:uppercase;color:#8a5a1c">${forOwner ? "Needs review" : "Request received"}</span>
      <h1 style="margin:16px 0 8px;font:normal 28px/1.2 ${serif};color:${C.pine}">${heading}</h1>
      <p style="margin:0 0 20px;font:15px/1.6 ${sans};color:${C.night}">${intro}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${table}</table>
      ${money}
      ${next}
    </td></tr>
  </table>
  <p style="margin:20px 0 0;font:12px/1.6 ${sans};color:${C.moss}">
    Sermon on the Mount Retreat Resort · Cebu Transcentral Hwy, Balamban, Cebu<br>
    <a href="tel:+639190799586" style="color:${C.moss}">0919 079 9586</a> · Office hours 8am – 5pm daily ·
    <a href="https://www.facebook.com/SermonMountRetreatResort" style="color:${C.moss}">Facebook</a>
  </p>
</td></tr></table>
</body></html>`;
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
