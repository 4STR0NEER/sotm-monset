import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Plus, ExternalLink, HandCoins, KeyRound, LayoutGrid, ListChecks, LogOut, Receipt, Users } from "lucide-react";
import Overview from "@/components/owner/Overview";
import BookingsTable from "@/components/owner/BookingsTable";
import OwnerCalendar from "@/components/owner/OwnerCalendar";
import BookingDrawer from "@/components/owner/BookingDrawer";
import NewBooking from "@/components/owner/NewBooking";
import StaffTab from "@/components/owner/StaffTab";
import ExpensesTab from "@/components/owner/ExpensesTab";
import PayrollTab from "@/components/owner/PayrollTab";
import AccountsTab from "@/components/owner/AccountsTab";
import OwnerSignIn from "@/components/owner/OwnerSignIn";
import Install from "@/components/owner/Install";
import { fmtDate, today } from "@/components/owner/ui";
import { Link } from "@/lib/router";
import { stopBookings, updateBooking, useBookings, useBookingsLoaded } from "@/lib/bookings";
import { DashboardSkeleton, RowsSkeleton } from "@/components/Skeleton";
import { stopRecords } from "@/lib/records";
import { supabase } from "@/lib/supabase";

// The team's side, over the live Supabase bookings (lib/bookings.js): a guest's request on /book
// shows up here straight away. Two roles (migration 0004): admins see every tab, staff only
// bookings and the calendar. The database enforces the same split, this just hides the tabs.
const ALL_TABS = [
  ["overview", "Overview", LayoutGrid],
  ["bookings", "Bookings", ListChecks],
  ["calendar", "Calendar", CalendarDays],
  ["staff", "Staff", Users],
  ["expenses", "Expenses", Receipt],
  ["payroll", "Payroll", HandCoins],
  ["accounts", "Accounts", KeyRound],
];
const STAFF_TABS = ["bookings", "calendar"];

// The dashboard installs as an app (phone home screen, laptop dock). The manifest is only linked
// here, so guests browsing the website don't get offered an install of the staff dashboard.
const HEAD = [
  ["link", { rel: "manifest", href: "/manifest.webmanifest" }],
  ["link", { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" }],
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-title", content: "SOTM" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }],
];
navigator.serviceWorker?.register("/sw.js"); // opens offline once installed (public/sw.js)
navigator.storage?.persist?.(); // ask the browser not to clear the saved sign-in when space runs low
export default function Owner() {
  useEffect(() => {
    const els = HEAD.map(([tag, attrs]) => document.head.appendChild(Object.assign(document.createElement(tag), attrs)));
    return () => els.forEach((el) => el.remove());
  }, []);
  const [auth, setAuth] = useState(undefined); // undefined while checking, null signed out, else { email, role }
  useEffect(() => {
    if (!supabase) return setAuth(null);
    let live = true;
    // A failed lookup (phone just woke, no signal yet) keeps the last known role instead of
    // showing "no access". The database still checks the role on every read and write.
    // Nothing remembered yet (signed in before this existed)? Keep the loading screen and try again
    // every 3 seconds until the phone has signal, rather than ever showing "no access" by mistake.
    const check = async (s, tries = 0) => {
      if (!s) return live && setAuth(null);
      const key = "sotm-role:" + s.user.id;
      const { data, error } = await supabase.rpc("my_role");
      let role = data ?? null;
      try {
        if (error) role = localStorage.getItem(key);
        else if (role) localStorage.setItem(key, role);
        else localStorage.removeItem(key);
      } catch {}
      if (error && !role && tries < 40) return live && setTimeout(() => check(s, tries + 1), 3000);
      if (live) setAuth({ email: s.user.email, role });
    };
    // deferred: supabase-js can deadlock if the auth callback awaits another call directly
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) (stopBookings(), stopRecords());
      setTimeout(() => check(s));
    });
    return () => ((live = false), data.subscription.unsubscribe());
  }, []);

  if (auth === undefined) return <DashboardSkeleton />;
  if (!auth?.role) return <OwnerSignIn wrongAccount={auth?.email} />;
  return <Dashboard key={auth.email} {...auth} />;
}

function Dashboard({ email, role }) {
  const TABS = role === "admin" ? ALL_TABS : ALL_TABS.filter(([id]) => STAFF_TABS.includes(id));
  const bookings = useBookings();
  const loaded = useBookingsLoaded();
  const [tab, setTab] = useState(TABS[0][0]);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const closeAdd = useCallback(() => setAdding(false), []);
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
          <Install label="Install" className="rounded-xl px-3 py-2 text-sm font-semibold text-lantern hover:text-mist" pop="right-0 top-full mt-2 lg:left-0 lg:right-auto lg:top-auto lg:bottom-full lg:mb-2 lg:mt-0" />
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
            <p className="stamp text-xs text-moss">{role === "admin" ? "Admin" : "Staff"} · {email}</p>
            <h1 className="font-display text-4xl font-light text-pine-deep sm:text-5xl">
              {tab === "overview" ? "Good day." : TABS.find((x) => x[0] === tab)[1]}
            </h1>
            <p className="mt-1 text-sm text-night/55">{fmtDate(today(), { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          {["overview", "bookings", "calendar"].includes(tab) && (
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-mist transition-[background-color,transform] duration-150 hover:bg-pine-deep active:scale-[0.97]">
              <Plus size={16} aria-hidden="true" /> New booking
            </button>
          )}
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
            {!loaded && ["overview", "bookings", "calendar"].includes(tab) ? <RowsSkeleton /> : <>
            {tab === "overview" && <Overview bookings={bookings} open={setOpenId} goTo={goTo} />}
            {tab === "bookings" && <BookingsTable bookings={bookings} open={setOpenId} filter={filter} setFilter={setFilter} />}
            {tab === "calendar" && <OwnerCalendar bookings={bookings} open={setOpenId} add={setAdding} />}
            </>}
            {tab === "staff" && <StaffTab notify={notify} />}
            {tab === "expenses" && <ExpensesTab notify={notify} />}
            {tab === "payroll" && <PayrollTab notify={notify} />}
            {tab === "accounts" && <AccountsTab me={email} notify={notify} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <BookingDrawer booking={opened} onClose={close} act={act} />
      <NewBooking
        open={adding}
        onClose={closeAdd}
        bookings={bookings}
        onCreated={(id, name) => (setAdding(false), setOpenId(id), notify(`Booking for ${name} added · ${id}`))}
      />

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
