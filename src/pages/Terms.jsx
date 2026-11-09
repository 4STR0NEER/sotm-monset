import { useEffect } from "react";
import { initScrollFx } from "@/lib/scroll-fx";
import { Link } from "@/lib/router";
import { RESORT } from "@/data/site";

// Transcribed from the resort's signed "Policies, Terms and Conditions" (resources/, 4 pages),
// tidied for grammar only, plus the pet, visitor and swimwear rules from the owner's guest messages.
// Read surface: summary first, then the full text. Owner should review before launch.

const SHORT = [
  "A 50% deposit holds your date. Dates go first come, first served.",
  "Settle the balance 2–3 days before your stay, by GCash or bank transfer.",
  "Deposits aren't refunded, but you can rebook up to 12 days out, for a charge.",
  "Check-in 2pm, check-out 11am. Quiet hours 10pm – 7am.",
  "Only registered guests stay the night. Visitors pay ₱500 and leave by 8pm.",
  "The person who books agrees to these terms for the whole group.",
];

const CANCEL = [
  ["12 – 30 days before", "20% of the booked rate is kept from your deposit", "Yes"],
  ["6 – 11 days before", "35% of the booked rate is kept from your deposit", "Yes"],
  ["1 – 5 days before", "The full deposit is kept", "No"],
  ["No-show or shortened stay", "No refund", "No"],
];

