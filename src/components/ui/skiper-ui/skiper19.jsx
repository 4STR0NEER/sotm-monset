import { motion, useTransform } from "motion/react";

// Skiper 19 LinePath (skiper-ui.com), adapted: the scribble became a switchback mountain trail,
// in lantern orange, drawn by the scroll progress it is given.
export default function TrailPath({ progress, className }) {
  const pathLength = useTransform(progress, [0, 1], [0.04, 1]);
  return (
    <svg viewBox="0 0 400 1000" fill="none" preserveAspectRatio="xMidYMid meet" className={className} aria-hidden="true">
      <motion.path
        d="M200 0 C 200 80, 330 90, 330 170 S 80 240, 80 330 S 340 420, 330 510 S 60 590, 90 680 S 320 760, 300 850 S 200 940, 200 1000"
        stroke="var(--color-lantern)"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ pathLength }}
      />
      <path
        d="M200 0 C 200 80, 330 90, 330 170 S 80 240, 80 330 S 340 420, 330 510 S 60 590, 90 680 S 320 760, 300 850 S 200 940, 200 1000"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 8"
        opacity="0.35"
      />
    </svg>
  );
}

/**
 * Skiper 19 — React + Motion
 * Free to use; attribution to Skiper UI (skiper-ui.com) is required for the free version.
 * Author: @gurvinder-singh02 — https://gxuri.me
 */
