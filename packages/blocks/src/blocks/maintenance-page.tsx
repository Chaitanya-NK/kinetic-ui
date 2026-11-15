"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Countdown, Progress, Switch, Timeline } from "@kineticui/ui";
import { CheckIcon, SettingsIcon } from "@kineticui/icons";

/** Scheduled maintenance: spinning gear, countdown to return, progress steps and an opt-in notification. */
export function MaintenancePage({ backAt }: { backAt?: Date | string }) {
  const [until] = React.useState(() => backAt ?? new Date(Date.now() + 47 * 60_000));
  return (
    <section className="flex min-h-[760px] items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-7 text-center">
        <div className="relative size-20">
          <motion.span className="absolute inset-0 flex items-center justify-center text-accent" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
            <SettingsIcon size={72} strokeWidth={1.2} />
          </motion.span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">We&apos;re upgrading things</h1>
          <p className="text-muted">Scheduled maintenance to make everything faster. Your data is safe.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-subtle">Back in about</span>
          <Countdown to={until} compact />
        </div>
        <div className="w-full rounded-2xl border border-border bg-surface p-5 text-left">
          <Progress value={62} label="Migrating databases" showValue striped />
          <Timeline
            className="mt-5"
            items={[
              { title: "Backups verified", time: "02:01", tone: "success", icon: <CheckIcon /> },
              { title: "Migrating databases", time: "02:14", tone: "accent", description: "3 of 5 regions done" },
              { title: "Warming caches", time: "pending" },
            ]}
          />
        </div>
        <Switch label="Email me when you're back" defaultChecked />
      </div>
    </section>
  );
}
