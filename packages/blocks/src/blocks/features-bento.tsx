"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Kbd, Presence, Switch } from "@kineticui/ui";
import { ScrollReveal, SpotlightCard } from "@kineticui/motion";
import { BoltIcon, GlobeIcon, LockIcon, SparkleIcon } from "@kineticui/icons";

function Cell({ className = "", title, body, icon, children }: { className?: string; title: string; body: string; icon: React.ReactNode; children?: React.ReactNode }) {
  return (
    <SpotlightCard className={`flex flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-surface p-6 ${className}`}>
      <div className="min-h-32 flex-1">{children}</div>
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 font-semibold [&_svg]:size-4 [&_svg]:text-accent">
          {icon}
          {title}
        </span>
        <p className="text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </SpotlightCard>
  );
}

/** Bento grid of features, each cell with its own small live visual and a cursor spotlight. */
export function FeaturesBento({ title = "Everything you need. Nothing you don't.", eyebrow = "Features" }: { title?: string; eyebrow?: string }) {
  const [on, setOn] = React.useState(true);
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24">
      <ScrollReveal className="flex max-w-2xl flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">{eyebrow}</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      </ScrollReveal>
      <div className="grid auto-rows-[minmax(260px,auto)] gap-4 md:grid-cols-3">
        <Cell className="md:col-span-2" icon={<BoltIcon />} title="Blazing fast" body="Every interaction lands in under 50ms. Optimistic updates mean you never wait for the network.">
          <div className="flex h-full items-end gap-2">
            {[40, 65, 52, 80, 70, 95, 88, 100].map((h, i) => (
              <motion.span key={i} className="flex-1 rounded-t-lg bg-accent/80" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: i * 0.05, type: "spring", stiffness: 90, damping: 16 }} />
            ))}
          </div>
        </Cell>
        <Cell icon={<GlobeIcon />} title="Real-time together" body="See who's here, follow their cursor, comment in context.">
          <div className="flex h-full items-center justify-center">
            <Presence size={40} users={[{ id: "1", name: "Maya Kapoor", color: "#7C8CFF", status: "active" }, { id: "2", name: "Rohan Joshi", color: "#F4A86A", status: "active" }, { id: "3", name: "Rosa Silva", color: "#F0A3D0", status: "idle" }]} />
          </div>
        </Cell>
        <Cell icon={<SparkleIcon />} title="AI that helps" body="Draft, summarise and refactor with a model that knows your workspace.">
          <div className="flex h-full flex-col justify-center gap-2 font-mono text-xs">
            <span className="w-fit rounded-lg bg-surface-raised px-3 py-2 text-muted">Summarise this thread</span>
            <motion.span initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="w-fit self-end rounded-lg bg-accent-soft px-3 py-2 text-accent">
              3 decisions, 2 open questions ✓
            </motion.span>
          </div>
        </Cell>
        <Cell icon={<LockIcon />} title="Private by default" body="SSO, audit logs and granular roles. Your data never trains our models.">
          <div className="flex h-full flex-col justify-center gap-3">
            <Switch checked={on} onCheckedChange={setOn} label="Enforce SSO" />
            <Switch defaultChecked label="Audit log" />
          </div>
        </Cell>
        <Cell icon={<BoltIcon />} title="Keyboard first" body="Every action is one shortcut away. Press ⌘K and just type.">
          <div className="flex h-full items-center justify-center gap-2">
            <Kbd className="px-3 py-2 text-lg">⌘</Kbd>
            <Kbd className="px-3 py-2 text-lg">K</Kbd>
          </div>
        </Cell>
      </div>
    </section>
  );
}
