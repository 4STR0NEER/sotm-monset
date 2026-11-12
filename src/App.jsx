import { lazy, Suspense, useEffect } from "react";
import { usePath } from "@/lib/router";
import { initSmooth } from "@/lib/smooth";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Book from "@/pages/Book";
import Terms from "@/pages/Terms";

// split out so website visitors never download the dashboard
const Owner = lazy(() => import("@/pages/Owner"));
const isDashboardHost = location.hostname.startsWith("dashboard.");

const PAGES = { "/": Home, "/book": Book, "/terms": Terms };

export default function App() {
  const path = usePath();
  useEffect(initSmooth, []);
  // the owner dashboard is its own app shell: no website nav or footer.
  // dashboard.<domain> serves it at every path; /owner keeps working on the main site.
  if (isDashboardHost || path === "/owner") return <Suspense fallback={null}><Owner /></Suspense>;
  const Page = PAGES[path] ?? Home;
  return (
    <>
      <Nav />
      <main>
        <Page />
      </main>
      <Footer />
    </>
  );
}
