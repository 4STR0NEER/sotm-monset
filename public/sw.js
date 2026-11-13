// Dashboard service worker (registered from Owner.jsx): lets the installed app open without a connection.
// Only the dashboard is handled (dashboard. host, or /owner); the public website is left alone.
//   pages:          network first, last good copy when offline
//   /assets, icons: cache first (file names are content-hashed, so they never go stale)
// Supabase calls go to another origin and are never touched: data is always live.
// ponytail: old hashed assets pile up in the cache; bump CACHE to clear them if it ever matters.
const CACHE = "sotm-dashboard-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
);

const save = (req, res) => {
  if (res.ok) {
    const copy = res.clone(); // before the page reads the body
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
};

// Offline: this page as last seen, else any dashboard page we have (they all boot the same app).
const offline = async (req) =>
  (await caches.match(req, { ignoreSearch: true })) ?? (await caches.match("/owner")) ?? (await caches.match("/")) ?? Response.error();

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const dashboard = location.hostname.startsWith("dashboard.") || url.pathname === "/owner";

  if (req.mode === "navigate") {
    if (dashboard) e.respondWith(fetch(req).then((res) => save(req, res)).catch(() => offline(req)));
  } else if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => save(req, res))));
  }
});
