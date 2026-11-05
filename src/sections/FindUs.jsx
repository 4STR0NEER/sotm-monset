import { Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import TopoBackground from "@/components/kokonutui/topo-background";
import { RESORT } from "@/data/site";

// A living contour map (Kokonut UI) behind the directions: move the cursor to raise a hill.
export default function FindUs() {
  const map = `https://www.google.com/maps?q=${encodeURIComponent(RESORT.mapQuery)}&z=12&output=embed`;
  return (
    <section id="find-us" aria-labelledby="find-title">
      <TopoBackground className="bg-pine-deep py-28 text-[#3d6c53] md:py-36" seed={816} interval={0.06}>
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 text-mist sm:px-8 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <p className="stamp mb-5 text-xs text-lantern">Find us</p>
            <h2 id="find-title" data-split className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1]">
              One hour up from the city.
            </h2>
            <p className="reveal mt-6 max-w-md text-lg leading-relaxed text-fog/75">
              Take the Transcentral Highway out of Cebu City and keep climbing. About {RESORT.kmFromCity} km, and the air turns cool well before you arrive.
            </p>
            <ul data-stagger className="mt-10 space-y-4 text-fog/90">
              <li className="flex gap-3"><MapPin size={20} className="shrink-0 text-lantern" aria-hidden="true" />{RESORT.address}</li>
              <li className="flex gap-3"><Phone size={20} className="shrink-0 text-lantern" aria-hidden="true" /><a href={RESORT.phoneHref} className="underline decoration-mist/30 underline-offset-4 hover:decoration-mist">{RESORT.phone}</a></li>
              <li className="flex gap-3"><Clock size={20} className="shrink-0 text-lantern" aria-hidden="true" />Office hours: {RESORT.hours}. Reservations only.</li>
            </ul>
            <div className="mt-8 flex gap-3">
              {[["Facebook", RESORT.facebook], ["Instagram", RESORT.instagram]].map(([l, href]) => (
                <a key={l} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-mist/20 px-4 py-2 text-sm transition-colors hover:border-mist/60">
                  {l} <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="reveal overflow-hidden rounded-[2rem] border border-mist/10 bg-night/40 p-2 backdrop-blur-sm">
            <iframe
              title="Map to Sermon on the Mount Retreat Resort"
              src={map}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[24rem] w-full rounded-[1.6rem] [filter:grayscale(0.6)_contrast(1.05)] md:h-[30rem]"
            />
          </div>
        </div>
      </TopoBackground>
    </section>
  );
}
