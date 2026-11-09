import { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "@/lib/router";
import { OWNER_EMAIL, supabase } from "@/lib/supabase";

// Magic-link sign-in. shouldCreateUser: false means only the existing owner account gets a link;
// the database rules (is_owner) are what actually keep everyone else out.
export default function OwnerSignIn({ wrongAccount }) {
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [state, setState] = useState(null); // null | "sending" | "sent" | error message

  const send = async (e) => {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: `${location.origin}/owner` },
    });
    setState(error ? "That email can't open the dashboard, or too many links were sent. Wait a minute and try again." : "sent");
  };

  return (
    <main className="grain grid min-h-screen place-items-center bg-pine-deep px-4 text-mist">
      <div className="w-full max-w-sm">
        <span className="logo-mask mb-8 block w-12 text-mist" />
        <h1 className="font-display text-4xl font-light">Owner dashboard</h1>
        {!supabase ? (
          <p className="mt-4 text-fog/75">The dashboard isn't connected to the database yet.</p>
        ) : wrongAccount ? (
          <>
            <p className="mt-4 text-fog/75">You're signed in as {wrongAccount}, which can't open the dashboard.</p>
            <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 active:scale-[0.97]">Sign out</button>
          </>
        ) : state === "sent" ? (
          <p className="mt-4 leading-relaxed text-fog/75" role="status">
            Check <b className="font-medium text-mist">{email}</b> for a sign-in link. It opens the dashboard on this device.
          </p>
        ) : (
          <form onSubmit={send} className="mt-6">
            <label className="block">
              <span className="text-sm text-fog/70">Email</span>
              <input
                type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-2xl border border-mist/15 bg-night/30 px-4 py-3 text-mist outline-none transition-[border-color] duration-200 focus:border-lantern"
              />
            </label>
            <button disabled={state === "sending"} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lantern px-6 py-3 font-semibold text-night transition-transform duration-150 active:scale-[0.97] disabled:opacity-60">
              <Mail size={16} aria-hidden="true" /> {state === "sending" ? "Sending…" : "Email me a sign-in link"}
            </button>
            {state && state !== "sending" && <p role="alert" className="mt-3 text-sm text-lantern">{state}</p>}
          </form>
        )}
        <Link to="/" className="mt-10 inline-block text-sm text-fog/55 hover:text-mist">← Back to the website</Link>
      </div>
    </main>
  );
}
