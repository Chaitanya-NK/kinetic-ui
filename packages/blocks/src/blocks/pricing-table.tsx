"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { Badge, Button, SegmentedControl } from "@kineticui/ui";
import { BorderBeam, NumberTicker } from "@kineticui/motion";
import { CheckIcon, MinusIcon } from "@kineticui/icons";

export type PricingTier = { name: string; monthly: number; description: string; features: string[]; cta: string; featured?: boolean };

const defaultTiers: PricingTier[] = [
  { name: "Starter", monthly: 0, description: "For side projects and trying things out.", features: ["3 projects", "1 GB storage", "Community support"], cta: "Start free" },
  { name: "Pro", monthly: 24, description: "For growing teams that ship every week.", features: ["Unlimited projects", "100 GB storage", "Priority support", "Advanced analytics", "Custom domains"], cta: "Start 14-day trial", featured: true },
  { name: "Enterprise", monthly: 79, description: "For organisations with security needs.", features: ["Everything in Pro", "SSO & SCIM", "Audit logs", "99.99% SLA", "Dedicated manager"], cta: "Contact sales" },
];

const compare = [
  { label: "Projects", values: ["3", "Unlimited", "Unlimited"] },
  { label: "Team members", values: ["1", "25", "Unlimited"] },
  { label: "Custom domains", values: [false, true, true] },
  { label: "SSO", values: [false, false, true] },
  { label: "Audit logs", values: [false, false, true] },
];

/** Three-tier pricing with monthly/yearly toggle, animated prices, featured plan and comparison table. */
export function PricingTable({ tiers = defaultTiers, yearlyDiscount = 0.2 }: { tiers?: PricingTier[]; yearlyDiscount?: number }) {
  const [period, setPeriod] = React.useState("yearly");
  const yearly = period === "yearly";
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-24">
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Simple, honest pricing</h2>
        <p className="text-lg text-muted">Start free. Upgrade when you&apos;re ready. Cancel anytime.</p>
        <div className="flex items-center gap-3">
          <SegmentedControl value={period} defaultValue="yearly" onValueChange={setPeriod} options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]} />
          <Badge variant="soft" size="sm">Save {Math.round(yearlyDiscount * 100)}%</Badge>
        </div>
      </div>
      <div className="grid w-full gap-4 md:grid-cols-3">
        {tiers.map((t) => {
          const price = yearly ? Math.round(t.monthly * (1 - yearlyDiscount)) : t.monthly;
          return (
            <div key={t.name} className={cn("relative flex flex-col gap-6 overflow-hidden rounded-3xl border p-7", t.featured ? "border-accent/50 bg-surface-raised shadow-[0_20px_60px_-20px_var(--kn-ring)] md:-my-3 md:py-10" : "border-border bg-surface")}>
              {t.featured ? <BorderBeam /> : null}
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{t.name}</span>
                {t.featured ? <Badge variant="solid" size="sm">Most popular</Badge> : null}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tabular-nums tracking-tight">
                  <NumberTicker value={price} prefix="$" duration={0.6} />
                </span>
                <span className="text-sm text-subtle">/ seat / mo</span>
              </div>
              <span className="-mt-4 h-4 text-xs text-subtle">{yearly && t.monthly ? `Billed $${price * 12} yearly` : ""}</span>
              <p className="text-sm text-muted">{t.description}</p>
              <Button variant={t.featured ? "primary" : "secondary"} size="lg">{t.cta}</Button>
              <ul className="flex flex-col gap-2.5 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <CheckIcon size={12} strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="w-full overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium text-muted">Compare plans</th>
              {tiers.map((t) => (
                <th key={t.name} className={cn("p-4 text-center font-semibold", t.featured && "text-accent")}>{t.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="p-4 text-muted">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="p-4 text-center">
                    {typeof v === "boolean" ? (v ? <CheckIcon size={16} className="mx-auto text-accent" /> : <MinusIcon size={16} className="mx-auto text-subtle" />) : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
