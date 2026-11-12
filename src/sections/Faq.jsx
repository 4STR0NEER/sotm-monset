import { Plus } from "lucide-react";
import { FAQ } from "@/data/site";
import { Link } from "@/lib/router";

// <details> keeps it keyboard and screen-reader friendly for free; the open/close animation is CSS (index.css).
export default function Faq() {
  return (
    <section id="faq" className="relative bg-mist px-4 py-28 sm:px-8 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_1.5fr]">
        <div>
          <p className="stamp mb-5 text-xs text-moss">Good to know</p>
          <h2 data-split className="font-display text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[1] text-pine-deep">
            Before you drive up.
          </h2>
          <img src="/img/deck-morning-guests.webp" alt="Guests relaxing on the view deck on a clear mountain morning" loading="lazy" className="reveal mt-10 hidden aspect-[3/4] w-56 rounded-3xl object-cover md:block" />
        </div>
        <div data-stagger className="border-t border-night/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="faq border-b border-night/10">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 text-lg font-medium text-night/90">
                {q}
                <Plus size={20} className="plus shrink-0 text-moss" aria-hidden="true" />
              </summary>
              <p className="pb-6 leading-relaxed text-night/65">{a}</p>
            </details>
          ))}
          <p className="pt-6 text-night/60">
            Deposits, cancellations and house rules in full:{" "}
            <Link to="/terms" className="font-medium text-pine underline decoration-pine/30 underline-offset-4 hover:decoration-pine">Terms & Conditions</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
