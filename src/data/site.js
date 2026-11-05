// Every fact here comes from sotmretreatresort.com (crawled 2026-11-05).
// Anything not on their site is marked SAMPLE so it is easy to find and replace.

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
  driveFromCity: "about an hour",
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

export const ROOM = {
  name: "Mountain View Rooms",
  blurb:
    "Rustic mountain rooms for big families or barkadas, with the ridge of Mt. Manunggal outside every window.",
  specs: [
    ["Rooms", "2"],
    ["Size", "48 m² each"],
    ["Guests", "12 per room, up to 14 with extra charge"],
    ["Beds", "4 queen beds + 4 single bunks"],
    ["Bath", "2 toilets, 2 shower rooms"],
    ["Cooling", "Fans only. At 816 m, you won't need aircon"],
  ],
  // Postcards for the Rooms section: a room photo on the front, a note about it on the back.
  postcards: [
    { name: "Canopy beds", src: "/img/dsc04801.webp", note: "Queen beds under driftwood canopies. Four in each room, two to a bed." },
    { name: "The Beatitude wall", src: "/img/mountainviewroombedzoomin-1.webp", note: "The wall over the bed reads: Blessed are those who mourn, for they will be comforted." },
    { name: "Bunks up top", src: "/img/mountainroomviewbunkbedview.webp", note: "Four single bunks up a hand-built ladder, looking out over the rail." },
    { name: "Living room", src: "/img/mountainviewroomlivingroom-1.webp", note: "A red sofa and windows full of mountain. Fans only: it's cool at 816 m." },
    { name: "Bath", src: "/img/mountainviewroombathroomsetup.webp", note: "Two toilets, two hot & cold showers. Shampoo, soap & hair dryers waiting." },
    { name: "The arched door", src: "/img/mountainviewroomlivingroom.webp", note: "48 m² each, two rooms. 12 guests per room, 14 with extra beds." },
  ],
  photos: [
    { src: "/img/mountainviewroombeds-2.webp", alt: "Canopy queen beds and bunks under a stone column" },
    { src: "/img/mountainviewroomzoominbed.webp", alt: "Queen bed against a crimson wall painted with a Beatitude" },
    { src: "/img/mountainviewroomlivingroom.webp", alt: "Living room with a carved wooden door" },
    { src: "/img/mountainviewroomlivingroom-1.webp", alt: "Red sofa and bookshelves by the curtained windows" },
    { src: "/img/mountainviewroomladdertobunkbed.webp", alt: "Hand-built wooden ladder up to the bunk" },
    { src: "/img/dsc04801.webp", alt: "Four-poster beds with the mountains behind" },
    { src: "/img/mountainviewroomdoorentrance.webp", alt: "Room entrance with stone walls and hanging bulbs" },
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
      "An open, fully equipped kitchen overlooking Mt. Manunggal: charcoal BBQ, five-burner stove, rice cookers, oven toaster, kettle, refrigerator, and a water dispenser with mineral water. Bring your own food, with no corkage fee.",
    src: "/img/dsc04521-01.webp",
  },
  {
    id: "pool",
    title: "Cold plunge pool & sauna",
    body:
      "A 3.5-foot pool that is safe for kids and adults, with the valley right at its edge. Warm up again in the sauna.",
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

// Rates exactly as published on /packages. OVERNIGHT is the only SAMPLE price.
export const PACKAGES = [
  {
    id: "overnight",
    name: "Overnight, exclusive",
    sample: true,
    price: 28000, // SAMPLE: the site publishes no overnight rate
    unit: "per night, up to 24 guests",
    lines: [
      "The whole property is yours: both Mountain View Rooms, pool, sauna, kitchen and deck",
      "For groups of 12 or more",
      "Up to 30 guests with 3 extra beds per room",
      "Bonfire, trails and videoke included",
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

export const REVIEWS = [
  { name: "Beth Lising", text: "Why go to Baguio? When we have a 1hr and 10min drive from the city, picture perfect foggy and cold weather just like Baguio!" },
  { name: "Pinky Ngosiok", text: "This place is a piece of heaven. Pools overlooking mountains, karaoke, 2 huge bedrooms, a banquet area, a fireplace." },
  { name: "Jiyanna Bonotan", text: "Sermon on the Mount Retreat Resort is such a wonderful place. Very accommodating staff." },
  { name: "Roel J. Tariman", text: "Great place for relaxation with your family! Karaoke and the small pool on the same area." },
  { name: "Mary Louise Ralloma", text: "My group of friends celebrated our Christmas party last weekend here." },
  { name: "Myles Ysalina", text: "We had our 3D-2N stay here with office staff." },
];

export const FAQ = [
  ["Can we walk in?", "No. We are strictly by reservation only, so the whole mountain is ready for your group."],
  ["Are pets allowed?", "Yes, we're pet-friendly. There's a small extra fee: ₱700 for overnight stays and ₱500 for day users."],
  ["How are children counted?", "Children aged 1–7 who share a bed with their parents are not counted. Children 8 and above count as extra heads."],
  ["How many guests can stay?", "Both rooms fit 24 guests. Add 3 extra beds in each room and you can fit 30."],
  ["Is there aircon?", "Fans only. We're perched over 800 metres above sea level, so the air is cool all year."],
  ["Is there a restaurant?", "Not yet. Bring your own food with no corkage fee, or pre-order our menu in large foil trays."],
  ["Do you serve breakfast?", "All-day breakfast is pre-ordered at ₱240 per order, with coffee or orange-kalamansi juice: pancake & bacon, danggit, longganisa, corned beef, ham, tuna, Spam or hotdog with egg and rice."],
  ["What should we bring for the kitchen?", "Cooking oil, charcoal, dishwashing soap, rice, garlic, onion, ginger, spices, ice, paper towels, foil or cling wrap, and disposable plates and cups."],
  ["What toiletries are provided?", "Shampoo, conditioner, body soap, tissue, alcohol and hair dryers, with hot and cold showers in each room."],
];

export const peso = (n) => "₱" + n.toLocaleString("en-PH");
