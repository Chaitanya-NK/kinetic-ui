"use client";

import * as React from "react";
import { motion } from "motion/react";
import { SegmentedControl, Sparkline, StatCard } from "@kineticui/ui";

const data: Record<string, { label: string; value: number }[]> = {
  "7d": [{ label: "Visited pricing", value: 18420 }, { label: "Started trial", value: 4210 }, { label: "Invited a teammate", value: 2380 }, { label: "Added a card", value: 1140 }, { label: "Paid", value: 812 }],
  "30d": [{ label: "Visited pricing", value: 76200 }, { label: "Started trial", value: 16900 }, { label: "Invited a teammate", value: 9100 }, { label: "Added a card", value: 4700 }, { label: "Paid", value: 3420 }],
};
const sources = [["Organic search", 42, "#C6F432"], ["Direct", 24, "#7dd3fc"], ["Referral", 18, "#f9a8d4"], ["Social", 11, "#fcd34d"], ["Paid", 5, "#a78bfa"]] as const;

/** Conversion funnel dashboard: animated step bars with drop-off, KPIs and source breakdown; click a step to inspect. */
export function AnalyticsFunnel() {
  const [range, setRange] = React.useState("7d");
  const [sel, setSel] = React.useState(1);
  const steps = data[range]!;
  const top = steps[0]!.value;
  const fmt = (v: number) => v.toLocaleString("en-US");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl font-semibold">Trial to paid funnel</h1><p className="text-sm text-muted">Users who completed each step, in order.</p></div>
        <SegmentedControl aria-label="Range" defaultValue="7d" value={range} onValueChange={setRange} options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overall conversion" value={`${((steps.at(-1)!.value / top) * 100).toFixed(1)}%`} delta={0.6} hint="vs previous" chart={<Sparkline data={[3.1, 3.4, 3.2, 3.9, 4.1, 4.0, 4.4]} />} />
        <StatCard label="Paid accounts" value={fmt(steps.at(-1)!.value)} delta={12.4} hint="vs previous" />
        <StatCard label="Median time to pay" value="4.2 days" delta={-8.1} invertDelta hint="faster" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
          {steps.map((s, i) => {
            const pct = (s.value / top) * 100;
            const prev = i ? steps[i - 1]!.value : s.value;
            const drop = i ? 100 - (s.value / prev) * 100 : 0;
            return (
              <button key={s.label} type="button" onClick={() => setSel(i)} className={`flex flex-col gap-1.5 rounded-xl p-3 text-left transition-colors ${sel === i ? "bg-surface-raised" : "hover:bg-surface-raised/50"}`}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium"><span className="mr-2 font-mono text-xs text-subtle">{i + 1}</span>{s.label}</span>
                  <span className="font-mono">{fmt(s.value)} <span className="text-xs text-subtle">{pct.toFixed(1)}%</span></span>
                </div>
                <div className="relative h-8 overflow-hidden rounded-lg bg-surface-overlay">
                  <motion.div key={range + i} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 90, damping: 20, delay: i * 0.08 }} className="h-full rounded-lg" style={{ background: `color-mix(in oklab, var(--kn-accent) ${100 - i * 14}%, var(--kn-info))` }} />
                </div>
                {i ? <span className="text-xs text-danger">−{drop.toFixed(1)}% dropped from previous step</span> : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-4">
          <motion.div key={`${range}-${sel}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 rounded-2xl border border-accent/40 bg-surface p-5">
            <span className="text-xs text-subtle">Step {sel + 1}</span>
            <span className="font-semibold">{steps[sel]!.label}</span>
            <span className="font-display text-3xl font-semibold">{fmt(steps[sel]!.value)}</span>
            <span className="text-sm text-muted">{sel ? `${fmt(steps[sel - 1]!.value - steps[sel]!.value)} users didn't reach this step.` : "Entry point for the funnel."}</span>
          </motion.div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <span className="text-sm font-semibold">Top sources</span>
            <div className="flex h-2 overflow-hidden rounded-full">
              {sources.map(([l, v, c], i) => <motion.span key={l} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 0.3 + i * 0.06 }} style={{ background: c }} />)}
            </div>
            {sources.map(([l, v, c]) => <div key={l} className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full" style={{ background: c }} /><span className="flex-1 text-muted">{l}</span><span className="font-mono">{v}%</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
