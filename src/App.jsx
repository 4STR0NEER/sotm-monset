import { useEffect } from "react";
import { usePath } from "@/lib/router";
import { initSmooth } from "@/lib/smooth";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Book from "@/pages/Book";

const PAGES = { "/": Home, "/book": Book };

export default function App() {
  const path = usePath();
  const Page = PAGES[path] ?? Home;
  useEffect(initSmooth, []);
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
