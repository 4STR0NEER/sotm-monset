// Runs after `vite build` (npm run build). Renders every public page to real HTML and writes the files
// crawlers look for: robots.txt, sitemap.xml, llms.txt, plus Cloudflare's _headers and _redirects.
//   dist/index.html, book.html, terms.html  pre-rendered pages (Cloudflare serves book.html at /book)
//   dist/treehouse.html, cabin-lodge.html, upper-room-chalet.html  one page per stay
//   dist/404.html                           real 404 page
//   dist/owner.html                         empty dashboard shell, never indexed
import { build } from "vite";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";

await build({ logLevel: "warn", build: { ssr: "src/entry-server.jsx", outDir: "dist-ssr", emptyOutDir: true } });
// Components read media queries while rendering; render as a desktop browser with motion on.
// The browser re-renders with real values as soon as the app loads.
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const { render, PAGES, NOT_FOUND, SITE, jsonLd, llmsTxt, stayAt } = await import(pathToFileURL("dist-ssr/entry-server.js").href);

const template = readFileSync("dist/index.html", "utf8");

// Each lazy page's own file (and the files it needs), preloaded in its HTML so it arrives with the main one.
const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
function preloads(src) {
  const seen = new Set();
  const walk = (key) => {
    const c = manifest[key];
    if (!c || c.isEntry || seen.has(c.file)) return;
    seen.add(c.file);
    (c.imports ?? []).forEach(walk);
  };
  walk(src);
  return [...seen].map((f) => `<link rel="modulepreload" href="/${f}" />`).join("\n    ");
}
const SOURCE = { "/book": "src/pages/Book.jsx", "/terms": "src/pages/Terms.jsx" };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page({ path, meta, body = "", index = true, ld = null, extraHead = "" }) {
  const url = SITE + (path === "/" ? "/" : path);
  const head = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Sermon on the Mount Retreat Resort" />`,
    `<meta property="og:locale" content="en_PH" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/og.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Sunrise over the mountains from the balcony at Sermon on the Mount, Balamban" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ld && `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
    extraHead,
  ].filter(Boolean).join("\n    ");
  return template
    .replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(meta.description)}" />`)
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${index ? "index, follow, max-image-preview:large" : "noindex"}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${index ? url : SITE + "/"}" />`)
    .replace("<!--head-->", head)
    .replace("<!--app-->", body);
}

// every page in seo.js PAGES: "/" → index.html, "/treehouse" → treehouse.html
const files = Object.fromEntries(Object.keys(PAGES).map((p) => [p, p === "/" ? "index.html" : p.slice(1) + ".html"]));
for (const [path, file] of Object.entries(files)) {
  const stay = stayAt(path);
  const lcp = path === "/" ? "/video/hero-fog.jpg" : stay?.postcards[0].src;
  writeFileSync(`dist/${file}`, page({
    path,
    meta: PAGES[path],
    body: await render(path),
    ld: jsonLd(path),
    extraHead: [lcp && `<link rel="preload" as="image" href="${lcp}" fetchpriority="high" />`, preloads(stay ? "src/pages/Stay.jsx" : SOURCE[path])].filter(Boolean).join("\n    "),
  }));
}
writeFileSync("dist/404.html", page({ path: "/404", meta: NOT_FOUND, body: await render("/404"), index: false }));
writeFileSync("dist/owner.html", page({ path: "/owner", meta: { title: "Dashboard · Sermon on the Mount", description: "" }, index: false }));

const today = new Date().toISOString().slice(0, 10);
writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.keys(files).map((p) => {
  const imgs = (stayAt(p)?.postcards ?? []).map((c) => `<image:image><image:loc>${SITE}${c.src}</image:loc></image:image>`).join("");
  return `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod>${imgs}</url>`;
}).join("\n")}
</urlset>
`);

// Everyone, AI assistants included (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), may read the site.
writeFileSync("dist/robots.txt", `User-agent: *
Allow: /
Disallow: /owner

Sitemap: ${SITE}/sitemap.xml
`);

writeFileSync("dist/llms.txt", llmsTxt());

// The dashboard subdomain serves these same files: keep it out of search results.
writeFileSync("dist/_headers", `https://dashboard.sotmretreatresort.com/*
  X-Robots-Tag: noindex, nofollow

/owner
  X-Robots-Tag: noindex, nofollow

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);

// Pages from the old site, so old links and search results land somewhere useful.
writeFileSync("dist/_redirects", `/packages /#packages 301
/packages/ /#packages 301
/faqs /#faq 301
/faqs/ /#faq 301
/faq /#faq 301
/rooms /#rooms 301
/accommodations /#rooms 301
/amenities /#amenities 301
/about /#story 301
/about-us /#story 301
/contact /#find-us 301
/contact-us /#find-us 301
/book-now /book 301
/booking /book 301
/reservations /book 301
/terms-and-conditions /terms 301
/lodge /cabin-lodge 301
/cabin /cabin-lodge 301
/chalet /upper-room-chalet 301
/upper-room /upper-room-chalet 301
/tree-house /treehouse 301
/policies /terms 301
`);

rmSync("dist-ssr", { recursive: true, force: true });
console.log("prerendered:", [...Object.values(files), "404.html", "owner.html", "sitemap.xml", "robots.txt", "llms.txt", "_headers", "_redirects"].join(", "));
