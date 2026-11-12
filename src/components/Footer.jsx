import { Link } from "@/lib/router";
import { RESORT } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-night px-4 pb-10 pt-16 text-fog/60 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="stamp text-[clamp(2.2rem,8.5vw,8rem)] font-bold leading-[0.9] tracking-[0.02em] text-mist/90">
          Sermon on the Mount
        </p>
        <div className="mt-12 grid gap-8 border-t border-mist/10 pt-8 text-sm sm:grid-cols-3">
          <div>
            <p className="text-mist/80">{RESORT.name}</p>
            <p>{RESORT.address}</p>
            <p><a href={RESORT.phoneHref} className="hover:text-mist">{RESORT.phone}</a> · {RESORT.hours}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            <Link to="/#rooms" className="hover:text-mist">Rooms</Link>
            <Link to="/#amenities" className="hover:text-mist">Amenities</Link>
            <Link to="/#packages" className="hover:text-mist">Packages</Link>
            <Link to="/#faq" className="hover:text-mist">FAQs</Link>
            <Link to="/book" className="hover:text-mist">Book</Link>
            <Link to="/terms" className="hover:text-mist">Terms &amp; Conditions</Link>
          </nav>
          <p className="text-xs leading-relaxed sm:text-right">
            Concept site by Monset. Photos © {RESORT.name}. Video: Mixkit.<br />
            Components: <a href="https://skiper-ui.com" rel="nofollow" className="underline hover:text-mist">Skiper UI</a>, <a href="https://kokonutui.com" rel="nofollow" className="underline hover:text-mist">Kokonut UI</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
