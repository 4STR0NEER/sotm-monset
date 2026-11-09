import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { CircleCheck, CircleDashed, CircleX, Flag } from "lucide-react";
import { peso } from "@/data/site";

// Booking types. Colours validated as a categorical set (dataviz validate_palette: all checks pass
// in this order); every mark also carries a text label, so colour is never the only cue.
export const PKG = {
  lodge: { label: "Cabin Lodge", code: "LODGE", color: "#2a8458" },
  chalet: { label: "Chalet", code: "CHLT", color: "#7a5a9e" },
  dayuse: { label: "Day use", code: "DAY", color: "#3f7fc4" },
  birthday: { label: "Birthday", code: "BDAY", color: "#c27f22" },
  wedding: { label: "Wedding", code: "WED", color: "#c44a66" },
};

// Status uses its own tones + an icon + a word (never colour alone, never a package colour).
export const STATUS = {
  requested: { label: "Requested", Icon: CircleDashed, cls: "bg-lantern/20 text-wood" },
  confirmed: { label: "Confirmed", Icon: CircleCheck, cls: "bg-pine/10 text-pine" },
  completed: { label: "Completed", Icon: Flag, cls: "bg-night/[0.06] text-night/60" },
  cancelled: { label: "Cancelled", Icon: CircleX, cls: "bg-crimson/10 text-crimson" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>
      <s.Icon size={13} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function PkgTag({ pkg }) {
  const p = PKG[pkg];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-night/75">
      <span className="size-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
      {p.label}
    </span>
  );
}

// Payment state as words, for confirmed bookings
export function PayState({ b }) {
  const [label, cls] =
    b.total && b.paid >= b.total ? ["Paid in full", "text-pine"]
    : b.paid >= b.deposit && b.paid > 0 ? ["Deposit paid", "text-pine/80"]
    : ["Awaiting deposit", "text-wood"];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
}

export const fmtDate = (iso, opts = { month: "short", day: "numeric" }) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-PH", { ...opts, timeZone: "UTC" });
export const nightsOf = (b) => Math.round((Date.parse(b.checkOut) - Date.parse(b.checkIn)) / 864e5);
export const today = () => new Date().toISOString().slice(0, 10);

// A number that tweens from its last value to the new one (anime.js).
export function Count({ value, format = (v) => peso(Math.round(v)), duration = 900 }) {
  const ref = useRef(null);
  const from = useRef({ v: 0 });
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anim = animate(from.current, {
      v: value,
      duration: reduce ? 0 : duration,
      ease: "out(4)",
      onUpdate: () => ref.current && (ref.current.textContent = format(from.current.v)),
    });
    return () => anim.pause();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className="tnum">{format(0)}</span>;
}
