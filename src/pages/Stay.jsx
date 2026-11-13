import { useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { initScrollFx } from "@/lib/scroll-fx";
import { Link, usePath } from "@/lib/router";
import { clean } from "@/lib/routes";
import { FAQ, RESORT, STAYS, nightlyRate, peso } from "@/data/site";

// One page per stay, at /<slug> (/treehouse, /cabin-lodge, /upper-room-chalet): what search engines and
// AI assistants land on for "treehouse Balamban" or "private resort with pool Cebu". Everything comes
// from STAYS in site.js, so the prices here are always the prices on /book.

const HEADLINE = {
  treehouse: "A treehouse, and the whole resort to yourselves.",
  lodge: "Room for the whole barkada, and a pool at the valley's edge.",
  chalet: "A hot tub with the mountains right in front of it.",
};

const INCLUDED = {
  treehouse: [
    "The whole resort for your group: no other guests that night",
    "Pool and sauna",
    "6-seat hot tub with jacuzzi",
    "Full kitchen with charcoal BBQ, free LPG and mineral water",
    "View deck, videoke and forest trails to the creek",
  ],
  lodge: [
    "Pool and sauna, for your group only",
    "Full kitchen with charcoal BBQ, free LPG and mineral water",
    "Videoke right by the pool",
    "View deck and forest trails to the creek",
    "Shampoo, conditioner, body soap and hair dryers",
  ],
  chalet: [
    "6-seat round hot tub with jacuzzi",
    "Vaulted great room with a long table and kitchen",
    "Loft lounge under the A-frame roof",
    "View deck and forest trails to the creek",
    "Shampoo, conditioner, body soap and hair dryers",
  ],
};

// Group sizes shown in the rate table
const COUNTS = { treehouse: [2, 3, 4, 5], lodge: [10, 15, 20, 24, 30, 35, 40], chalet: [10, 12, 15] };

// The general answers that matter before booking a stay
const ASK = ["What are the check-in and check-out times?", "How do we reserve?", "Is food included?", "What should we pack?", "How do we get there?"];

export default function Stay() {
  const path = clean(usePath());
  const stay = Object.values(STAYS).find((s) => "/" + s.slug === path);
  useEffect(initScrollFx, [path]);
  const others = Object.values(STAYS).filter((s) => s.id !== stay.id);
  const [cover, ...photos] = stay.postcards;
  const from = nightlyRate(stay.id, stay.guests[0]);
  const book = `/book?package=${stay.id}`;

  return (
    <>
      <header className="grain relative flex min-h-[78vh] items-end overflow-hidden bg-night text-mist">
        <img src={cover.src} alt={`${stay.name}: ${cover.note}`} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-night/50" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-8">
          <nav aria-label="Breadcrumb" className="stamp mb-6 flex gap-2 text-xs text-fog/60">
            <Link to="/" className="hover:text-mist">Home</Link> /
            <Link to="/#rooms" className="hover:text-mist">Stays</Link> /
            <span aria-current="page" className="text-lantern">{stay.name}</span>
          </nav>
          <h1 data-split className="font-display text-[clamp(3rem,8vw,7rem)] font-light leading-[0.95]">{stay.name}</h1>
          <p className="mt-5 max-w-xl text-xl leading-snug text-fog/85">{HEADLINE[stay.id]}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link to={book} className="rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
              Check dates for the {stay.name}
            </Link>
            <span className="text-fog/70">
              {stay.guests.join("–")} guests · from <b className="font-semibold text-mist">{peso(from)}</b> a night
            </span>
          </div>
        </div>
      </header>

      <section className="bg-mist px-4 py-24 sm:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="stamp mb-5 text-xs text-moss">The place</p>
            <p className="reveal font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-snug text-pine-deep">{stay.blurb}</p>
            <h2 className="stamp mb-4 mt-12 text-xs text-moss">Included</h2>
            <ul data-stagger className="space-y-3">
              {INCLUDED[stay.id].map((x) => (
                <li key={x} className="flex gap-3 text-night/80">
                  <Check size={18} className="mt-0.5 shrink-0 text-pine" aria-hidden="true" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <dl className="reveal self-start rounded-3xl bg-white p-6 shadow-[0_1px_0_rgb(0_0_0/0.04)] sm:p-8">
            {stay.specs.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-6 border-b border-night/10 py-3.5 last:border-0">
                <dt className="stamp text-xs text-night/45">{k}</dt>
                <dd className="text-right text-night/85">{v}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="stamp text-xs text-night/45">Check-in</dt>
              <dd className="text-right text-night/85">{RESORT.checkIn}, out by {RESORT.checkOut}</dd>
            </div>
          </dl>
        </div>
      </section>

      {photos.length > 0 && (
        <section aria-labelledby="photos" className="bg-mist px-4 pb-24 sm:px-8 md:pb-32">
          <div className="mx-auto max-w-7xl">
            <h2 id="photos" data-split className="mb-10 font-display text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-[1] text-pine-deep">
              Look around.
            </h2>
            <div data-stagger className="grid auto-rows-[15rem] grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[17rem] md:grid-cols-3">
              {photos.map((p, i) => (
                <figure key={p.src} className={`group relative overflow-hidden rounded-3xl bg-night ${i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                  <img src={p.src} alt={`${stay.name}: ${p.note}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-5 pt-14 text-mist">
                    <p className="font-display text-xl">{p.name}</p>
                    <p className="mt-1 text-sm text-fog/75">{p.note}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="rates" className="grain bg-pine-deep px-4 py-24 text-mist sm:px-8 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div>
            <p className="stamp mb-5 text-xs text-lantern">Rates</p>
            <h2 id="rates" data-split className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-[1]">
              One price for the whole group.
            </h2>
            <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-fog/75">
              Per night, for everyone in your booking. {stay.rate ? `${peso(stay.rate)} covers ${stay.guests[0]}` : "Each rate covers a group size"}, then ₱1,000 per extra guest. A 50% deposit holds your dates.
            </p>
            <Link to={book} className="mt-8 inline-flex items-center gap-2 rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 active:scale-[0.97]">
              See open dates <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <table className="reveal w-full text-left">
            <caption className="sr-only">{stay.name} nightly rates by group size</caption>
            <thead>
              <tr className="stamp text-xs text-fog/50">
                <th scope="col" className="pb-3 font-normal">Guests</th>
                <th scope="col" className="pb-3 text-right font-normal">Per night</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {COUNTS[stay.id].map((n) => (
                <tr key={n} className="border-t border-mist/10">
                  <td className="py-3.5 text-fog/85">{n} guests</td>
                  <td className="py-3.5 text-right font-display text-2xl">{peso(nightlyRate(stay.id, n))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="know" className="bg-mist px-4 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-4xl">
          <h2 id="know" data-split className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-[1] text-pine-deep">
            Good to know.
          </h2>
          <dl data-stagger className="mt-10 border-t border-night/10">
            {FAQ.filter(([q]) => ASK.includes(q)).map(([q, a]) => (
              <div key={q} className="grid gap-2 border-b border-night/10 py-6 md:grid-cols-[1fr_1.6fr] md:gap-10">
                <dt className="font-medium text-night/90">{q}</dt>
                <dd className="leading-relaxed text-night/65">{a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-night/60">
            More answers in the <Link to="/#faq" className="font-medium text-pine underline decoration-pine/30 underline-offset-4 hover:decoration-pine">FAQ</Link> and the{" "}
            <Link to="/terms" className="font-medium text-pine underline decoration-pine/30 underline-offset-4 hover:decoration-pine">Terms & Conditions</Link>.
          </p>
        </div>
      </section>

      <section aria-labelledby="others" className="bg-fog/50 px-4 py-24 sm:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 id="others" className="stamp mb-8 text-xs text-moss">The other stays</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((s) => (
              <Link key={s.id} to={"/" + s.slug} className="group relative flex h-72 items-end overflow-hidden rounded-3xl bg-night p-6 text-mist">
                <img src={s.postcards[0].src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/90 to-transparent" />
                <div className="relative flex w-full items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-3xl font-light">{s.name}</p>
                    <p className="mt-1 text-sm text-fog/75">{s.guests.join("–")} guests · from {peso(nightlyRate(s.id, s.guests[0]))} a night</p>
                  </div>
                  <ArrowRight size={22} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
