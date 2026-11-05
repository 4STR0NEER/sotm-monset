import TrailMap from "@/components/TrailMap";
import { AMENITIES } from "@/data/site";

export default function Amenities() {
  return (
    <section id="amenities" className="relative overflow-hidden bg-fog px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto mb-10 grid max-w-7xl gap-6 md:mb-4 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="stamp mb-5 text-xs text-moss">What's up here</p>
          <h2 data-split className="max-w-[16ch] font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1] text-pine-deep">
            A walk around the property.
          </h2>
        </div>
        <p className="reveal max-w-sm text-night/60">
          <span className="[@media(pointer:coarse)]:hidden">Hover a photo to stop there.</span>
          <span className="[@media(pointer:fine)]:hidden">Tap a photo to stop there.</span> The trail lights the way from the gate, past the deck and the pool, down to the creek.
        </p>
      </div>
      <TrailMap stops={AMENITIES} />
    </section>
  );
}
