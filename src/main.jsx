import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import { preload } from "./lib/routes";
import "./index.css";

// Fetch this page's own file first, so the app replaces the pre-rendered page with itself, not a skeleton.
const dashboard = location.hostname.startsWith("dashboard.");
(dashboard ? Promise.resolve() : preload(location.pathname)).finally(() => createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>
));
