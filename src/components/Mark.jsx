// A line-drawn version of the resort's emblem (peak, pines, ridges, stars), so anime.js can draw it.
// Paths are separate on purpose: each one is a stroke the loader draws in turn.
export default function Mark({ className = "" }) {
  return (
    <svg viewBox="0 0 120 130" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M26 58 L60 24 L94 58" />
      <path d="M60 32 V84 M51 49 L60 43 L69 49 M47 58 L60 50 L73 58" />
      <path d="M53 40 V70 M67 40 V70" />
      <path d="M30 48 V104 M21 58 L30 49 L39 58 M20 70 L30 60 L40 70 M20 83 L30 73 L40 83" />
      <path d="M90 48 V98 M81 58 L90 49 L99 58 M80 70 L90 60 L100 70 M80 83 L90 73 L100 83" />
      <path d="M22 110 L40 92 L52 104 L65 90 L78 102 L98 84" />
      <path d="M46 116 L60 102 M58 118 L74 102 M72 118 L90 100 M84 118 L100 102" />
      <path d="M42 20 V30 M37 25 H47 M86 36 V44 M82 40 H90" />
      <path d="M72 14 h.01 M80 22 h.01 M30 36 h.01 M98 26 h.01" strokeWidth="4" />
    </svg>
  );
}
