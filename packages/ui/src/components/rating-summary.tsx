"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type RatingSummaryProps = {
  /** Count of ratings per star, index 0 = 1 star … index 4 = 5 stars. */
  counts: [number, number, number, number, number];
  /** Common themes with sentiment, e.g. { label: "Fast setup", count: 84, sentiment: "positive" }. */
  aspects?: { label: string; score: number }[];
  onFilter?: (stars: number | null) => void;
  className?: string;
};

function Star({ fill }: { fill: number }) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#F5C451" />
          <stop offset={`${fill * 100}%`} stopColor="var(--kn-border-strong)" />
        </linearGradient>
      </defs>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill={`url(#${id})`} />
    </svg>
  );
}

/** Compact rating overview: average with partial stars, clickable distribution bars and aspect scores. */
export function RatingSummary({ counts, aspects, onFilter, className }: RatingSummaryProps) {
  const [active, setActive] = React.useState<number | null>(null);
  const total = counts.reduce((a, b) => a + b, 0);
  const avg = total ? counts.reduce((a, n, i) => a + n * (i + 1), 0) / total : 0;
  const recommend = total ? Math.round(((counts[3] + counts[4]) / total) * 100) : 0;

  return (
    <div className={cn("flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center">
          <span className="font-display text-5xl font-semibold tracking-tight tabular-nums">{avg.toFixed(1)}</span>
          <span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <Star key={i} fill={Math.max(0, Math.min(1, avg - i))} />)}</span>
          <span className="mt-1 text-xs text-subtle">{total.toLocaleString("en-US")} ratings</span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {[5, 4, 3, 2, 1].map((s) => {
            const n = counts[s - 1]!;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active === s}
                onClick={() => {
                  const next = active === s ? null : s;
                  setActive(next);
                  onFilter?.(next);
                }}
                className={cn("flex items-center gap-2 rounded-md px-1 py-0.5 text-xs transition-opacity", active && active !== s && "opacity-40")}
              >
                <span className="w-2 font-mono text-subtle">{s}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised">
                  <motion.span className="block h-full rounded-full bg-[#F5C451]" initial={{ width: 0 }} animate={{ width: `${total ? (n / total) * 100 : 0}%` }} transition={{ type: "spring", stiffness: 90, damping: 20, delay: (5 - s) * 0.05 }} />
                </span>
                <span className="w-10 text-right font-mono text-subtle">{total ? Math.round((n / total) * 100) : 0}%</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-sm text-success">
        <span className="font-semibold">{recommend}%</span> would recommend this
      </div>
      {aspects?.length ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {aspects.map((a) => (
            <div key={a.label} className="flex flex-col gap-1">
              <span className="flex justify-between text-xs">
                <span className="text-muted">{a.label}</span>
                <span className="font-mono">{a.score.toFixed(1)}</span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
                <motion.span className={cn("block h-full rounded-full", a.score >= 4 ? "bg-success" : a.score >= 3 ? "bg-warning" : "bg-danger")} initial={{ width: 0 }} animate={{ width: `${(a.score / 5) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
