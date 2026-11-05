import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { animate, createTimeline, utils } from "animejs";

// "By lantern light": the room sits in the dark and the pointer is a lantern. Motion springs give the
// light its lag and sway; anime.js runs the flicker, the idle drift and the blow-out between rooms.
// Things in the room label themselves when the light reaches them. Reduced motion: fully lit, no drift.
const REACH = 0.17; // how close (as a share of the stage width) the light must come to reveal a label

export default function Lantern({ scene, onSwapped }) {
  const stage = useRef(null);
  const reduce = useRef(false);
  const inside = useRef(false);
  const [shown, setShown] = useState(scene);
  const [near, setNear] = useState("");

  // target position (0–1) and the light's actual position, which trails it like a hand-held lamp
  const tx = useMotionValue(0.5);
  const ty = useMotionValue(0.45);
  const x = useSpring(tx, { stiffness: 90, damping: 14, mass: 0.7 });
  const y = useSpring(ty, { stiffness: 90, damping: 14, mass: 0.7 });
  const radius = useMotionValue(0);
  const px = useMotionValue(0); // the same, in pixels, for the CSS gradients
  const py = useMotionValue(0);

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${px}px ${py}px, #000 0%, #000 38%, transparent 100%)`;
  const glow = useMotionTemplate`radial-gradient(circle ${radius}px at ${px}px ${py}px, rgb(233 166 80 / 0.38), transparent 70%)`;

  const light = useRef({ base: 0, flick: 1 });
  const paint = () => radius.set(light.current.base * light.current.flick);

  // pixels + which hotspots are lit
  const sync = () => {
    const el = stage.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    px.set(x.get() * w);
    py.set(y.get() * h);
    const lit = shown.spots
      .filter((s) => Math.hypot((s.x / 100 - x.get()) * w, (s.y / 100 - y.get()) * h) < REACH * w)
      .map((s) => s.label)
      .join("|");
    setNear((prev) => (prev === lit ? prev : lit));
  };
  useMotionValueEvent(x, "change", sync);
  useMotionValueEvent(y, "change", sync);

  const fullRadius = () => (stage.current?.clientWidth ?? 900) * 0.24;

  // first light, flicker and the idle drift
  useEffect(() => {
    reduce.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    sync();
    if (reduce.current) {
      light.current.base = fullRadius() * 6;
      paint();
      return;
    }
    const L = light.current;
    const lightUp = animate(L, { base: [0, fullRadius()], duration: 1400, ease: "out(3)", onUpdate: paint });
    const flicker = animate(L, {
      flick: () => utils.random(0.93, 1.05, 3),
      duration: () => utils.random(120, 420),
      loop: true,
      ease: "inOut(2)",
      onUpdate: paint,
      onLoop: (self) => self.refresh(), // new random target every flicker
    });
    // when nobody is holding the lantern it wanders the room on its own
    const pos = { x: 0.5, y: 0.45 };
    const drift = animate(pos, {
      x: [0.22, 0.78, 0.4, 0.66, 0.3],
      y: [0.4, 0.55, 0.3, 0.62, 0.45],
      duration: 16000,
      loop: true,
      ease: "inOut(2)",
      onUpdate: () => {
        if (inside.current) return;
        tx.set(pos.x);
        ty.set(pos.y);
      },
    });
    const resize = () => (L.base = fullRadius(), paint(), sync());
    addEventListener("resize", resize);
    return () => {
      lightUp.revert();
      flicker.revert();
      drift.revert();
      removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // a new room: blow the light out, swap the photo in the dark, light it again
  useEffect(() => {
    if (scene === shown) return;
    if (reduce.current) {
      setShown(scene);
      return;
    }
    const L = light.current;
    const tl = createTimeline({ onComplete: () => onSwapped?.() });
    tl.add(L, { base: 0, duration: 260, ease: "in(3)", onUpdate: paint, onComplete: () => setShown(scene) })
      .add(L, { base: fullRadius(), duration: 900, ease: "out(3)", onUpdate: paint }, "+=140");
    return () => tl.pause();
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(sync, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = (e) => {
    const r = stage.current.getBoundingClientRect();
    tx.set((e.clientX - r.left) / r.width);
    ty.set((e.clientY - r.top) / r.height);
  };

  return (
    <div
      ref={stage}
      className="relative aspect-[3/2] w-full touch-pan-y select-none overflow-hidden rounded-[2rem] bg-night [@media(pointer:fine)]:cursor-none"
      onPointerEnter={(e) => (inside.current = true, move(e))}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={() => (inside.current = false)}
    >
      {/* the room in the dark */}
      <img src={shown.src} alt="" draggable="false" className="absolute inset-0 h-full w-full object-cover [filter:brightness(0.16)_saturate(0.5)]" />
      {/* the same room, lit, seen only through the lantern's circle */}
      <motion.img
        src={shown.src}
        alt={shown.alt}
        draggable="false"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="absolute inset-0 h-full w-full object-cover [filter:brightness(1.05)_sepia(0.12)]"
      />
      <motion.div aria-hidden="true" style={{ background: glow }} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />

      {/* labels that wake up in the light */}
      {shown.spots.map((s) => {
        const on = near.split("|").includes(s.label);
        const left = s.x > 58;
        return (
          <div
            key={s.label}
            className="pointer-events-none absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span className={`absolute -left-1.5 -top-1.5 size-3 rounded-full border border-mist bg-lantern transition-[opacity,transform] duration-300 ease-[var(--ease-out)] ${on ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
            <span
              className={`absolute top-0 w-max max-w-[min(16rem,45vw)] -translate-y-1/2 rounded-full bg-night/80 px-3 py-1.5 text-[11px] leading-tight text-mist backdrop-blur-sm transition-[opacity,transform,filter] duration-300 ease-[var(--ease-out)] sm:text-sm ${
                left ? "right-4 origin-right" : "left-4 origin-left"
              } ${on ? "scale-100 opacity-100 blur-0" : "scale-95 opacity-0 blur-[3px]"}`}
            >
              {s.label}
            </span>
          </div>
        );
      })}

      {/* the lantern itself, standing in for the cursor */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden [@media(pointer:fine)]:block"
        style={{ x: px, y: py }}
      >
        <span className="absolute -left-1 -top-1 size-2 rounded-full bg-lantern shadow-[0_0_24px_10px_rgb(233_166_80/0.55)]" />
      </motion.div>
    </div>
  );
}
