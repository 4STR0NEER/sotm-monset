import { useEffect, useRef, useState } from "react";
import { animate as motionAnimate, motion, useMotionValue, useTransform } from "motion/react";
import { animate, stagger, utils } from "animejs";

// The rooms as a pile of postcards on the wooden table. Drag or flick the top card away and it
// slides back under the pile; tap it to turn it over and read the note. Motion runs the gestures
// and the flip (interruptible springs); anime.js deals the pile onto the table the first time it
// scrolls into view. Keyboard: the two buttons below the pile do the same.

const TILT = [-5, 3.5, -2, 6, -3.5, 2.5]; // each card's resting angle on the table
const OFFSET = [[-6, 4], [10, -6], [-12, -10], [6, 12], [14, 2], [-4, -14]];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function Stamp() {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center bg-[radial-gradient(circle,#f6efe2_60%,transparent_62%)] bg-[length:8px_8px] p-1 [background-position:-4px_-4px] sm:size-20">
      <div className="grid size-full place-items-center bg-pine text-mist">
        <span className="logo-mask block w-7 text-mist sm:w-9" />
      </div>
    </div>
  );
}

function Postmark() {
  return (
    <svg viewBox="0 0 100 100" className="absolute right-12 top-3 w-20 -rotate-12 text-night/35 sm:right-16 sm:w-24" aria-hidden="true">
      <defs><path id="pm" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" /></defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fontSize="10" fill="currentColor" letterSpacing="2" style={{ fontFamily: "var(--font-stamp)" }}>
        <textPath href="#pm">BALAMBAN · CEBU · 816 M ·</textPath>
      </text>
      <text x="50" y="54" textAnchor="middle" fontSize="11" fill="currentColor" style={{ fontFamily: "var(--font-stamp)" }}>SOTM</text>
      <path d="M96 40 q14 -6 28 0 t28 0 M96 52 q14 -6 28 0 t28 0 M96 64 q14 -6 28 0 t28 0" fill="none" stroke="currentColor" strokeWidth="2" transform="translate(-8 0)" />
    </svg>
  );
}

function Card({ card, n, depth, total, top, flipped, onFlip, onSent, sendRef }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, (v) => TILT[n % TILT.length] + v / 22);
  const [ox, oy] = OFFSET[n % OFFSET.length]; // positions repeat past six cards

  // fling it off the table, then slide it back in under the pile
  const send = async (dir = 1) => {
    if (reduced()) return onSent();
    await motionAnimate(x, dir * Math.max(innerWidth, 900), { duration: 0.32, ease: [0.4, 0, 1, 1] });
    onSent();
    motionAnimate(x, 0, { type: "spring", bounce: 0, duration: 0.7 });
  };
  if (top) sendRef.current = send;

  return (
    <motion.div
      className="absolute inset-0 [perspective:1600px]"
      style={{ zIndex: total - depth, x, rotate, marginLeft: ox, marginTop: oy }}
      animate={{ scale: 1 - depth * 0.025, y: depth * 3 }}
      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      drag={top ? "x" : false}
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 500) send(Math.sign(info.offset.x || info.velocity.x));
        else motionAnimate(x, 0, { type: "spring", bounce: 0.2, duration: 0.5 });
      }}
      onTap={() => top && onFlip()}
      whileDrag={{ scale: 1.03, cursor: "grabbing" }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: top && flipped ? 180 : 0 }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.7 }}
      >
        {/* front: the photo with a white border, like a printed postcard */}
        <div className={`absolute inset-0 rounded-[6px] bg-[#f6efe2] p-2.5 shadow-[0_2px_3px_rgb(0_0_0/0.25),0_22px_40px_-18px_rgb(0_0_0/0.7)] [backface-visibility:hidden] sm:p-3.5 ${top ? "cursor-grab" : ""}`}>
          <div className="relative h-full w-full overflow-hidden rounded-[3px]">
            <img src={card.src} alt={card.name} draggable="false" className="h-full w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded-full bg-night/55 px-3 py-1 font-[Caveat] text-lg leading-none text-mist backdrop-blur-sm sm:text-xl">
              {card.name}
            </span>
          </div>
        </div>
        {/* back: stamp, postmark, the note, the address lines */}
        <div className="absolute inset-0 overflow-hidden rounded-[6px] bg-[#f6efe2] p-4 text-night shadow-[0_22px_40px_-18px_rgb(0_0_0/0.7)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6">
          <Postmark />
          <div className="flex h-full gap-4 sm:gap-6">
            <div className="flex flex-1 flex-col">
              <p className="stamp text-[10px] text-night/45 sm:text-xs">Greetings from Sermon on the Mount</p>
              <p className="mt-3 font-[Caveat] text-[clamp(1.25rem,3.6vw,2rem)] leading-[1.15] text-pine-deep">{card.note}</p>
              <p className="mt-auto font-[Caveat] text-lg text-night/60 sm:text-xl">See you up the mountain!</p>
            </div>
            <div className="w-px bg-night/15" />
            <div className="flex w-[34%] flex-col items-end">
              <Stamp />
              <div className="mt-auto w-full space-y-4 pb-2">
                <p className="border-b border-night/25 pb-1 font-[Caveat] text-lg leading-none text-night/70 sm:text-xl">your barkada</p>
                <p className="border-b border-night/25 pb-1 font-[Caveat] text-lg leading-none text-night/70 sm:text-xl">Cebu City</p>
                <p className="border-b border-night/25" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Postcards({ cards }) {
  const root = useRef(null);
  const sendRef = useRef(null);
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);

  // deal the pile onto the table, one card at a time, the first time it comes into view
  useEffect(() => {
    if (reduced()) return;
    const el = root.current;
    const dealt = el.querySelectorAll("[data-deal]");
    utils.set(dealt, { opacity: 0, y: -260, rotate: () => utils.random(-30, 30) });
    let a;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      a = animate(dealt, { opacity: 1, y: 0, rotate: 0, duration: 750, delay: stagger(110, { from: "last" }), ease: "out(3)" });
    }, { threshold: 0.35 });
    io.observe(el);
    return () => (io.disconnect(), a?.revert(), utils.set(dealt, { opacity: 1, y: 0, rotate: 0 }));
  }, []);

  const sent = () => {
    setFlipped(false);
    setOrder((o) => [...o.slice(1), o[0]]);
  };
  const topCard = cards[order[0]];

  return (
    <div ref={root} className="flex flex-col items-center">
      <div className="relative aspect-[3/2] w-[min(88vw,40rem)]" aria-live="polite" aria-label={`Postcard: ${topCard.name}${flipped ? `. ${topCard.note}` : ""}`}>
        {cards.map((card, n) => {
          const depth = order.indexOf(n);
          return (
            <div key={card.src} data-deal className="absolute inset-0" style={{ zIndex: cards.length - depth }}>
              <Card
                card={card}
                n={n}
                depth={depth}
                total={cards.length}
                top={depth === 0}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onSent={sent}
                sendRef={sendRef}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <span className="tnum stamp mr-2 text-xs text-fog/50">{String(order[0] + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="rounded-full border border-mist/25 px-5 py-2.5 text-sm font-semibold text-mist transition-[border-color,transform] duration-150 hover:border-mist/60 active:scale-[0.97]"
        >
          {flipped ? "Turn it back" : "Turn it over"}
        </button>
        <button
          onClick={() => sendRef.current?.(1)}
          className="rounded-full bg-lantern px-5 py-2.5 text-sm font-semibold text-night transition-transform duration-150 active:scale-[0.97]"
        >
          Next postcard
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-fog/45">
        <span className="[@media(pointer:coarse)]:hidden">Drag a card off the pile, or click it to turn it over.</span>
        <span className="[@media(pointer:fine)]:hidden">Swipe a card away, or tap it to turn it over.</span>
      </p>
    </div>
  );
}
