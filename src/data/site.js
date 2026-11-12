// Facts come from sotmretreatresort.com (crawled 2026-11-05) and the owner's own guest messages and
// signed Policies, Terms & Conditions (resources/, Nov 2026). Anything unconfirmed is marked SAMPLE.

export const RESORT = {
  name: "Sermon on the Mount Retreat Resort",
  short: "SOTM",
  address: "Cebu Transcentral Hwy, Balamban, Cebu",
  phone: "0919 079 9586",
  phoneHref: "tel:+639190799586",
  hours: "Monday to Sunday, 8am – 5pm",
  opened: 2020,
  altitude: 816, // metres above sea level (homepage)
  hectares: 1.2,
  kmFromCity: 35,
  driveFromCity: "1 hr 15 min",
  checkIn: "2pm",
  checkOut: "11am",
  facebook: "https://www.facebook.com/SermonMountRetreatResort",
  instagram: "https://www.instagram.com/sermononthemount.ph/",
  mapQuery: "Sermon on the Mount Retreat Resort, Balamban, Cebu",
};

export const STORY = {
  origin:
    "Inspired by the life-changing words of Jesus Christ, Sermon on the Mount was created as a sanctuary for peace, reflection, and connection.",
  opened:
    "Opened in 2020, during a time when the world sought refuge.",
  place:
    "Nestled in the mountains of Balamban, our 1.2-hectare retreat overlooks the historic Mt. Manunggal, the third-highest peak on the island.",
  design: "With a design uniquely crafted by the owner himself.",
  verse: { text: "Blessed are those who mourn, for they will be comforted.", ref: "Matthew 5:4" }, // painted on the room wall
};

// Three private stays, each to one group at a time. Lodge and Chalet guests can't use each other's
// pool, sauna or hot tub. Rate tiers: 10 and 15 guests at both, 24/30/40 at the Cabin Lodge only.
// The Treehouse has a flat rate instead (`rate`, for its minimum guests) plus EXTRA_HEAD per extra guest.
export const RATE_TIERS = [[10, 14500], [15, 19500], [24, 29000], [30, 35000], [40, 45000]];
export const EXTRA_HEAD = 1000; // per guest above a tier

