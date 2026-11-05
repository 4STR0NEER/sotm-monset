import Lenis from "lenis";

// Weighted smooth scrolling for the whole site. Off for reduced motion (native scroll then).
export let lenis = null;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function scrollToTarget(target, duration = 1.4) {
  if (!lenis) {
    if (typeof target === "number") scrollTo({ top: target });
    else target?.scrollIntoView();
    return;
  }
  lenis.scrollTo(target, { duration, easing: easeInOut, offset: typeof target === "number" ? 0 : -72 });
}

export function initSmooth() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ autoRaf: true, lerp: 0.085 });
  return () => (lenis.destroy(), (lenis = null));
}
