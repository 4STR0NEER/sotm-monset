import { useState } from "react";
import { LogIn } from "lucide-react";
import { Link } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import Install from "./Install";

// Email + password sign-in for admins and staff. Accounts are made by an admin in the Accounts tab
// (sign-ups are off); the database rules (roles table, migration 0004) keep everyone else out.
export default function OwnerSignIn({ wrongAccount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState(null); // null | "sending" | error message

  // on success, Owner's onAuthStateChange swaps this screen for the dashboard
  const send = async (e) => {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setState(error ? "Wrong email or password, or too many tries. Wait a minute and try again." : null);
  };

  return (
    <main className="grain grid min-h-screen place-items-center bg-pine-deep px-4 text-mist">
      <div className="w-full max-w-sm">
        <span className="logo-mask mb-8 block w-12 text-mist" />
        <h1 className="font-display text-4xl font-light">Dashboard</h1>
        {!supabase ? (
          <p className="mt-4 text-fog/75">The dashboard isn't connected to the database yet.</p>
        ) : wrongAccount ? (
          <>
            <p className="mt-4 text-fog/75">You're signed in as {wrongAccount}, which doesn't have dashboard access. Ask an admin to add you.</p>
            <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 active:scale-[0.97]">Sign out</button>
          </>
        ) : (
          <form onSubmit={send} className="mt-6">
            <label className="block">
              <span className="text-sm text-fog/70">Email</span>
              <input
                type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-2xl border border-mist/15 bg-night/30 px-4 py-3 text-mist outline-none transition-[border-color] duration-200 focus:border-lantern"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm text-fog/70">Password</span>
              <input
                type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-2xl border border-mist/15 bg-night/30 px-4 py-3 text-mist outline-none transition-[border-color] duration-200 focus:border-lantern"
              />
            </label>
            <button disabled={state === "sending"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 active:scale-[0.97] disabled:opacity-60">
              <LogIn size={16} aria-hidden="true" /> {state === "sending" ? "Signing in…" : "Sign in"}
            </button>
            {state && state !== "sending" && <p role="alert" className="mt-3 text-sm text-lantern">{state}</p>}
          </form>
        )}
        <Install label="Install the dashboard on this device" className="mt-6 w-full justify-center rounded-full border border-mist/20 px-6 py-3 text-sm font-semibold text-mist transition-colors hover:border-lantern hover:text-lantern" />
        <Link to="/" className="mt-10 inline-block text-sm text-fog/55 hover:text-mist">← Back to the website</Link>
      </div>
    </main>
  );
}
