"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { AvatarStack, Button, Input } from "@kineticui/ui";
import { CheckIcon, MailIcon } from "@kineticui/icons";

/** Newsletter card: email capture with validation, loading and an animated success state. */
export function NewsletterSignup({
  title = "The Motion Letter",
  description = "One email a month with the best UI animation techniques, components and teardown videos. No spam.",
  onSubscribe,
}: {
  title?: string;
  description?: string;
  onSubscribe?: (email: string) => Promise<void> | void;
}) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    setState("loading");
    await (onSubscribe?.(email) ?? new Promise((r) => setTimeout(r, 900)));
    setState("done");
  };
  return (
    <section className="flex min-h-[480px] items-center justify-center px-6 py-20">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-10">
        <div className="absolute -right-24 -top-24 size-64 rounded-full bg-accent/15 blur-3xl" />
        <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <MailIcon size={20} />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted">{description}</p>
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3 rounded-xl bg-accent-soft p-4 text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <CheckIcon size={14} strokeWidth={3} />
              </span>
              <span>
                You&apos;re in! Check <b>{email}</b> to confirm.
              </span>
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="mt-6 flex flex-col gap-2" noValidate>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }} placeholder="you@example.com" invalid={state === "error"} wrapperClassName="flex-1" aria-label="Email" />
                <Button type="submit" loading={state === "loading"}>Subscribe</Button>
              </div>
              {state === "error" ? <span className="text-xs text-danger">Please enter a valid email.</span> : null}
            </motion.form>
          )}
        </AnimatePresence>
        <div className="mt-6 flex items-center gap-3 text-sm text-subtle">
          <AvatarStack size="sm" avatars={[{ alt: "Maya Kapoor", color: "#7C8CFF" }, { alt: "Rohan Joshi", color: "#F4A86A" }, { alt: "Rosa Silva", color: "#F0A3D0" }]} />
          Join 8,400 readers
        </div>
      </div>
    </section>
  );
}
