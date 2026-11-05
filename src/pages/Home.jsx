import { useCallback, useEffect, useState } from "react";
import { initScrollFx } from "@/lib/scroll-fx";
import Loader from "@/components/Loader";
import Altimeter from "@/components/Altimeter";
import Hero from "@/sections/Hero";
import Story from "@/sections/Story";
import Exclusive from "@/sections/Exclusive";
import Rooms from "@/sections/Rooms";
import Amenities from "@/sections/Amenities";
import Bonfire from "@/sections/Bonfire";
import Packages from "@/sections/Packages";
import Reviews from "@/sections/Reviews";
import Faq from "@/sections/Faq";
import FindUs from "@/sections/FindUs";
import Closing from "@/sections/Closing";

// The loader plays once per browser session, and only when you land on the home page.
let seen = false;
try { seen = sessionStorage.getItem("sotm-loader") === "1"; } catch {}

export default function Home() {
  const [ready, setReady] = useState(seen);
  const done = useCallback(() => {
    seen = true;
    try { sessionStorage.setItem("sotm-loader", "1"); } catch {}
    setReady(true);
  }, []);

  useEffect(initScrollFx, []);
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
  }, []);

  return (
    <>
      {!ready && <Loader onDone={done} />}
      <Altimeter />
      <Hero ready={ready} />
      <Story />
      <Exclusive />
      <Rooms />
      <Amenities />
      <Bonfire />
      <Packages />
      <Reviews />
      <Faq />
      <FindUs />
      <Closing />
    </>
  );
}
