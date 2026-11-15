"use client";

import * as React from "react";
import { motion } from "motion/react";
import { AvatarStack, Button, CopyButton } from "@kineticui/ui";
import { GridBackground, Magnetic, RotatingWords } from "@kineticui/motion";
import { ArrowRightIcon, StarIcon } from "@kineticui/icons";

export type HeroCenteredProps = {
  announcement?: string;
  title?: string;
  rotating?: string[];
  description?: string;
  command?: string;
};

const fade = (d: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, type: "spring" as const, stiffness: 120, damping: 20 } });

/** Centred hero with announcement pill, rotating headline word, magnetic CTAs, install command and social proof. */
export function HeroCentered({
  announcement = "Kinetic 2.0 · 120 components",
  title = "Interfaces that feel",
  rotating = ["alive", "fast", "effortless", "yours"],
  description = "Motion-first React components for Next.js and Tailwind. Install from npm or copy the source with one command.",
  command = "npx @kineticui/cli init",
}: HeroCenteredProps) {
  return (
    <section className="relative isolate flex min-h-[720px] items-center justify-center overflow-hidden px-6 py-24">
      <GridBackground className="-z-10 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="flex max-w-3xl flex-col items-center gap-7 text-center">
        <motion.a {...fade(0)} href="#changelog" className="group flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 py-1 pl-1 pr-3 text-sm backdrop-blur">
          <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-accent-foreground">New</span>
          {announcement}
          <ArrowRightIcon size={14} className="text-subtle transition-transform group-hover:translate-x-0.5" />
        </motion.a>
        <motion.h1 {...fade(0.08)} className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          {title}
          <br />
          <RotatingWords words={rotating} className="text-accent" />
        </motion.h1>
        <motion.p {...fade(0.16)} className="max-w-xl text-lg leading-relaxed text-muted">
          {description}
        </motion.p>
        <motion.div {...fade(0.24)} className="flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Button size="lg" className="rounded-full px-6">
              Get started <ArrowRightIcon size={16} />
            </Button>
          </Magnetic>
          <Magnetic>
            <Button size="lg" variant="secondary" className="rounded-full px-6">
              Browse components
            </Button>
          </Magnetic>
        </motion.div>
        <motion.div {...fade(0.32)} className="flex items-center gap-2 rounded-xl border border-border bg-surface/80 py-1.5 pl-4 pr-1.5 font-mono text-sm backdrop-blur">
          <span className="text-accent">$</span>
          <span className="text-muted">{command}</span>
          <CopyButton value={command} />
        </motion.div>
        <motion.div {...fade(0.4)} className="flex items-center gap-3 text-sm text-muted">
          <AvatarStack size="sm" avatars={[{ alt: "Maya Kapoor", color: "#7C8CFF" }, { alt: "Rohan Joshi", color: "#F4A86A" }, { alt: "Rosa Silva", color: "#F0A3D0" }, { alt: "Kemi Okafor", color: "#6EE7A0" }]} />
          <span className="flex flex-col items-start">
            <span className="flex gap-0.5 text-[#F5C451]">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} size={12} fill="currentColor" />
              ))}
            </span>
            Loved by 12,000+ developers
          </span>
        </motion.div>
      </div>
    </section>
  );
}