export const STAYS = {
  lodge: {
    id: "lodge",
    name: "Cabin Lodge",
    blurb: "A rustic countryside lodge for big families and barkadas, with the ridge of Mt. Manunggal outside every window.",
    guests: [10, 40], // the owner quotes 10–35 but publishes a 40-guest rate
    specs: [
      ["Guests", "10 – 40"],
      ["Rooms", "2 rooms, 48 m² each"],
      ["Soak", "Pool and sauna"],
      ["Beds", "4 queen beds + 4 single bunks per room"],
      ["Bath", "2 toilets, 2 hot & cold showers"],
      ["Cooling", "Fans only. At 816 m, you won't need aircon"],
    ],
    postcards: [
      { name: "Canopy beds", src: "/img/dsc04801.webp", note: "Queen beds under driftwood canopies. Four in each room, two to a bed." },
      { name: "The Beatitude wall", src: "/img/mountainviewroombedzoomin-1.webp", note: "The wall over the bed reads: Blessed are those who mourn, for they will be comforted." },
      { name: "Bunks up top", src: "/img/mountainroomviewbunkbedview.webp", note: "Four single bunks up a hand-built ladder, looking out over the rail." },
      { name: "The pool", src: "/img/pool-view-3.webp", note: "A 3.5-foot pool at the valley's edge, with the sauna a few steps away." },
      { name: "Bath", src: "/img/mountainviewroombathroomsetup.webp", note: "Hot & cold showers. Shampoo, conditioner, body soap and a hair dryer waiting." },
      { name: "The arched door", src: "/img/mountainviewroomlivingroom.webp", note: "Two rooms, 48 m² each. Room for the whole barkada." },
      { name: "Bunks by the balcony", src: "/img/lodge-bedroom-view.webp", note: "Wake up to the valley through the balcony doors." },
      { name: "The vanity", src: "/img/lodge-vanity.webp", note: "A carved-wood mirror over the basin, and room to get ready together." },
    ],
  },
  chalet: {
    id: "chalet",
    name: "Upper Room Chalet",
    blurb: "A European, alpine–medieval chalet for smaller groups, with a hot tub looking straight out at the mountains.",
    guests: [10, 15],
    specs: [
      ["Guests", "10 – 15"],
      ["Soak", "6-seat round hot tub with jacuzzi"],
      ["Bath", "Hot & cold showers"],
      ["Cooling", "Fans only. At 816 m, you won't need aircon"],
    ],
    postcards: [
      { name: "The hot tub", src: "/img/chalet-hot-tub.webp", note: "A 6-seat round hot tub with jacuzzi, under stone walls and iron lanterns." },
      { name: "The great room", src: "/img/chalet-great-room.webp", note: "A vaulted timber hall with a long table, kitchen and glass to the peak." },
      { name: "After dark", src: "/img/chalet-great-room-night.webp", note: "The great room by lamplight, with the moon on the wall." },
      { name: "The loft", src: "/img/chalet-loft-lounge.webp", note: "A quiet lounge tucked under the A-frame roof." },
    ],
  },
  treehouse: {
    id: "treehouse",
    name: "Treehouse",
    blurb: "A small hideaway for two to five, with driftwood bunks and a balcony table looking straight across the valley.",
    guests: [2, 5],
    rate: 6000, // for 2 guests, + EXTRA_HEAD each up to 5 (owner, Nov 2026)
    // ponytail: which shared facilities (pool, sauna, kitchen) Treehouse guests may use is not confirmed yet
    specs: [
      ["Guests", "2 – 5"],
      ["Rate", "₱6,000 for 2, ₱1,000 per extra guest"],
      ["Beds", "Driftwood bunk beds"],
      ["View", "Balcony with a dining table over the valley"],
    ],
    postcards: [
      { name: "The balcony", src: "/img/treehouse-balcony.webp", note: "Breakfast for five, with the whole valley under string lights." },
      { name: "Driftwood bunks", src: "/img/treehouse-room.webp", note: "Hand-built bunks with linen curtains and the light coming in." },
      { name: "The room", src: "/img/treehouse-bunks.webp", note: "Small, warm and all yours." },
    ],
  },
};

/** Nightly price: the largest tier the group reaches (10 minimum), plus ₱1,000 per guest above it.
 *  Reproduces every published tier exactly (e.g. 15 → ₱19,500, 20 → ₱24,500, 24 → ₱29,000).
 *  A stay with a flat `rate` (the Treehouse) charges it for its minimum guests, plus ₱1,000 per extra. */
export function nightlyRate(stay, guests) {
  const s = STAYS[stay];
  if (s.rate) return s.rate + Math.max(0, Math.min(guests, s.guests[1]) - s.guests[0]) * EXTRA_HEAD;
  const tiers = RATE_TIERS.filter(([n]) => n <= STAYS[stay].guests[1]);
  const [n, p] = tiers.findLast(([t]) => t <= guests) ?? tiers[0];
  return p + Math.max(0, guests - n) * EXTRA_HEAD;
}

// Optional extras, booked ahead. per "group" = one flat price, per "each" = a count.
export const ADDONS = [
  { id: "bonfire", name: "Marshmallow bonfire night", price: 500, per: "group", note: "Marshmallows and long forks included" },
  { id: "reflection", name: "Mountain Reflection Session", price: 2000, per: "group", note: "1.5 hr guided, check-out morning 8:30–10am" },
  { id: "yoga", name: "Yoga wellness session", price: 2000, per: "group", note: "Bring your own mat" },
  { id: "lechon", name: "Balamban lechon", price: 10000, per: "group", note: "Whole lechon, delivery included" },
  { id: "massage", name: "Whole-body massage", price: 750, per: "each", unit: "hour", note: "Subject to masseuse availability" },
  { id: "towels", name: "Towels", price: 75, per: "each", unit: "towel", note: "Not provided, so rent or bring your own" },
];

