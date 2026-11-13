// What search engines and AI assistants read: per-page titles and descriptions, and schema.org JSON-LD.
// Built from site.js so prices and facts never drift from what the page shows.
// Used at build time (scripts/prerender.mjs) and by the app when the page changes (App.jsx).
import { RESORT, STAYS, PACKAGES, FAQ, ADDONS, nightlyRate, peso } from "./site.js";

export const SITE = "https://sotmretreatresort.com";

export const PAGES = {
  "/": {
    title: "Sermon on the Mount · Private Mountain Resort in Balamban, Cebu",
    description:
      "Private mountain resort 816 m up in Balamban, Cebu, 1 hr 15 min from Cebu City. Treehouse, Cabin Lodge and Upper Room Chalet, with pool, sauna and hot tub.",
  },
  "/book": {
    title: "Book Your Stay · Rates & Open Dates · Sermon on the Mount",
    description:
      "Live open dates and prices: day use from ₱4,500, Treehouse from ₱6,000, Cabin Lodge and Upper Room Chalet from ₱14,500 a night. Balamban, Cebu.",
  },
  "/terms": {
    title: "Terms, Deposits & House Rules · Sermon on the Mount Resort",
    description:
      "Deposits, cancellations, rebooking, pets, visitors and house rules for Sermon on the Mount Retreat Resort in Balamban, Cebu.",
  },
};
// One page per stay (pages/Stay.jsx), at /<slug>
const STAY_META = {
  treehouse: {
    title: "Treehouse Stay in Balamban, Cebu · Sermon on the Mount",
    description: "A treehouse for 2–5 that books the whole private resort: pool, sauna, hot tub and kitchen. ₱6,000 a night for two, 816 m up in Balamban, Cebu.",
  },
  lodge: {
    title: "Cabin Lodge for 10–40 in Balamban, Cebu · Sermon on the Mount",
    description: "A private countryside lodge for 10–40 with its own pool, sauna and kitchen, facing Mt. Manunggal. From ₱14,500 a night, 1 hr 15 min from Cebu City.",
  },
  chalet: {
    title: "Upper Room Chalet with Hot Tub, Balamban · Sermon on the Mount",
    description: "An alpine-style private chalet for 10–15 with a 6-seat hot tub facing the mountains. From ₱14,500 a night in Balamban, Cebu, 816 m above sea level.",
  },
};
for (const s of Object.values(STAYS)) PAGES["/" + s.slug] = STAY_META[s.id];
export const stayAt = (path) => Object.values(STAYS).find((s) => "/" + s.slug === path);

export const NOT_FOUND = { title: "Page not found · Sermon on the Mount", description: PAGES["/"].description };

const ID = `${SITE}/#resort`;

const resort = () => ({
  "@type": "Resort",
  "@id": ID,
  name: RESORT.name,
  alternateName: ["SOTM Retreat Resort", "Sermon on the Mount Resort Balamban"],
  url: `${SITE}/`,
  logo: `${SITE}/logo.png`,
  image: [`${SITE}/og.jpg`, `${SITE}/img/pool-view-3.webp`, `${SITE}/img/chalet-hot-tub.webp`, `${SITE}/img/treehouse-balcony.webp`],
  description: PAGES["/"].description,
  telephone: "+63 919 079 9586",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Cebu Transcentral Highway",
    addressLocality: "Balamban",
    addressRegion: "Cebu",
    addressCountry: "PH",
  },
  hasMap: `https://www.google.com/maps?q=${encodeURIComponent(RESORT.mapQuery)}`,
  sameAs: [RESORT.facebook, RESORT.instagram],
  priceRange: "₱4,500 – ₱90,000",
  currenciesAccepted: "PHP",
  checkinTime: "14:00",
  checkoutTime: "11:00",
  petsAllowed: true,
  foundingDate: String(RESORT.opened),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "17:00",
  },
  amenityFeature: [
    "Swimming pool", "Sauna", "Hot tub with jacuzzi", "Fully equipped kitchen", "Charcoal BBQ grill",
    "Videoke", "View deck", "Forest trails to a creek and waterfalls", "Free parking", "Pet friendly", "Vendo WiFi",
  ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  containsPlace: Object.values(STAYS).map((s) => ({
    "@type": "Accommodation",
    "@id": `${SITE}/#${s.id}`,
    url: `${SITE}/${s.slug}`,
    name: s.name,
    description: s.blurb,
    occupancy: { "@type": "QuantitativeValue", minValue: s.guests[0], maxValue: s.guests[1] },
    image: s.postcards.map((p) => SITE + p.src),
  })),
  makesOffer: [
    ...Object.values(STAYS).map((s) => ({
      "@type": "Offer",
      name: `${s.name}, one night for ${s.guests[0]} guests`,
      price: nightlyRate(s.id, s.guests[0]),
      priceCurrency: "PHP",
      itemOffered: { "@id": `${SITE}/#${s.id}` },
      url: `${SITE}/book?package=${s.id}`,
    })),
    ...PACKAGES.filter((p) => p.price && p.id !== "overnight").map((p) => ({
      "@type": "Offer",
      name: `${p.name} (${p.unit})`,
      price: p.price,
      priceCurrency: "PHP",
      url: `${SITE}/book${p.id === "event" ? "" : `?package=${p.id}`}`,
    })),
  ],
});

