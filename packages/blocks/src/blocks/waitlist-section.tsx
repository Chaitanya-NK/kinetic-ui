"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, CopyButton, Countdown, Input, Progress } from "@kineticui/ui";
import { NumberTicker } from "@kineticui/motion";
import { ArrowRightIcon } from "@kineticui/icons";

/** Pre-launch waitlist: countdown, email capture, then your place in line with a referral link to move up. */
export function WaitlistSection({
  title = "Something new is coming",
  description = "Be first in line for early access. Invite friends to jump the queue.",
  launch,
  shareBase = "https://kinetic.app/w/",
}: {
  title?: string;
  description?: string;
  launch?: Date | string;
  shareBase?: string;
}) {
  const [launchAt] = React.useState(() => launch ?? new Date(Date.now() + (12 * 24 + 5) * 3600_000));
  const [email, setEmail] = React.useState("");
  const [joined, setJoined] = React.useState<{ place: number; code: string } | null>(null);
  const [refs, setRefs] = React.useState(0);

  return (
    <section className="relative isolate flex min-h-[640px] items-center justify-center overflow-hidden px-6 py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--kn-accent-soft),transparent_60%)]" />
      <div className="flex w-full max-w-xl flex-col items-center gap-7 text-center">
        <span className="rounded-full border border-border-strong px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">Launching soon</span>
        <h2 className="font-display text-5xl font-semibold tracking-tight">{title}</h2>
        <p className="text-lg text-muted">{description}</p>
        <Countdown to={launchAt} compact />
        <AnimatePresence mode="wait">
          {joined ? (
            <motion.div key="in" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full flex-col gap-4 rounded-3xl border border-border bg-surface p-6 text-left">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">Your place in line</span>
                <span className="font-display text-4xl font-semibold tabular-nums text-accent">
                  #<NumberTicker value={Math.max(1, joined.place - refs * 250)} />
                </span>
              </div>
              <Progress value={Math.min(100, refs * 34)} label={`${refs}/3 friends invited`} />
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
                <span className="flex-1 truncate font-mono text-xs text-muted">{shareBase + joined.code}</span>
                <CopyButton value={shareBase + joined.code} label="Copy" onCopied={() => setRefs((r) => Math.min(3, r + 1))} />
              </div>
              <span className="text-xs text-subtle">Each friend who joins moves you up 250 spots.</span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0, y: -8 }}
              className="flex w-full flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\S+@\S+\.\S+$/.test(email)) return;
                setJoined({ place: 1284, code: email.split("@")[0]!.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "friend" });
              }}
            >
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" wrapperClassName="flex-1" aria-label="Email" />
              <Button type="submit" size="lg">Join the waitlist <ArrowRightIcon size={15} /></Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