export const KITCHEN = {
  provided: [
    "Pots, frying pans, wok and steamer",
    "Serving dishes, ladles, strainers, tongs",
    "Knives and chopping boards",
    "Charcoal BBQ grill",
    "Plates, cutlery, glasses and mugs",
    "Soy sauce, vinegar, salt and sugar",
    "5-burner stove, free LPG",
    "Rice cookers for 30 and for 10",
    "Microwave, kettle, refrigerator",
    "Water dispenser, free mineral water",
  ],
  bring: [
    "Cooking oil and rice",
    "Charcoal for the BBQ",
    "Garlic, onion, ginger, spices",
    "Ice",
    "Dishwashing soap",
    "Paper towels and napkins",
    "Foil and cling wrap",
    "Disposable plates and cups (optional)",
  ],
};

export const AMENITIES = [
  {
    id: "deck",
    title: "Coffee on the view deck",
    body: "A long wooden deck over the treetops, made for slow mornings and fog rolling in below you.",
    src: "/img/dsc04521-02.webp",
  },
  {
    id: "kitchen",
    title: "Cooking with a view",
    body:
      "An open, fully equipped kitchen overlooking Mt. Manunggal: charcoal BBQ, five-burner stove with free LPG, rice cookers for 30, and free mineral water. Bring your own food, with no corkage fee.",
    src: "/img/dsc04521-01.webp",
  },
  {
    id: "pool",
    title: "Pool & sauna at the Lodge",
    body:
      "A 3.5-foot pool at the valley's edge, then the sauna to warm back up. Up at the Chalet, a hot tub with jacuzzi does the same job.",
    src: "/img/pool-view-3.webp",
  },
  {
    id: "videoke",
    title: "Videoke nights",
    body: "Sing your hearts out. The karaoke sits right by the pool, so nobody misses the fun.",
    src: "/img/kitchen-view-2.webp",
  },
  {
    id: "trek",
    title: "Trails to the creek",
    body:
      "Trek through virgin forest trails to a hidden creek and waterfalls. Dogs are welcome on the trail.",
    src: "/img/dsc05023.webp",
  },
];

// Overnight rates from the owner (Nov 2026); the rest as published on /packages.
export const PACKAGES = [
  {
    id: "overnight",
    name: "Overnight, fully private",
    price: 14500,
    unit: "per night, for 10 guests",
    lines: [
      "Cabin Lodge or Upper Room Chalet, yours alone",
      "₱19,500 for 15 guests, at either",
      "Cabin Lodge: ₱29,000 for 24 · ₱35,000 for 30 · ₱45,000 for 40",
      "₱1,000 per extra guest",
      "Treehouse for 2 – 5: ₱6,000 for 2, then ₱1,000 per extra guest",
      "Check-in 2pm, check-out 11am",
    ],
    src: "/img/viewing-deck-twilight-view.webp",
  },
  {
    id: "dayuse",
    name: "Day use",
    price: 4500,
    unit: "weekday (Mon–Thu), 4 guests",
    weekend: { price: 10000, unit: "weekend (Fri–Sun), up to 12 guests" },
    lines: [
      "7 hours of exclusive use, 1pm – 8pm",
      "Swim, sauna, videoke, coffee on the view deck",
      "Free use of the kitchen",
      "₱500 per extra guest (max 40), children under 7 ₱250",
      "No bedroom access",
    ],
    src: "/img/pool-view.webp",
  },
  {
    id: "event",
    name: "Event function",
    price: 7000,
    unit: "venue use, added to an overnight stay",
    lines: [
      "For celebrations with invited guests, florists and balloon stylists",
      "Includes electricity for decor lights and sound systems",
      "₱500 per non-staying guest",
    ],
    src: "/img/img-7451.webp",
  },
  {
    id: "birthday",
    name: "Birthday package",
    price: null, // the site lists no price: on request
    unit: "price on request",
    lines: [
      "Food catering with tables and a waiter for 30 guests",
      "Lechon",
      "Venue for up to 30 guests",
      "One large room for one night",
      "Sound system, lights and mics",
    ],
    src: "/img/birthdaycelebrationonthewooddeck.webp",
  },
  {
    id: "wedding",
    name: "Intimate wedding",
    price: 90000,
    unit: "all-inclusive",
    lines: [
      "Food catering for 50 guests, with lechon",
      "Venue for 40–50 guests",
      "Two nights in one large room",
      "Sound system, 1 lapel mic, 2 wireless mics, 8 LED PAR lights",
      "Stylist and venue decoration not included",
    ],
    src: "/img/weddingbouquet.webp",
  },
];

