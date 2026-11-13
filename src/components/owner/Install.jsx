import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

// "Install app" for the dashboard (manifest + public/sw.js). Chrome, Edge and Android hand over an
// install prompt; iPhone and iPad have none, so the button shows the Share → Add to Home Screen steps.
// Hidden once the dashboard is already running as the installed app.
let promptEvent = null;
addEventListener("beforeinstallprompt", (e) => (e.preventDefault(), (promptEvent = e), dispatchEvent(new Event("sotm-installable"))));
addEventListener("appinstalled", () => ((promptEvent = null), dispatchEvent(new Event("sotm-installable"))));

const installed = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const apple = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function Install({ className = "", label = "Install app", pop = "top-full left-0 mt-2" }) {
  const [, rerender] = useState(0);
  const [steps, setSteps] = useState(false);
  useEffect(() => {
    const on = () => rerender((n) => n + 1);
    addEventListener("sotm-installable", on);
    return () => removeEventListener("sotm-installable", on);
  }, []);

  if (installed() || (!promptEvent && !apple())) return null;

  const click = async () => {
    if (!promptEvent) return setSteps((s) => !s);
    promptEvent.prompt();
    await promptEvent.userChoice;
    promptEvent = null;
    rerender((n) => n + 1);
  };

  return (
    <div className="relative">
      <button onClick={click} aria-expanded={promptEvent ? undefined : steps} className={`inline-flex items-center gap-2 ${className}`}>
        <Download size={16} aria-hidden="true" /> <span>{label}</span>
      </button>
      {steps && (
        <div role="dialog" aria-label="Install on iPhone or iPad" className={`absolute z-50 w-64 ${pop} rounded-2xl bg-mist p-4 text-sm text-night shadow-xl`}>
          <button onClick={() => setSteps(false)} className="absolute right-2 top-2 p-1 text-night/50" aria-label="Close"><X size={16} /></button>
          <p className="font-semibold">Install on iPhone or iPad</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-night/75">
            <li>Open this page in <b>Safari</b>.</li>
            <li>Tap <Share size={14} className="inline align-[-2px]" aria-label="Share" /> Share at the bottom.</li>
            <li>Choose <b>Add to Home Screen</b>, then <b>Add</b>.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
