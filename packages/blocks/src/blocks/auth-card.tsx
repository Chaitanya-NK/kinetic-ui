"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Checkbox, Field, Input, PasswordInput, SegmentedControl, Separator, toast } from "@kineticui/ui";
import { MailIcon } from "@kineticui/icons";

export type AuthCardProps = {
  brand?: React.ReactNode;
  defaultMode?: "sign-in" | "sign-up";
  onSubmit?: (data: { mode: "sign-in" | "sign-up"; name?: string; email: string; password: string }) => Promise<void> | void;
  onProvider?: (provider: "google" | "github") => void;
};

function Google() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
function GitHub() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0022 12.2C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}

/** Sign-in / sign-up card with social providers, animated mode switch and validation. */
export function AuthCard({ brand = "Kinetic", defaultMode = "sign-in", onSubmit, onProvider }: AuthCardProps) {
  const [mode, setMode] = React.useState(defaultMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setError(null);
    setBusy(true);
    try {
      await (onSubmit?.({ mode, name: mode === "sign-up" ? name : undefined, email, password }) ?? new Promise((r) => setTimeout(r, 900)));
      if (!onSubmit) toast({ title: mode === "sign-in" ? "Welcome back" : "Account created", tone: "success" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[640px] items-center justify-center bg-[radial-gradient(circle_at_50%_0%,var(--kn-accent-soft),transparent_55%)] p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-border-strong bg-surface p-7 shadow-overlay">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-accent-foreground">{typeof brand === "string" ? brand[0] : "K"}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col gap-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight">{mode === "sign-in" ? `Sign in to ${brand}` : "Create your account"}</h1>
              <p className="text-sm text-muted">{mode === "sign-in" ? "Welcome back. Pick up where you left off." : "Free for 14 days. No card needed."}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <SegmentedControl
          className="w-full [&>*]:flex-1"
          options={[{ value: "sign-in", label: "Sign in" }, { value: "sign-up", label: "Sign up" }]}
          value={mode}
          defaultValue={defaultMode}
          onValueChange={(v) => {
            setMode(v as typeof mode);
            setError(null);
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => (onProvider ? onProvider("google") : toast("Continue with Google"))}>
            <Google /> Google
          </Button>
          <Button variant="secondary" onClick={() => (onProvider ? onProvider("github") : toast("Continue with GitHub"))}>
            <GitHub /> GitHub
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-subtle">
          <Separator className="flex-1" /> or with email <Separator className="flex-1" />
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <AnimatePresence initial={false}>
            {mode === "sign-up" ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <Field label="Name" htmlFor="kn-auth-name">
                  <Input id="kn-auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
                </Field>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Field label="Email" htmlFor="kn-auth-email">
            <Input id="kn-auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" leading={<MailIcon size={15} />} invalid={!!error && error.includes("email")} />
          </Field>
          <Field
            label={
              <span className="flex w-full justify-between">
                Password
                {mode === "sign-in" ? <a href="#reset" className="text-xs font-normal text-accent hover:underline">Forgot?</a> : null}
              </span>
            }
            htmlFor="kn-auth-password"
          >
            <PasswordInput id="kn-auth-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" showStrength={mode === "sign-up"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
          </Field>
          {mode === "sign-in" ? <Checkbox label="Keep me signed in" defaultChecked /> : null}
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" size="lg" loading={busy}>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="text-center text-xs text-subtle">
          By continuing you agree to the <a href="#terms" className="underline underline-offset-2">Terms</a> and <a href="#privacy" className="underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
