import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ExternalLink, HandCoins, LayoutGrid, ListChecks, LogOut, Receipt, Users } from "lucide-react";
import Overview from "@/components/owner/Overview";
import BookingsTable from "@/components/owner/BookingsTable";
import OwnerCalendar from "@/components/owner/OwnerCalendar";
import BookingDrawer from "@/components/owner/BookingDrawer";
import StaffTab from "@/components/owner/StaffTab";
import ExpensesTab from "@/components/owner/ExpensesTab";
import PayrollTab from "@/components/owner/PayrollTab";
import OwnerSignIn from "@/components/owner/OwnerSignIn";
import { fmtDate, today } from "@/components/owner/ui";
import { Link } from "@/lib/router";
import { stopBookings, updateBooking, useBookings } from "@/lib/bookings";
import { stopRecords } from "@/lib/records";
import { OWNER_EMAIL, supabase } from "@/lib/supabase";

// The owners' side, over the live Supabase bookings (lib/bookings.js): a guest's request on /book
// shows up here straight away. Only the owner account gets in, and the database enforces it too.
const TABS = [
  ["overview", "Overview", LayoutGrid],
  ["bookings", "Bookings", ListChecks],
  ["calendar", "Calendar", CalendarDays],
  ["staff", "Staff", Users],
  ["expenses", "Expenses", Receipt],
  ["payroll", "Payroll", HandCoins],
];

export default function Owner() {
  const [session, setSession] = useState(undefined); // undefined while checking
  useEffect(() => {
    if (!supabase) return setSession(null);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) (stopBookings(), stopRecords());
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div className="min-h-screen bg-pine-deep" />;
  const email = session?.user?.email;
  if (email !== OWNER_EMAIL) return <OwnerSignIn wrongAccount={email} />;
  return <Dashboard />;
}

function Dashboard() {
  const bookings = useBookings();
  const [tab, setTab] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const opened = bookings.find((b) => b.id === openId) ?? null;
  const requests = bookings.filter((b) => b.status === "requested").length;

  const notify = (msg, undo) => {
    clearTimeout(timer.current);
    setToast({ msg, undo, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 5000);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  // apply a change to a booking, with a 5-second undo that puts the old values back
  const act = (b, patch, msg) => {
    const before = Object.fromEntries(Object.keys(patch).map((k) => [k, b[k]]));
    const failed = (e) => notify(e.message);
    updateBooking(b.id, patch).catch(failed);
    notify(msg, () => updateBooking(b.id, before).catch(failed));
  };

  const goTo = (t, f) => (setTab(t), f && setFilter(f));
  const close = useCallback(() => setOpenId(null), []);

  return (
    <div className="min-h-screen bg-fog/60 lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="grain relative flex items-center justify-between gap-4 bg-pine-deep px-4 py-3 text-mist lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:items-stretch lg:justify-start lg:px-5 lg:py-7">
        <Link to="/" className="flex items-center gap-3">
          <span className="logo-mask block w-8 text-mist" />
          <span className="stamp text-sm leading-tight">Sermon on<br />the Mount</span>
        </Link>
        <nav className="hidden flex-col gap-1 lg:mt-10 lg:flex" aria-label="Dashboard">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${tab === id ? "text-night" : "text-fog/70 hover:text-mist"}`}
            >
              {tab === id && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-xl bg-mist" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
              <Icon size={18} className="relative" aria-hidden="true" />
              <span className="relative">{label}</span>
              {id === "bookings" && requests > 0 && <span className="tnum relative ml-auto rounded-full bg-lantern px-2 text-xs font-semibold text-night">{requests}</span>}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:mt-auto lg:flex-col lg:items-stretch">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-fog/70 hover:text-mist"><ExternalLink size={16} /> <span className="hidden sm:inline">View website</span></Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-fog/70 hover:text-mist"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 px-4 pb-24 pt-6 sm:px-8 lg:pt-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="stamp text-xs text-moss">Owner dashboard</p>
            <h1 className="font-display text-4xl font-light text-pine-deep sm:text-5xl">
              {tab === "overview" ? "Good day." : TABS.find((x) => x[0] === tab)[1]}
            </h1>
            <p className="mt-1 text-sm text-night/55">{fmtDate(today(), { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          {/* tabs for phones and tablets; the sidebar has them on desktop */}
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/70 p-1 lg:hidden" role="tablist">
            {TABS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium ${tab === id ? "text-mist" : "text-night/60"}`}>
                {tab === id && <motion.span layoutId="top-pill" className="absolute inset-0 rounded-full bg-pine" transition={{ type: "spring", bounce: 0, duration: 0.4 }} />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {tab === "overview" && <Overview bookings={bookings} open={setOpenId} goTo={goTo} />}
            {tab === "bookings" && <BookingsTable bookings={bookings} open={setOpenId} filter={filter} setFilter={setFilter} />}
            {tab === "calendar" && <OwnerCalendar bookings={bookings} open={setOpenId} />}
            {tab === "staff" && <StaffTab notify={notify} />}
            {tab === "expenses" && <ExpensesTab notify={notify} />}
            {tab === "payroll" && <PayrollTab notify={notify} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BookingDrawer booking={opened} onClose={close} act={act} />

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="pointer-events-auto flex items-center gap-4 rounded-full bg-night py-2.5 pl-5 pr-2.5 text-sm text-mist shadow-xl"
            >
              {toast.msg}
              {toast.undo && (
                <button onClick={() => (toast.undo(), setToast(null))} className="rounded-full bg-mist/10 px-3.5 py-1.5 font-semibold text-lantern hover:bg-mist/20">
                  Undo
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
