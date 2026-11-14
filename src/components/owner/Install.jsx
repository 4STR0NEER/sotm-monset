import { useEffect, useState } from "react";
import { Download, MoreVertical, Share, X } from "lucide-react";

// "Install app" for the dashboard (manifest + public/sw.js). When the browser hands over an install
// prompt (Chrome, Edge, most Android), the button opens it. Otherwise it shows the steps for this
// device: iPhone/iPad (Safari → Share → Add to Home Screen), Android (Chrome ⋮ menu), or a computer.
// Hidden once the dashboard is already running as the installed app.
let promptEvent = null;
addEventListener("beforeinstallprompt", (e) => (e.preventDefault(), (promptEvent = e), dispatchEvent(new Event("sotm-installable"))));
addEventListener("appinstalled", () => ((promptEvent = null), dispatchEvent(new Event("sotm-installable"))));

const installed = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const android = () => /Android/.test(navigator.userAgent);
const apple = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function Install({ className = "", label = "Install app", pop = "top-full left-0 mt-2" }) {
  const [, rerender] = useState(0);
  const [steps, setSteps] = useState(false);
  useEffect(() => {
    const on = () => rerender((n) => n + 1);
    addEventListener("sotm-installable", on);
    return () => removeEventListener("sotm-installable", on);
  }, []);

  if (installed()) return null;

  const guide = apple() ? {
    device: "iPhone or iPad",
    steps: [
      <>Open this page in <b>Safari</b> (not inside Facebook or Messenger).</>,
      <>Tap <Share size={14} className="inline align-[-2px]" aria-label="Share" /> <b>Share</b> (bottom of the screen, or top on iPad).</>,
      <>Scroll down and tap <b>Add to Home Screen</b>.</>,
      <>If you see <b>Open as Web App</b>, keep it on. Tap <b>Add</b>.</>,
    ],
  } : android() ? {
    device: "Android",
    steps: [
      <>Open this page in <b>Chrome</b> (not inside Facebook or Messenger).</>,
      <>Tap <MoreVertical size={14} className="inline align-[-2px]" aria-label="menu" /> at the top right.</>,
      <>Tap <b>Add to Home screen</b> (or <b>Install app</b>), then <b>Install</b>.</>,
    ],
  } : {
    device: "this computer",
    steps: [
      <>Open this page in <b>Chrome</b> or <b>Edge</b>.</>,
      <>Click the install icon at the right end of the address bar (or the ⋮ menu → <b>Install</b>).</>,
      <>Click <b>Install</b>. It opens in its own window and joins your dock or taskbar.</>,
    ],
  };

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
        <div role="dialog" aria-label={`Install on ${guide.device}`} className={`absolute z-50 w-72 ${pop} rounded-2xl bg-mist p-4 text-sm text-night shadow-xl`}>
          <button onClick={() => setSteps(false)} className="absolute right-2 top-2 p-1 text-night/50" aria-label="Close"><X size={16} /></button>
          <p className="font-semibold">Install on {guide.device}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-night/75">
            {guide.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <p className="mt-3 text-xs text-night/55">Then always open the dashboard from its icon. You'll stay signed in.</p>
        </div>
      )}
    </div>
  );
}
