import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link } from "@/lib/router";
import TextRoll from "@/components/ui/skiper-ui/text-roll";

const LINKS = [
  ["The rooms", "/#rooms"],
  ["Amenities", "/#amenities"],
  ["Packages", "/#packages"],
  ["Good to know", "/#faq"],
  ["Find us", "/#find-us"],
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(scrollY > 60);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-500 ease-[var(--ease-out)] ${
          solid ? "bg-pine-deep/80 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl" : ""
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 text-mist sm:px-8 md:h-[72px]">
          <Link to="/" className="flex items-center gap-3" aria-label="Sermon on the Mount, home">
            <span className="logo-mask block w-8 text-mist" />
            <span className="stamp hidden text-sm leading-tight sm:block">
              Sermon on<br />the Mount
            </span>
          </Link>
          <ul className="hidden items-center gap-7 text-sm lg:flex">
            {LINKS.map(([label, to]) => (
              <li key={to}>
                <motion.div initial="initial" whileHover="hovered">
                  <Link to={to} className="block text-mist/80 hover:text-mist">
                    <TextRoll>{label}</TextRoll>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link
              to="/book"
              className="rounded-full bg-lantern px-5 py-2.5 text-sm font-semibold text-night transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
            >
              Book your stay
            </Link>
            <button
              className="grid size-10 place-items-center rounded-full text-mist lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="grain fixed inset-0 z-[60] flex flex-col bg-night px-6 pb-10 pt-5 text-mist lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
          >
            <div className="flex justify-end">
              <button className="grid size-10 place-items-center" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <ul className="mt-10 flex flex-col gap-2">
              {LINKS.map(([label, to], i) => (
                <motion.li
                  key={to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link to={to} onClick={() => setOpen(false)} className="font-display text-4xl italic">
                    {label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <span className="logo-mask mt-auto block w-16 self-center text-moss" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
