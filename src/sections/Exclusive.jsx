import Parallax from "@/components/ui/skiper-ui/skiper30";

const shots = [
  ["dsc04521-04", "Infinity pool and deck from above"],
  ["walkwayview", "Walkway along the house over the valley"],
  ["img-1384", "Clouds settling on the ridge"],
  ["kitchen-view-3", "Open kitchen beside the pool"],
  ["dogwithmt-mannungalbackground", "A dog on the deck with Mt. Manunggal behind"],
  ["pool-view-2", "Pool edge meeting the mountains"],
  ["dsc04521-01-1", "Long wooden tables in the kitchen"],
  ["wooddeck", "Guest on the deck railing"],
  ["viewfromkitchen", "Lounge looking out to the pool"],
  ["pathwaytokitchenandwooddeck", "Lit stairway to the kitchen at night"],
  ["coffeewithaviewonthewooddeck", "Coffee cup on the deck in the fog"],
  ["img-9789", "Long table set for an evening event"],
].map(([f, alt]) => ({ src: `/img/${f}.webp`, alt }));

// "Once booked, the entire property is yours": the line sits still in the middle while
// four columns of the actual property drift past at different depths.
export default function Exclusive() {
  return (
    <section aria-labelledby="exclusive-title" className="relative bg-night">
      <Parallax images={shots}>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
          <div className="sticky top-0 flex h-screen items-center justify-center px-6">
            <div className="rounded-[2rem] bg-night/55 px-8 py-10 text-center text-mist backdrop-blur-md md:px-14 md:py-14">
              <p className="stamp mb-5 text-xs text-lantern">Three private stays · from 2 to 40 guests</p>
              <h2 id="exclusive-title" className="max-w-[16ch] font-display text-[clamp(2.2rem,5vw,4.5rem)] font-light leading-[1.02]">
                Once booked, <em>your place</em> is yours alone.
              </h2>
              <p className="mx-auto mt-6 max-w-sm text-fog/75">
                A lodge with a pool and sauna, a chalet with a hot tub, a treehouse for two to five, and only one group at the resort each night. No walk-ins.
              </p>
            </div>
          </div>
        </div>
      </Parallax>
    </section>
  );
}
