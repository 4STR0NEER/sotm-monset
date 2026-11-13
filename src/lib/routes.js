// Pages other than the home page load as their own small files, so the first visit downloads less.
// preload() fetches a page's file ahead: on link hover (router.jsx), and before the first render
// (main.jsx, entry-server.jsx) so the pre-rendered HTML is replaced by the same page, not a skeleton.
import { lazy } from "react";
import { STAYS } from "@/data/site";

const stay = () => import("@/pages/Stay");
const ROUTES = {
  "/book": () => import("@/pages/Book"),
  "/terms": () => import("@/pages/Terms"),
  ...Object.fromEntries(Object.values(STAYS).map((s) => ["/" + s.slug, stay])),
};

export const clean = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
export const isRoute = (path) => path in ROUTES;

const ready = {};
const lazies = {};

export function preload(path) {
  path = clean(path);
  if (!ROUTES[path] || ready[path]) return Promise.resolve();
  return ROUTES[path]().then((m) => void (ready[path] = m.default));
}

/** The page component for a lazy route: the loaded one if preloaded, else a lazy one (shows the skeleton).
 *  Once a lazy one is handed out it stays, so a later preload can't swap it and reset the page. */
export const pageFor = (path) => lazies[path] ?? ready[path] ?? (lazies[path] = lazy(ROUTES[path]));