const SECTIONS = [
  {
    id: "bookings",
    title: "Confirmed bookings",
    body: [
      "When you pay the 50% deposit and make your reservation, online or by phone, you are deemed to have read, understood and accepted these Booking Conditions and Policies.",
      "The contact person on the reservation agrees, on behalf of everyone on it, that they:",
      ["have read these conditions and have the authority to agree to them, and do;", "are over 18, and that every member of the party is of the right age for any age-restricted services ordered;", "accept financial responsibility for paying the reservation for everyone on it;", "will share these Policies, Terms and Conditions with everyone booked."],
      "The balance should be settled cashless 2–3 days before your stay, through GCash or online bank transfer. Ask for our payment details when you send your updated headcount and any pre-ordered food.",
      "Additional services such as the bonfire night and the vendo WiFi are paid directly to the resort before you check out.",
    ],
  },
  {
    id: "arrival",
    title: "Arrival and departure",
    body: [
      "Check-in is at 2:00pm. Check-out is at 11:00am.",
      "Early check-in (8:00am – 1:00pm) or late check-out (11:00am – 5:00pm) can be arranged for an additional fee, subject to availability.",
      "Before your stay, send us the list of your official guests, including any day visitors you expect, so we can prepare and let them in.",
    ],
  },
  {
    id: "behaviour",
    title: "Guest behaviour and rules",
    body: [
      ["No smoking in the rooms, kitchen, dining area or on the wood deck. It damages our wooden interiors, and dry wood, grass and leaves are a fire hazard.", "Please respect the peace and quiet of the resort and its surroundings. Ask us if you have questions or need help during your stay."],
      "Drunken behaviour, such as shouting, angry or violent behaviour, breaking resort property (glasses, plates, microphones and the like), turning over tables or chairs, banging on glass doors and windows, or vomiting on furniture and beds, is subject to cleaning and damage charges. Such misconduct may also end the stay of the person involved: the resort may end your stay, or that of anyone in your party, at any time. So please drink moderately.",
      ["No hazing, prostitution, illegal substances or firearms inside the resort.", "Tents are not allowed unless management permits them.", "Please report any damage during your stay.", "Please keep to the check-out time, so housekeeping can prepare the place for the next group.", "Quiet hours run from 10:00pm to 7:00am. No loud music on Bluetooth speakers during this time.", "If management judges your behaviour disruptive, or causing distress, injury, harassment or danger to staff, management or anyone else, your stay may be ended and we will not be responsible for any costs or claims incurred."],
    ],
  },
  {
    id: "safety",
    title: "Physical safety",
    body: [[
      "Mind your personal safety at all times: stairs, and floors made wet by fog, rain or the pool. Don't run; watch your step.",
      "Take care around railings, steps and ledges. Use the amenities at your own risk, and drink moderately for your own safety.",
      "Parents and guardians must accompany their children. People with disabilities and senior citizens should have companions with them at all times.",
      "The resort is not liable for accidents or injuries to guests. You use all facilities, amenities and spaces at your own risk, without holding the resort liable or entitled to compensation for injury, death, damage, sickness, or unusual or unforeseeable circumstances beyond our control whose consequences could not have been avoided even with all due care, or that arise from your travel or stay.",
    ]],
  },
  {
    id: "visitors",
    title: "Visitors, functions and pets",
    body: [
      ["Functions and events need to be arranged with the resort. Birthday and anniversary celebrations are welcome, as long as they are not big events with stylists and organisers bringing in light and sound set-ups, or unannounced guests.", "Weddings, debuts and christenings have their own packages and charges, and can be arranged."],
      "For safety and security, only guests registered with the resort may stay overnight or use the rented spaces. Visitors must be arranged ahead. They are registered as day users at ₱500 each, leave one valid ID with staff on entry (returned when they leave), and may stay until 8:00pm.",
      "Cats and dogs wearing diapers are welcome, with a cleaning fee of ₱700 for overnight stays and ₱500 for day users. Pet odour and hair cling to rugs, curtains and the pool filter, and need extra cleaning before the next group.",
    ],
  },
  {
    id: "belongings",
    title: "Personal belongings",
    body: ["Please mind your belongings. A safety deposit box in your room keeps valuables secure; ask us how to set the code. The resort is not liable for loss caused by a guest's negligence."],
  },
  {
    id: "pool",
    title: "Pool, hot tub and sauna",
    body: [
      ["Wear proper swimwear. Cotton, denim (maong) and wool are not allowed in the pool or hot tub.", "Take a hot shower before you swim.", "No jumping or diving.", "No food or eating in the pool.", "Infants and children who aren't potty trained must wear approved swim diapers.", "The pool is for official guests only.", "Don't swim with open wounds or cuts, or with a skin condition."],
      "Sauna: not for pregnant guests, people with blood-pressure problems, anyone who has been drinking, or people with skin conditions. Children must be assisted by an adult to avoid burns and other accidents.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation and rebooking",
    body: [
      "We are a small resort with only one group per accommodation per day, so we rely on the reservations you make. Once you reserve a date it is considered sold and we turn other guests away. Late cancellations and no-shows really affect us.",
      "Cancellations are not refunded, but you may rebook for a charge, depending on how far ahead you tell us (see the table above). The same applies to day use bookings.",
      "Rebooking depends on availability. The rate at the time of rebooking applies and any difference is collected. You must rebook within 6 months of telling us about the cancellation; after that, rebooking can't be accepted.",
      "No-shows and shortened stays get no refund and no rebooking.",
    ],
  },
  {
    id: "force-majeure",
    title: "Force majeure and exceptions",
    body: [
      "The resort is not liable for cancelled bookings or shortened stays caused by force majeure, acts of God or conditions beyond our control, including floods, typhoons, extreme weather, earthquakes, civil disturbance, fire, war and epidemics or pandemics. Nor are we liable for cancellations due to sudden illness or unforeseen family or work events, but we understand these happen, and will reschedule your date under the rebooking policy above.",
      "The one exception: if Central Visayas declares a state of calamity or emergency, we refund your payment less 25% of the nightly or day use rate, or reschedule your booking within 6 months with no penalty. We need a request letter and an ID of the person who booked.",
      "During such an exception, the resort is not liable for failing to carry out arrangements and must be given reasonable extra time to do so.",
    ],
  },
];

function Body({ items }) {
  return items.map((x, i) =>
    Array.isArray(x) ? (
      <ul key={i} className="list-disc space-y-2 pl-5 marker:text-moss">
        {x.map((li) => <li key={li}>{li}</li>)}
      </ul>
    ) : (
      <p key={i}>{x}</p>
    )
  );
}

export default function Terms() {
  useEffect(initScrollFx, []);
  return (
    <>
      <header className="grain bg-pine-deep px-4 pb-14 pt-36 text-mist sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.25rem)] font-light leading-[1]">Terms & Conditions</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-fog/75">
            The policies that come with every booking at {RESORT.name}. The short version first, then the full text.
          </p>
        </div>
      </header>

      <div className="bg-mist px-4 pb-28 pt-14 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-[13rem_1fr]">
          <nav aria-label="Sections" className="hidden lg:block">
            <ol className="sticky top-28 space-y-2.5 text-sm text-night/55">
              <li><a href="#short" className="hover:text-pine">The short version</a></li>
              {SECTIONS.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="hover:text-pine">{s.title}</a></li>
              ))}
            </ol>
          </nav>

          <article className="max-w-[68ch] text-night/75">
            <section id="short" className="scroll-mt-28 rounded-[2rem] bg-white/70 p-7 sm:p-9">
              <h2 className="font-display text-3xl font-light text-pine-deep">The short version</h2>
              <ul className="mt-5 space-y-3 leading-relaxed">
                {SHORT.map((t) => (
                  <li key={t} className="flex gap-3"><span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-lantern" />{t}</li>
                ))}
              </ul>

              <h3 className="mt-9 font-medium text-night/90">If you need to cancel</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left text-sm">
                  <thead className="text-night/50">
                    <tr className="border-b border-night/10">
                      <th scope="col" className="py-2.5 pr-4 font-medium">When you tell us</th>
                      <th scope="col" className="py-2.5 pr-4 font-medium">What happens to the deposit</th>
                      <th scope="col" className="py-2.5 font-medium">Rebook?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CANCEL.map(([when, what, rebook]) => (
                      <tr key={when} className="border-b border-night/10 last:border-0">
                        <th scope="row" className="py-3 pr-4 font-medium text-night/85">{when}</th>
                        <td className="py-3 pr-4">{what}</td>
                        <td className="py-3">{rebook}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {SECTIONS.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-night/10 py-10 last:border-0">
                <h2 className="font-display text-2xl text-pine-deep">{i + 1}. {s.title}</h2>
                <div className="mt-4 space-y-4 leading-relaxed"><Body items={s.body} /></div>
              </section>
            ))}

            <p className="mt-6 text-sm text-night/50">
              Signed by Ms. Chona A. Anciano, Management. Questions? Call <a href={RESORT.phoneHref} className="underline underline-offset-4">{RESORT.phone}</a> or{" "}
              <Link to="/book" className="underline underline-offset-4">start a booking</Link>.
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
