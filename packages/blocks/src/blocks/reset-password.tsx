"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Field, Input, OtpInput, PasswordInput } from "@kineticui/ui";
import { CheckIcon, LockIcon, MailIcon } from "@kineticui/icons";

/** Password reset flow: request a code, enter it, choose a new password with live rules, done. */
export function ResetPassword() {
  const [step, setStep] = React.useState<"email" | "code" | "password" | "done">("email");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const wait = (next: typeof step) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(next);
    }, 700);
  };
  const strong = pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw);

  return (
    <section className="flex min-h-[640px] items-center justify-center p-6">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface p-7">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              {step === "done" ? <CheckIcon size={20} /> : step === "email" ? <MailIcon size={20} /> : <LockIcon size={20} />}
            </span>
            {step === "email" ? (
              <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) wait("code"); }}>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">Forgot your password?</h1>
                  <p className="mt-1 text-sm text-muted">We&apos;ll email you a 6-digit code.</p>
                </div>
                <Field label="Email" htmlFor="kn-rp-email">
                  <Input id="kn-rp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoFocus />
                </Field>
                <Button type="submit" size="lg" loading={busy}>Send code</Button>
                <a href="#sign-in" className="text-center text-sm text-muted hover:text-foreground">← Back to sign in</a>
              </form>
            ) : step === "code" ? (
              <>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
                  <p className="mt-1 text-sm text-muted">Enter the code we sent to <b className="text-foreground">{email}</b>.</p>
                </div>
                <OtpInput length={6} onComplete={() => wait("password")} autoFocus disabled={busy} className="justify-center" />
                <button type="button" className="text-sm text-accent hover:underline">Resend code</button>
              </>
            ) : step === "password" ? (
              <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); if (strong) wait("done"); }}>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">Choose a new password</h1>
                  <p className="mt-1 text-sm text-muted">Make it something you haven&apos;t used before.</p>
                </div>
                <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} showStrength autoFocus aria-label="New password" />
                <Button type="submit" size="lg" disabled={!strong} loading={busy}>Update password</Button>
              </form>
            ) : (
              <>
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight">Password updated</h1>
                  <p className="mt-1 text-sm text-muted">You can now sign in with your new password.</p>
                </div>
                <Button size="lg" onClick={() => { setStep("email"); setPw(""); }}>Back to sign in</Button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
