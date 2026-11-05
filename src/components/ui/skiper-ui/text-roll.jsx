import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// TextRoll from Skiper UI (skiper58, skiper-ui.com). Adapted: listens to the parent's
// "initial" / "hovered" variants, so the whole link is the hover target, and is read as one word.
const STAGGER = 0.025;
const EASE = [0.77, 0, 0.175, 1];

export default function TextRoll({ children, className }) {
  const letters = children.split("");
  // letters leave from the centre outwards
  const delay = (i) => STAGGER * Math.abs(i - (letters.length - 1) / 2);
  const row = (from, to) =>
    letters.map((l, i) => (
      <motion.span
        key={i}
        className="inline-block whitespace-pre"
        variants={{ initial: { y: from }, hovered: { y: to } }}
        transition={{ duration: 0.4, ease: EASE, delay: delay(i) }}
      >
        {l}
      </motion.span>
    ));

  return (
    <span aria-label={children} className={cn("relative block overflow-hidden leading-[1.15]", className)}>
      <span aria-hidden="true" className="block">{row(0, "-100%")}</span>
      <span aria-hidden="true" className="absolute inset-0">{row("100%", 0)}</span>
    </span>
  );
}
