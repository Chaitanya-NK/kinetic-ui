"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button, Progress, SegmentedControl, toast } from "@kineticui/ui";
import { CardIcon, CheckIcon, DownloadIcon } from "@kineticui/icons";

const plans = [
  { id: "starter", name: "Starter", m: 0, features: ["3 projects", "Community support"] },
  { id: "pro", name: "Pro", m: 24, features: ["Unlimited projects", "All blocks", "Priority support"] },
  { id: "team", name: "Team", m: 79, features: ["Everything in Pro", "SSO & audit log", "10 seats included"] },
];
const invoices = [
  ["INV-2041", "Nov 1, 2026", "$24.00", "Paid"], ["INV-1987", "Oct 1, 2026", "$24.00", "Paid"], ["INV-1932", "Sep 1, 2026", "$24.00", "Paid"], ["INV-1880", "Aug 1, 2026", "$12.00", "Refunded"],
];

/** Billing settings: current plan with usage, plan switcher with monthly/yearly toggle, payment method and invoices. */
export function BillingPage() {
  const [cycle, setCycle] = React.useState("monthly");
  const [plan, setPlan] = React.useState("pro");
  const price = (m: number) => (cycle === "yearly" ? Math.round(m * 0.8) : m);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <div><h1 className="font-display text-2xl font-semibold">Billing</h1><p className="text-sm text-muted">Manage your plan, payment method and invoices.</p></div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between">
            <div><div className="text-xs text-subtle">Current plan</div><div className="font-display text-2xl font-semibold">{plans.find((p) => p.id === plan)!.name}</div></div>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <div className="flex flex-col gap-4">
            <Progress value={72} label="Projects · 18 of 25" showValue />
            <Progress value={41} label="Bandwidth · 41 GB of 100 GB" showValue />
            <Progress value={90} label="Seats · 9 of 10" showValue />
          </div>
          <p className="text-xs text-subtle">Renews on Dec 1, 2026 · ${price(plans.find((p) => p.id === plan)!.m)}/{cycle === "yearly" ? "mo, billed yearly" : "mo"}</p>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs text-subtle">Payment method</span>
          <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1f2937] to-[#0b0c0e] p-5 text-white">
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex justify-between"><CardIcon size={22} /><span className="font-semibold italic">VISA</span></div>
              <div className="font-mono tracking-[0.2em]">•••• •••• •••• 4242</div>
              <div className="flex justify-between text-xs text-white/60"><span>MAYA KAPOOR</span><span>08/29</span></div>
            </div>
          </div>
          <Button variant="secondary" size="sm">Update card</Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Change plan</h2>
          <SegmentedControl aria-label="Billing cycle" defaultValue="monthly" value={cycle} onValueChange={setCycle} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly −20%" }]} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((p) => (
            <motion.div key={p.id} layout className={`relative flex flex-col gap-3 rounded-2xl border p-5 ${plan === p.id ? "border-accent bg-accent-soft/20" : "border-border bg-surface"}`}>
              {plan === p.id ? <motion.span layoutId="kn-bill-cur" className="absolute -top-2.5 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">CURRENT</motion.span> : null}
              <span className="font-semibold">{p.name}</span>
              <span className="font-display text-3xl font-semibold">${price(p.m)}<span className="text-sm font-normal text-subtle">/mo</span></span>
              <ul className="flex flex-1 flex-col gap-1.5 text-sm text-muted">{p.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckIcon size={13} className="text-accent" />{f}</li>)}</ul>
              <Button variant={plan === p.id ? "secondary" : "primary"} size="sm" disabled={plan === p.id} onClick={() => { setPlan(p.id); toast.success(`Switched to ${p.name}`); }}>{plan === p.id ? "Current plan" : plans.findIndex((x) => x.id === p.id) > plans.findIndex((x) => x.id === plan) ? "Upgrade" : "Downgrade"}</Button>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">Invoices</h2>
        <div className="overflow-hidden rounded-2xl border border-border">
          {invoices.map(([id, date, amt, st]) => (
            <div key={id} className="flex items-center gap-4 border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-surface">
              <span className="w-24 font-mono text-xs">{id}</span><span className="flex-1 text-muted">{date}</span><span className="font-mono">{amt}</span>
              <Badge size="sm" variant={st === "Paid" ? "success" : "neutral"}>{st}</Badge>
              <Button size="icon-sm" variant="ghost" aria-label={`Download ${id}`}><DownloadIcon size={14} /></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
