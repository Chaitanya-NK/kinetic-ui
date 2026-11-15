"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  avatar?: React.ReactNode;
  subtitle?: string;
  /** Places moved since last period (+ up, − down). */
  change?: number;
  /** Highlight as the current user. */
  isYou?: boolean;
};

const medal = ["#F5C451", "#C8CDD3", "#D99A63"];

/** Ranked list with podium medals, movement arrows and animated re-ordering. */
export function Leaderboard({
  entries,
  format = (n: number) => n.toLocaleString(),
  unit,
  className,
}: {
  entries: LeaderboardEntry[];
  format?: (n: number) => string;
  unit?: string;
  className?: string;
}) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const top = sorted[0]?.score || 1;
  return (
    <ol className={cn("flex flex-col gap-1.5", className)}>
      {sorted.map((e, i) => (
        <motion.li
          layout
          key={e.id}
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className={cn("relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5", e.isYou ? "border-accent/50 bg-accent-soft" : "border-transparent bg-surface")}
        >
          <motion.span
            className="absolute inset-y-0 left-0 bg-surface-raised"
            initial={{ width: 0 }}
            animate={{ width: `${(e.score / top) * 100}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            style={{ opacity: e.isYou ? 0 : 0.6 }}
            aria-hidden
          />
          <span
            className="relative flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
            style={i < 3 ? { background: medal[i], color: "#0b0c0e" } : undefined}
          >
            {i + 1}
          </span>
          {e.avatar ? <span className="relative">{e.avatar}</span> : null}
          <span className="relative flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {e.name}
              {e.isYou ? <span className="ml-2 font-mono text-[10px] uppercase text-accent">You</span> : null}
            </span>
            {e.subtitle ? <span className="truncate text-xs text-subtle">{e.subtitle}</span> : null}
          </span>
          {e.change ? (
            <span className={cn("relative font-mono text-[11px]", e.change > 0 ? "text-success" : "text-danger")}>
              {e.change > 0 ? "▲" : "▼"}
              {Math.abs(e.change)}
            </span>
          ) : (
            <span className="relative font-mono text-[11px] text-subtle">–</span>
          )}
          <span className="relative w-20 text-right font-mono text-sm font-semibold tabular-nums">
            {format(e.score)}
            {unit ? <span className="ml-1 text-[10px] font-normal text-subtle">{unit}</span> : null}
          </span>
        </motion.li>
      ))}
    </ol>
  );
}
