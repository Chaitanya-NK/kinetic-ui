"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { ArrowLeftIcon, FingerprintIcon, MailIcon } from "@kineticui/icons";

export type PasskeyLoginProps = {
  /**
   * Run the WebAuthn ceremony: fetch options from your server, call navigator.credentials.get(),
   * and verify on the server. Resolve on success, throw on failure. Libraries like
   * @simplewebauthn/browser make this a few lines.
   */
  onPasskey: () => Promise<void>;
  /** Send a magic link to the email. */
  onMagicLink: (email: string) => Promise<void>;
  brand?: string;
  className?: string;
};

type View = "choose" | "passkey" | "email" | "sent" | "error";

/** Passwordless sign-in: passkey (Face ID / Touch ID / Windows Hello) with a magic-link fallback and clear states. */
export function PasskeyLogin({ onPasskey, onMagicLink, brand = "Kinetic", className }: PasskeyLoginProps) {
  const mounted = useMounted();
  const [view, setView] = React.useState<View>("choose");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const supported = mounted && typeof window !== "undefined" && "PublicKeyCredential" in window;

  const passkey = async () => {
    setView("passkey");
    setError(null);
    try {
      await onPasskey();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Passkey sign-in was cancelled.");
      setView("error");
    }
  };

  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email.");
    setBusy(true);
    setError(null);
    try {
      await onMagicLink(email);
      setView("sent");
    } catch {
      setError("We couldn't send the link. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("w-full max-w-sm overflow-hidden rounded-3xl border border-border-strong bg-surface p-7", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-5 text-center">
          {view === "choose" ? (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in to {brand}</h2>
                <p className="text-sm text-muted">No passwords to remember.</p>
              </div>
              <button type="button" onClick={() => void passkey()} disabled={mounted && !supported} className="group flex w-full items-center gap-4 rounded-2xl bg-accent p-4 text-left text-accent-foreground transition-transform active:scale-[0.98] disabled:opacity-40">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent-foreground/10"><FingerprintIcon size={24} /></span>
                <span className="flex flex-col">
                  <span className="font-semibold">Continue with passkey</span>
                  <span className="text-xs opacity-70">Face ID, Touch ID or security key</span>
                </span>
              </button>
              {mounted && !supported ? <p className="-mt-2 text-xs text-warning">This browser doesn&apos;t support passkeys. Use email instead.</p> : null}
              <div className="flex w-full items-center gap-3 text-xs text-subtle"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              <button type="button" onClick={() => setView("email")} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-strong text-sm font-medium hover:bg-surface-raised">
                <MailIcon size={16} /> Email me a sign-in link
              </button>
            </>
          ) : view === "passkey" ? (
            <>
              <div className="relative flex size-24 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                <span className="relative flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FingerprintIcon size={40} strokeWidth={1.6} />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Waiting for your device…</h2>
                <p className="text-sm text-muted">Confirm with Face ID, Touch ID or your security key.</p>
              </div>
              <button type="button" onClick={() => setView("choose")} className="text-sm text-subtle hover:text-foreground">Cancel</button>
            </>
          ) : view === "email" ? (
            <form onSubmit={(e) => void magic(e)} className="flex w-full flex-col gap-4 text-left" noValidate>
              <button type="button" onClick={() => setView("choose")} className="flex w-fit items-center gap-1 text-xs text-subtle hover:text-foreground"><ArrowLeftIcon size={13} /> Back</button>
              <div className="flex flex-col gap-1">
                <h2 className="font-display text-xl font-semibold">Get a magic link</h2>
                <p className="text-sm text-muted">We&apos;ll email you a link that signs you in instantly.</p>
              </div>
              <input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" aria-label="Email" aria-invalid={!!error} className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-accent" />
              {error ? <p className="-mt-2 text-xs text-danger">{error}</p> : null}
              <button type="submit" disabled={busy} className="h-11 rounded-xl bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60">{busy ? "Sending…" : "Send link"}</button>
            </form>
          ) : view === "sent" ? (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground"><MailIcon size={28} /></span>
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Check your inbox</h2>
                <p className="text-sm text-muted">We sent a sign-in link to <b className="text-foreground">{email}</b>. It expires in 15 minutes.</p>
              </div>
              <button type="button" onClick={() => setView("email")} className="text-sm text-accent">Use a different email</button>
            </>
          ) : (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger"><FingerprintIcon size={28} /></span>
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold">That didn&apos;t work</h2>
                <p className="text-sm text-muted">{error}</p>
              </div>
              <div className="flex w-full gap-2">
                <button type="button" onClick={() => void passkey()} className="h-10 flex-1 rounded-xl bg-accent text-sm font-semibold text-accent-foreground">Try again</button>
                <button type="button" onClick={() => setView("email")} className="h-10 flex-1 rounded-xl border border-border-strong text-sm">Use email</button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
