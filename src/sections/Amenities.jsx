import CardStack from "@/components/ui/skiper-ui/skiper16";
import { AMENITIES } from "@/data/site";

export default function Amenities() {
  return (
    <section id="amenities" className="relative bg-fog pb-[20vh] pt-28 md:pt-36">
      <div className="mx-auto mb-4 max-w-6xl px-4 sm:px-8">
        <p className="stamp mb-5 text-xs text-moss">What's up here</p>
        <h2 data-split className="max-w-[18ch] font-display text-[clamp(2.4rem,5.5vw,5rem)] font-light leading-[1] text-pine-deep">
          Everything you need, nothing you don't.
        </h2>
      </div>
      <CardStack items={AMENITIES} />
    </section>
  );
}
