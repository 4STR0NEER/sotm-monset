import { Link } from "@/lib/router";

// Phase 2 replaces this with the booking flow.
export default function Book() {
  return (
    <section className="grid min-h-screen place-items-center bg-pine-deep px-6 text-center text-mist">
      <div>
        <p className="stamp mb-4 text-xs text-lantern">Booking</p>
        <h1 className="font-display text-5xl font-light">The booking flow arrives in phase 2.</h1>
        <Link to="/" className="mt-8 inline-block underline">Back to the mountain</Link>
      </div>
    </section>
  );
}
