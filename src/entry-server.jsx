// Build-time renderer: turns each public page into real HTML (scripts/prerender.mjs), so search
// engines and AI crawlers that don't run JavaScript still read the content. The browser then renders
// the live app over it (main.jsx).
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { MotionConfig } from "motion/react";
import App from "./App";
import { setServerPath } from "./lib/router";
import { preload } from "./lib/routes";

export async function render(path) {
  setServerPath(path);
  await preload(path); // renderToString can't wait for a lazy page
  return renderToString(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </StrictMode>
  );
}

export { PAGES, NOT_FOUND, SITE, jsonLd, llmsTxt, stayAt } from "./data/seo";
