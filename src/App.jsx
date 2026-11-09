import { useEffect } from "react";
import { usePath } from "@/lib/router";
import { initSmooth } from "@/lib/smooth";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Book from "@/pages/Book";
import Owner from "@/pages/Owner";
import Terms from "@/pages/Terms";

const PAGES = { "/": Home, "/book": Book, "/terms": Terms };

export default function App() {
  const path = usePath();
  useEffect(initSmooth, []);
  // the owner dashboard is its own app shell: no website nav or footer
  if (path === "/owner") return <Owner />;
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
