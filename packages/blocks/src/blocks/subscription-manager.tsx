"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, ConfirmDialog, DonutChart, Switch, toast } from "@kineticui/ui";

type Sub = { id: string; name: string; plan: string; price: number; next: string; color: string; active: boolean; category: string };
const initial: Sub[] = [
  { id: "1", name: "Figma", plan: "Professional", price: 15, next: "Dec 3", color: "#F0A3D0", active: true, category: "Design" },
  { id: "2", name: "Vercel", plan: "Pro", price: 20, next: "Dec 1", color: "#E8E8E3", active: true, category: "Dev" },
  { id: "3", name: "Notion", plan: "Plus", price: 10, next: "Nov 28", color: "#7C8CFF", active: true, category: "Productivity" },
  { id: "4", name: "Linear", plan: "Standard", price: 8, next: "Dec 9", color: "#C6F432", active: true, category: "Dev" },
  { id: "5", name: "Spotify", plan: "Duo", price: 15, next: "Nov 22", color: "#6EE7A0", active: false, category: "Fun" },
];

/** Recurring spend overview: donut by category, monthly total, pause toggles and cancel with confirmation. */
export function SubscriptionManager() {
  const [subs, setSubs] = React.useState(initial);
  const active = subs.filter((s) => s.active);
  const total = active.reduce((a, s) => a + s.price, 0);
  const byCat = Object.entries(active.reduce<Record<string, number>>((a, s) => ((a[s.category] = (a[s.category] ?? 0) + s.price), a), {})).map(([label, value]) => ({ label, value }));

  return (
    <section className="flex min-h-[680px] items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">Monthly spend</span>
            <span className="font-display text-5xl font-semibold tabular-nums">${total}</span>
            <span className="text-sm text-subtle">${total * 12} per year · {active.length} active</span>
          </div>
          <DonutChart data={byCat} size={130} thickness={14} label="per month" format={(v) => `$${v}`} />
        </div>
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {subs.map((s) => (
              <motion.li layout key={s.id} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                <span className="flex size-10 items-center justify-center rounded-xl font-display font-bold text-[#0b0c0e]" style={{ background: s.color, opacity: s.active ? 1 : 0.4 }}>{s.name[0]}</span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-2 font-medium">{s.name} <Badge size="sm">{s.plan}</Badge></span>
                  <span className="text-xs text-subtle">{s.active ? `Renews ${s.next}` : "Paused"}</span>
                </div>
                <span className="font-mono text-sm">${s.price}/mo</span>
                <Switch checked={s.active} onCheckedChange={(v) => setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, active: v } : x)))} aria-label={`${s.name} active`} />
                <ConfirmDialog
                  tone="destructive"
                  trigger={<Button variant="ghost" size="sm" className="text-subtle hover:text-danger">Cancel</Button>}
                  title={`Cancel ${s.name}?`}
                  description={`You'll keep access until ${s.next}. You can resubscribe anytime.`}
                  confirmLabel="Cancel subscription"
                  cancelLabel="Keep it"
                  onConfirm={() => { setSubs((xs) => xs.filter((x) => x.id !== s.id)); toast(`${s.name} cancelled`); }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}
