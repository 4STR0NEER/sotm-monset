// Placeholders shown while a page's file or the dashboard's data is on its way.
// Shapes follow the real layouts so nothing jumps when the content lands. Pulse only with motion allowed.
const bar = "rounded-full motion-safe:animate-pulse";

/** A website page: the dark photo header every page opens with, then text and cards. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="flex h-[52vh] min-h-[380px] items-end bg-night px-4 pb-12 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className={`${bar} mb-5 h-3 w-48 bg-mist/10`} />
          <div className={`${bar} h-14 w-[min(32rem,80%)] bg-mist/10`} />
        </div>
      </div>
      <div className="bg-mist px-4 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className={`${bar} h-6 w-56 bg-night/10`} />
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[6.5rem] rounded-3xl bg-night/[0.06] motion-safe:animate-pulse" />
              ))}
            </div>
            <div className={`${bar} h-4 w-full bg-night/10`} />
            <div className={`${bar} h-4 w-4/5 bg-night/10`} />
          </div>
          <div className="h-80 rounded-3xl bg-night/[0.06] motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/** The dashboard shell: sidebar, heading, and a few booking rows. */
export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the dashboard" className="min-h-screen bg-fog/60 lg:grid lg:grid-cols-[15rem_1fr]">
      <div className="flex h-14 items-center gap-3 bg-pine-deep px-4 lg:h-screen lg:flex-col lg:items-stretch lg:px-5 lg:py-7">
        <div className={`${bar} h-8 w-28 bg-mist/10`} />
        <div className="hidden space-y-2 lg:mt-10 lg:block">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-10 rounded-xl bg-mist/[0.06] motion-safe:animate-pulse" />)}
        </div>
      </div>
      <div className="px-4 pt-6 sm:px-8 lg:pt-10">
        <div className={`${bar} h-3 w-40 bg-night/10`} />
        <div className={`${bar} mt-3 h-10 w-56 bg-night/10`} />
        <RowsSkeleton />
      </div>
    </div>
  );
}

/** Booking rows, while the bookings load. */
export function RowsSkeleton({ rows = 6 }) {
  return (
    <div aria-busy="true" aria-label="Loading bookings" className="mt-8 space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/70 p-4">
          <div className="size-10 shrink-0 rounded-full bg-night/[0.07] motion-safe:animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className={`${bar} h-3.5 w-1/3 bg-night/10`} />
            <div className={`${bar} h-3 w-1/2 bg-night/[0.07]`} />
          </div>
          <div className={`${bar} hidden h-6 w-20 bg-night/[0.07] sm:block`} />
        </div>
      ))}
    </div>
  );
}
