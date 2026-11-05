import { animate, splitText, stagger, utils } from "animejs";

// Page-wide entrance motion, all anime.js. Mark elements up and call initScrollFx() once per page:
//   .reveal              fade + rise when it enters
//   [data-split]         words rise out of a clip, staggered (headlines)
//   [data-stagger]       its direct children rise one after another (lists, grids)
//   [data-count="816"]   number counts up from 0
// Returns a cleanup for React's effect.
export function initScrollFx(root = document) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const undo = [];
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.__enter?.();
      }),
    { threshold: 0.18 }
  );
  const onEnter = (el, fn) => ((el.__enter = fn), io.observe(el));
  undo.push(() => io.disconnect());

  const out = { ease: "out(4)" };

  root.querySelectorAll(".reveal").forEach((el) => {
    if (reduce) return;
    utils.set(el, { opacity: 0, y: 24, filter: "blur(6px)" });
    onEnter(el, () => animate(el, { opacity: 1, y: 0, filter: "blur(0px)", duration: 900, ...out }));
  });

  root.querySelectorAll("[data-split]").forEach((el) => {
    if (reduce) return;
    const split = splitText(el, { words: { wrap: "clip" } });
    undo.push(() => split.revert());
    utils.set(split.words, { y: "110%" });
    onEnter(el, () => animate(split.words, { y: "0%", duration: 1000, delay: stagger(45), ...out }));
  });

  root.querySelectorAll("[data-stagger]").forEach((el) => {
    if (reduce) return;
    const kids = [...el.children];
    utils.set(kids, { opacity: 0, y: 18 });
    onEnter(el, () => animate(kids, { opacity: 1, y: 0, duration: 700, delay: stagger(70), ...out }));
  });

  root.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    if (reduce) return;
    const n = { v: 0 };
    el.textContent = (0).toFixed(decimals);
    onEnter(el, () =>
      animate(n, {
        v: end,
        duration: 1800,
        ease: "out(3)",
        onUpdate: () => (el.textContent = n.v.toFixed(decimals)),
      })
    );
  });

  return () => undo.forEach((fn) => fn());
}
