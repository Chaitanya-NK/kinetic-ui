"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type UsageSegment = { label: string; value: number; color?: string };

export type UsageMeterProps = {
  title?: string;
  /** Usage broken down by category; summed for the total. */
  segments: UsageSegment[];
  limit: number;
  unit?: string;
  /** e.g. "Resets in 3 days". */
  footnote?: React.ReactNode;
  /** Shown when usage passes 80%. */
  action?: React.ReactNode;
  format?: (n: number) => string;
  className?: string;
};

const palette = ["var(--kn-accent)", "#7C8CFF", "#F4A86A", "#F0A3D0", "#6EE7A0"];
const compact = (n: number) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : String(n));

/** Plan usage bar (tokens, credits, seats) with per-category breakdown and limit warnings. */
export function UsageMeter({ title = "Usage", segments, limit, unit = "", footnote, action, format = compact, className }: UsageMeterProps) {
  const used = segments.reduce((a, s) => a + s.value, 0);
  const pct = Math.min(100, (used / limit) * 100);
  const level = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  let left = 0;
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <span className="font-mono text-xs text-muted">
          <span className={cn("text-sm font-semibold", level === "over" ? "text-danger" : level === "warn" ? "text-warning" : "text-foreground")}>{format(used)}</span> / {format(limit)} {unit}
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-raised" role="meter" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used} aria-label={title}>
        {segments.map((s, i) => {
          const w = (s.value / Math.max(limit, used)) * 100;
          const el = (
            <motion.span
              key={s.label}
              className="absolute inset-y-0"
              style={{ left: `${left}%`, background: s.color ?? palette[i % palette.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${w}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20, delay: i * 0.08 }}
            />
          );
          left += w;
          return el;
        })}
        <span className="absolute inset-y-0 left-[80%] w-px bg-background/60" aria-hidden />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {segments.map((s, i) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: s.color ?? palette[i % palette.length] }} />
            {s.label}
            <span className="font-mono text-subtle">{format(s.value)}</span>
          </span>
        ))}
      </div>
      {level !== "ok" || footnote ? (
        <div className="flex items-center gap-3 border-t border-border pt-3 text-xs">
          {level !== "ok" ? (
            <span className={cn("flex-1", level === "over" ? "text-danger" : "text-warning")}>
              {level === "over" ? "You've reached your limit." : `You've used ${Math.round(pct)}% of your plan.`}
            </span>
          ) : (
            <span className="flex-1 text-subtle">{footnote}</span>
          )}
          {level !== "ok" ? action : null}
        </div>
      ) : null}
    </div>
  );
}