const website = () => ({
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: `${SITE}/`,
  name: RESORT.name,
  publisher: { "@id": ID },
  inLanguage: "en-PH",
});

const faqPage = () => ({
  "@type": "FAQPage",
  "@id": `${SITE}/#faq`,
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export function jsonLd(path) {
  const graph = [resort(), website()];
  if (path === "/") graph.push(faqPage());
  const stay = stayAt(path);
  if (stay)
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Stays", item: `${SITE}/#rooms` },
        { "@type": "ListItem", position: 3, name: stay.name, item: `${SITE}${path}` },
      ],
    });
  return { "@context": "https://schema.org", "@graph": graph };
}

// /llms.txt: a plain-text brief for AI assistants (llmstxt.org), from the same facts as the page.
export function llmsTxt() {
  const stays = Object.values(STAYS).map((s) => {
    const from = peso(nightlyRate(s.id, s.guests[0]));
    return `- ${s.name}: ${s.guests[0]}–${s.guests[1]} guests, from ${from} a night for ${s.guests[0]}. ${s.blurb}`;
  });
  const pkgs = PACKAGES.map((p) => `- ${p.name}: ${p.price ? peso(p.price) : "price on request"} (${p.unit}). ${p.lines.join("; ")}.`);
  const extras = ADDONS.map((a) => `- ${a.name}: ${peso(a.price)} per ${a.per === "group" ? "group" : a.unit}. ${a.note}.`);
  return `# ${RESORT.name}

> A private mountain retreat resort ${RESORT.altitude} m above sea level on the Cebu Transcentral Highway in Balamban, Cebu, Philippines, overlooking Mt. Manunggal. About ${RESORT.kmFromCity} km (${RESORT.driveFromCity}) from Cebu City. Each stay is booked by one group at a time. Reservations only, no walk-ins. Open since ${RESORT.opened}.

## Stays (per night)
${stays.join("\n")}
- Extra guests: ₱1,000 each above a rate tier. Check-in ${RESORT.checkIn}, check-out ${RESORT.checkOut}.

## Packages
${pkgs.join("\n")}

## Extras
${extras.join("\n")}

## Good to know
${FAQ.map(([q, a]) => `- ${q} ${a}`).join("\n")}

## Contact
- Phone: ${RESORT.phone} (${RESORT.hours})
- Address: ${RESORT.address}, Philippines
- Facebook: ${RESORT.facebook}
- Instagram: ${RESORT.instagram}

## Pages
- [Home](${SITE}/): the resort, stays, amenities, packages, reviews, FAQ and directions
${Object.values(STAYS).map((s) => `- [${s.name}](${SITE}/${s.slug}): photos, rates for every group size, what's included`).join("\n")}
- [Book](${SITE}/book): live availability and prices for every stay and package
- [Terms & Conditions](${SITE}/terms): deposits, cancellations, rebooking and house rules
`;
}
