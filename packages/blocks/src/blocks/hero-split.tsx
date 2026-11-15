"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button, Input, Sparkline, toast } from "@kineticui/ui";
import { NumberTicker, TiltCard } from "@kineticui/motion";
import { CheckIcon, MailIcon } from "@kineticui/icons";

/** Two-column hero: copy and email capture on the left, a tilting live product card on the right. */
export function HeroSplit({
  title = "Close your books in minutes, not weeks",
  description = "Ledger reconciles every transaction automatically, flags what needs a human, and keeps your team in sync.",
}: {
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = React.useState("");
  return (
    <section className="mx-auto grid min-h-[720px] max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="flex flex-col gap-6">
        <Badge variant="soft" dot="pulse" className="w-fit">Now with AI categorisation</Badge>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
        <p className="max-w-lg text-lg leading-relaxed text-muted">{description}</p>
        <form
          className="flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            toast({ title: `We'll be in touch at ${email || "your inbox"}`, tone: "success" });
            setEmail("");
          }}
        >
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" leading={<MailIcon size={15} />} wrapperClassName="flex-1" aria-label="Work email" />
          <Button type="submit" size="lg">Start free trial</Button>
        </form>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {["14-day free trial", "No card required", "SOC 2 Type II"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <CheckIcon size={14} className="text-accent" /> {t}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 20 }}>
        <TiltCard max={8}>
          <div className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-border-strong bg-surface p-6 shadow-overlay">
            <div className="absolute -right-20 -top-20 size-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Cash balance</span>
              <Badge size="sm" variant="success">+8.2%</Badge>
            </div>
            <div className="flex items-end justify-between">
              <span className="font-display text-5xl font-semibold tabular-nums">
                <NumberTicker value={284190} prefix="$" />
              </span>
              <Sparkline data={[12, 14, 13, 17, 16, 19, 22, 21, 26, 28]} width={120} height={48} />
            </div>
            <div className="flex flex-col gap-2">
              {[
                { n: "Stripe payout", a: "+$12,480.00", c: "text-success" },
                { n: "AWS", a: "−$3,204.11", c: "text-foreground" },
                { n: "Figma", a: "−$540.00", c: "text-foreground" },
              ].map((r, i) => (
                <motion.div key={r.n} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3 rounded-xl bg-surface-raised px-3 py-2.5 text-sm">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-surface-overlay font-mono text-[11px]">{r.n[0]}</span>
                  <span className="flex-1">{r.n}</span>
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <CheckIcon size={12} /> Matched
                  </span>
                  <span className={`w-24 text-right font-mono ${r.c}`}>{r.a}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}
