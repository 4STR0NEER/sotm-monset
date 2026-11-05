import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { ArrowRight } from "lucide-react";
import RevenueChart from "./RevenueChart";
import { cn } from "@/lib/utils";
import { Count, PKG, PayState, PkgTag, fmtDate, today } from "./ui";
import { addMonths, mix, money, monthKey, occupancy, revenueByMonth } from "@/lib/stats";

function Card({ children, className = "" }) {
  return <div data-card className={cn("rounded-[1.75rem] bg-white/75 p-6 shadow-[0_1px_0_rgb(13_23_18/0.04)]", className)}>{children}</div>;
}

export default function Overview({ bookings, open, goTo }) {
  const root = useRef(null);
  const t = today();
  const now = monthKey(t);
  const thisMonth = bookings.filter((b) => monthKey(b.checkIn) === now && b.status !== "cancelled");
  const rev = revenueByMonth(bookings, Array.from({ length: 9 }, (_, i) => addMonths(now, i - 5)));
  const m = money(bookings);
  const occ = occupancy(bookings, now);
  const occNext = occupancy(bookings, addMonths(now, 1));
  const requests = bookings.filter((b) => b.status === "requested").sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && b.checkIn >= t)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);
  const mixNow = mix(bookings.filter((b) => b.checkIn >= addMonths(now, -5) + "-01"), Object.keys(PKG));
  const mixMax = Math.max(1, ...Object.values(mixNow));

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = animate(root.current.querySelectorAll("[data-card]"), { opacity: [0, 1], y: [16, 0], duration: 700, delay: stagger(60), ease: "out(4)" });
    return () => a.revert();
  }, []);

  const kpis = [
    ["Booked this month", <Count value={thisMonth.reduce((s, b) => s + (b.total || 0), 0)} />, `${thisMonth.length} bookings in ${fmtDate(t, { month: "long" })}`],
    ["Collected", <Count value={m.collected} />, "Deposits and full payments received"],
    ["Balance due", <Count value={m.outstanding} />, "On confirmed bookings"],
    ["Occupancy", <Count value={occ * 100} format={(v) => `${Math.round(v)}%`} />, `${Math.round(occNext * 100)}% booked next month`],
  ];

  return (
    <div ref={root} className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        {kpis.map(([label, value, sub]) => (
          <Card key={label} className="p-4 sm:p-6">
            <p className="text-sm text-night/55">{label}</p>
            <p className="mt-2 font-display text-[clamp(1.35rem,5.4vw,2.25rem)] font-light leading-tight text-pine-deep">{value}</p>
            <p className="mt-1 text-xs text-night/45">{sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-pine-deep">Revenue by month</h2>
            <span className="text-xs text-night/45">by check-in date</span>
          </div>
          <RevenueChart data={rev} current={now} />
        </Card>

        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-pine-deep">Needs your reply</h2>
            <span className="tnum rounded-full bg-lantern/25 px-2.5 py-0.5 text-sm font-semibold text-wood">{requests.length}</span>
          </div>
          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-night/50">All caught up. New requests from the website land here.</p>
          ) : (
            <ul className="divide-y divide-night/[0.07]">
              {requests.slice(0, 5).map((b) => (
                <li key={b.id}>
                  <button onClick={() => open(b.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-night/[0.02]">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-night/85">{b.name}</p>
                      <p className="text-xs text-night/50">{PKG[b.package].label} · {fmtDate(b.checkIn)} · {b.guests} guests</p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-night/30" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {requests.length > 5 && (
            <button onClick={() => goTo("bookings", "requested")} className="mt-3 text-sm font-medium text-pine underline underline-offset-4">See all {requests.length} requests</button>
          )}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h2 className="mb-4 font-display text-2xl text-pine-deep">Coming up</h2>
          <ul className="divide-y divide-night/[0.07]">
            {upcoming.map((b) => (
              <li key={b.id}>
                <button onClick={() => open(b.id)} className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-3 text-left transition-colors hover:bg-night/[0.02]">
                  <span className="text-center">
                    <span className="block text-xs uppercase text-night/45">{fmtDate(b.checkIn, { month: "short" })}</span>
                    <span className="tnum block font-display text-3xl leading-none text-pine-deep">{fmtDate(b.checkIn, { day: "numeric" })}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-night/85">{b.name}</span>
                    <PkgTag pkg={b.package} />
                  </span>
                  <PayState b={b} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-2xl text-pine-deep">What guests book</h2>
          <p className="mb-5 text-xs text-night/45">Bookings since {fmtDate(addMonths(now, -5) + "-01", { month: "long" })}</p>
          <ul className="space-y-4">
            {Object.entries(mixNow).map(([id, n]) => (
              <li key={id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <PkgTag pkg={id} />
                  <span className="tnum text-night/60">{n}</span>
                </div>
                <div className="h-2 rounded-full bg-night/[0.06]">
                  <div className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out)]" style={{ width: `${(n / mixMax) * 100}%`, background: PKG[id].color }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
