import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger } from "animejs";
import { Mountain, Phone } from "lucide-react";
import BoardingPass from "@/components/kokonutui/boarding-pass";
import { Link } from "@/lib/router";
import { ONLINE_PAYMENTS, MANUAL_METHODS, depositCheckoutUrl } from "@/lib/payments";
import { BOOKABLE, RESORT, peso } from "@/data/site";

const CODE = { lodge: "LODGE", chalet: "CHALET", dayuse: "DAY", birthday: "BDAY", wedding: "WED" };

// Pays online when PayMongo is switched on (lib/payments.js); otherwise says how it's done today.
function PayDeposit({ booking }) {
  const [state, setState] = useState(null);
  if (!ONLINE_PAYMENTS) return <>The resort sends payment details for {MANUAL_METHODS.join(", ")}. Reply with a screenshot of your receipt.</>;
  const pay = async () => {
    setState("loading");
    try { location.href = await depositCheckoutUrl(booking); } catch (e) { setState(e.message); }
  };
  return (
    <>
      <button onClick={pay} disabled={state === "loading"} className="mt-2 block rounded-full bg-lantern px-5 py-2 text-sm font-semibold text-night transition-transform duration-150 active:scale-[0.97] disabled:opacity-60">
        {state === "loading" ? "Opening payment…" : `Pay ${peso(booking.deposit)} deposit`}
      </button>
      {state && state !== "loading" && <span role="alert" className="mt-2 block text-sm text-lantern">{state}</span>}
    </>
  );
}
const fmt = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// The booking comes back as a "mountain pass": Cebu City → SOTM, 816 m. It drops in, tilts and settles.
export default function Confirmation({ booking: b, onAgain }) {
  const root = useRef(null);
  const pkg = BOOKABLE[b.package];
  const nights = Math.round((Date.parse(b.checkOut) - Date.parse(b.checkIn)) / 864e5);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current;
    const tl = createTimeline({ defaults: { ease: "out(4)" } });
    tl.add(el.querySelector("[data-pass]"), { y: [-120, 0], rotate: [-6, 0], opacity: [0, 1], duration: 1000, ease: "out(3)" })
      .add(el.querySelectorAll("[data-in]"), { opacity: [0, 1], y: [14, 0], duration: 600, delay: stagger(80) }, 350);
    return () => tl.revert();
  }, []);

  return (
    <section ref={root} className="grain relative min-h-screen overflow-hidden bg-pine-deep px-4 pb-24 pt-32 text-mist sm:px-8">
      <img src="/img/img-1381.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_auto]">
        <div>
          <p data-in className="stamp mb-4 text-xs text-lantern">Request sent · {b.id}</p>
          <h1 data-in className="max-w-[14ch] font-display text-[clamp(2.6rem,6vw,5rem)] font-light leading-[0.98]">
            See you up the mountain, {b.name.split(" ")[0]}.
          </h1>
          <p data-in className="mt-8 max-w-md text-lg leading-relaxed text-fog/75">
            Your {pkg.name} {b.total ? "confirmation" : "quote"} and official receipts will be emailed to <b className="font-medium text-mist">{b.email}</b>. The resort may also call <b className="font-medium text-mist">{b.phone}</b> during office hours ({RESORT.hours}).
          </p>
          {b.total > 0 && (
            <ol data-in className="mt-8 max-w-md space-y-5 border-l border-mist/15 pl-6 text-fog/75">
              <li>
                <b className="block font-medium text-mist">Pay the {peso(b.deposit)} deposit to hold your dates</b>
                <span className="text-sm leading-relaxed"><PayDeposit booking={b} /> Dates go first come, first served.</span>
              </li>
              <li>
                <b className="block font-medium text-mist">Send your guest list before the stay</b>
                <span className="text-sm leading-relaxed">Include any day visitors, so the gate lets them in.</span>
              </li>
              <li>
                <b className="block font-medium text-mist">Settle the {peso(b.total - b.deposit)} balance a few days before</b>
                <span className="text-sm leading-relaxed">By GCash or bank transfer. Check-in is {RESORT.checkIn}.</span>
              </li>
            </ol>
          )}
          <div data-in className="mt-10 flex flex-wrap gap-3">
            <Link to="/" className="rounded-full bg-lantern px-7 py-3.5 font-semibold text-night transition-transform duration-150 active:scale-[0.97]">Back to the mountain</Link>
            <button onClick={onAgain} className="rounded-full border border-mist/25 px-7 py-3.5 font-semibold transition-colors hover:border-mist/60">Book another date</button>
            <a href={RESORT.phoneHref} className="inline-flex items-center gap-2 px-3 py-3.5 text-fog/70 hover:text-mist"><Phone size={16} /> {RESORT.phone}</a>
          </div>
        </div>

        <div data-pass className="justify-self-center">
          <BoardingPass
            className="w-[min(92vw,24rem)] max-w-none text-night"
            Icon={Mountain}
            passengerLabel="Lead guest"
            flight={{
              airline: "Sermon on the Mount",
              number: b.id,
              from: { code: "CEB", city: "Cebu City", time: fmt(b.checkIn) },
              to: { code: "SOTM", city: "Balamban · 816 m", time: b.package === "dayuse" ? "1pm – 8pm" : fmt(b.checkOut) },
              date: fmt(b.checkIn),
              pkg: CODE[b.package],
              nights: b.package === "dayuse" ? "Day" : String(nights),
              guests: String(b.guests + (b.kids | 0)),
              pets: String(b.pets | 0),
              fields: [["Stay", "pkg"], ["Nights", "nights"], ["Guests", "guests"], ["Pets", "pets"]],
              footnote: b.total ? `Total ${peso(b.total)} · deposit ${peso(b.deposit)}` : "Quote to follow by phone",
              passenger: b.name,
              status: "requested",
            }}
          />
        </div>
      </div>
    </section>
  );
}
