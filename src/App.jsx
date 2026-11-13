import { lazy, Suspense, useEffect } from "react";
import { Link, usePath } from "@/lib/router";
import { initSmooth } from "@/lib/smooth";
import { NOT_FOUND, PAGES as META, SITE } from "@/data/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import { DashboardSkeleton, PageSkeleton } from "@/components/Skeleton";
import { clean, isRoute, pageFor } from "@/lib/routes";

// split out so website visitors never download the dashboard
const Owner = lazy(() => import("@/pages/Owner"));
const isDashboardHost = typeof location !== "undefined" && location.hostname.startsWith("dashboard.");

function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center bg-mist px-4 pt-24 text-center">
      <div>
        <p className="stamp mb-5 text-xs text-moss">404</p>
        <h1 className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1] text-pine-deep">This trail doesn't lead anywhere.</h1>
        <p className="mt-6 text-night/60">
          Head back <Link to="/" className="font-medium text-pine underline underline-offset-4">home</Link> or{" "}
          <Link to="/book" className="font-medium text-pine underline underline-offset-4">book your stay</Link>.
        </p>
      </div>
    </section>
  );
}

// Keeps the tab title, description, canonical and robots in step with the page after in-app navigation.
// The first load already has them in the HTML (scripts/prerender.mjs).
function useHead(path, known) {
  useEffect(() => {
    const m = META[path] ?? NOT_FOUND;
    document.title = m.title;
    const set = (sel, attr, value) => document.head.querySelector(sel)?.setAttribute(attr, value);
    set('meta[name="description"]', "content", m.description);
    set('link[rel="canonical"]', "href", SITE + (known ? path : "/"));
    set('meta[name="robots"]', "content", known ? "index, follow, max-image-preview:large" : "noindex");
  }, [path, known]);
}

export default function App() {
  const path = clean(usePath());
  const dashboard = isDashboardHost || path === "/owner";
  useEffect(initSmooth, []);
  const known = path === "/" || isRoute(path);
  useHead(path, !dashboard && known);
  // the owner dashboard is its own app shell: no website nav or footer.
  // dashboard.<domain> serves it at every path; /owner keeps working on the main site.
  if (dashboard) return <Suspense fallback={<DashboardSkeleton />}><Owner /></Suspense>;
  // the home page ships in the main file; every other page is its own (lib/routes.js)
  const Page = path === "/" ? Home : known ? pageFor(path) : NotFound;
  return (
    <>
      <Nav />
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Page />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