// What a guest can pick on /book, in order.
export const BOOKABLE = {
  lodge: { name: "Cabin Lodge", short: "Cabin Lodge", from: "10–40 guests · from ₱14,500 a night", src: "/img/pool-view-3.webp" },
  chalet: { name: "Upper Room Chalet", short: "Upper Room Chalet", from: "10–15 guests · from ₱14,500 a night", src: "/img/chalet-hot-tub.webp" },
  treehouse: { name: "Treehouse", short: "Treehouse", from: "2–5 guests · from ₱6,000 a night", src: "/img/treehouse-balcony.webp" },
  dayuse: { name: "Day use", short: "Day use, 1pm – 8pm", from: "from ₱4,500", src: "/img/pool-view.webp" },
  birthday: { name: "Birthday package", short: "Birthday package", from: "price on request", src: "/img/birthdaycelebrationonthewooddeck.webp" },
  wedding: { name: "Intimate wedding", short: "Intimate wedding", from: "₱90,000 all-in", src: "/img/weddingbouquet.webp" },
};

export const REVIEWS = [
  { name: "Beth Lising", text: "Why go to Baguio? When we have a 1hr and 10min drive from the city, picture perfect foggy and cold weather just like Baguio!" },
  { name: "Pinky Ngosiok", text: "This place is a piece of heaven. Pools overlooking mountains, karaoke, 2 huge bedrooms, a banquet area, a fireplace." },
  { name: "Jiyanna Bonotan", text: "Sermon on the Mount Retreat Resort is such a wonderful place. Very accommodating staff." },
  { name: "Roel J. Tariman", text: "Great place for relaxation with your family! Karaoke and the small pool on the same area." },
  { name: "Mary Louise Ralloma", text: "My group of friends celebrated our Christmas party last weekend here." },
  { name: "Myles Ysalina", text: "We had our 3D-2N stay here with office staff." },
];

// Short answers only: the full rules live on /terms.
export const FAQ = [
  ["What are the check-in and check-out times?", "Check-in is 2pm, check-out 11am. Early check-in (from 8am) or late check-out (until 5pm) can be arranged for a fee, if the dates allow."],
  ["How do the stays work?", "There are three, each fully private to one group. The Cabin Lodge (10–40 guests) has the pool and sauna; the Upper Room Chalet (10–15) has the hot tub; the Treehouse is a hideaway for 2–5. Lodge and Chalet groups can't use each other's place."],
  ["How much is the Treehouse?", "₱6,000 a night for two, plus ₱1,000 per extra guest, up to five guests (₱9,000 for five)."],
  ["How do we reserve?", "Reservations only, first come, first served. A 50% deposit holds your date and the balance is due a few days before you arrive. Deposits aren't refunded, but you can rebook."],
  ["Is food included?", "No, we're self-catering: bring your own and cook in the full kitchen, with no corkage fee. You can also pre-order Balamban lechon (₱10,000, delivered), party trays or all-day breakfast (₱240)."],
  ["What should we pack?", "Towels (or rent ours at ₱75), toothbrushes, sweaters for the cold, and proper swimwear: no cotton, denim or wool in the pool or hot tub. Shampoo, conditioner, body soap and hair dryers are provided."],
  ["Is there signal or WiFi?", "There's no phone signal on the Transcentral Highway. Our vendo WiFi handles chats, video calls and YouTube: ₱10 per gadget for 7 hours."],
  ["Can friends visit us?", "Yes, if you tell us ahead. Visitors count as day users at ₱500 each, leave a valid ID at the gate, and head home by 8pm."],
  ["Are pets allowed?", "Cats and dogs in diapers are welcome. There's a cleaning fee of ₱700 for overnight stays and ₱500 for day users."],
  ["How are children counted?", "Children aged 1–7 who share a bed with their parents are not counted. Children 8 and above count as guests."],
  ["Is there aircon?", "Fans only. We're over 800 metres above sea level, so the air is cool all year."],
];

export const peso = (n) => "₱" + n.toLocaleString("en-PH");
