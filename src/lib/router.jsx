import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { lenis, scrollToTarget } from "./smooth";
import { preload } from "./routes";

// A tiny router on the History API: a handful of pages don't need a routing library.
// Every page change runs inside a View Transition (fog blur cross-fade, index.css).

const listeners = new Set();
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((fn) => fn());

// At build time (scripts/prerender.mjs) there is no browser: pages render for this path instead.
let serverPath = "/";
export const setServerPath = (p) => (serverPath = p);
export const usePath = () => useSyncExternalStore(subscribe, () => location.pathname, () => serverPath);
export const useSearch = () => useSyncExternalStore(subscribe, () => location.search, () => "");

function transition(update) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return update();
  document.startViewTransition(() => flushSync(update));
}

export function navigate(to) {
  const url = new URL(to, location.href);
  if (url.pathname === location.pathname && url.search === location.search) {
    // same page: glide to the section, no page transition
    scrollToTarget(url.hash ? document.querySelector(url.hash) : 0);
    return;
  }
  transition(() => {
    history.pushState(null, "", url);
    emit();
    const target = url.hash && document.querySelector(url.hash);
    if (target) target.scrollIntoView();
    else (lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0));
  });
}

if (typeof window !== "undefined") addEventListener("popstate", () => transition(emit));

// <a> that navigates in-app; modified clicks (new tab etc.) still behave like normal links.
// Hover or focus starts fetching the page's file, so it's usually there before the click.
export function Link({ to, onClick, ...props }) {
  const warm = () => preload(new URL(to, location.href).pathname);
  return (
    <a
      href={to}
      onPointerEnter={warm}
      onFocus={warm}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...props}
    />
  );
}
