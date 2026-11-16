"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { defaultFormat } from "./charts";

export type BarListItem = { name: string; value: number; icon?: React.ReactNode; href?: string; color?: string };

export type BarListProps = {
  items: BarListItem[];
  format?: (v: number) => string;
  /** Sort largest first. */
  sorted?: boolean;
  /** Show only this many, with a "Show all" toggle. */
  limit?: number;
  /** Show share of total next to each value. */
  showPercent?: boolean;
  onItemClick?: (item: BarListItem) => void;
  className?: string;
};

/** Ranked horizontal bars with labels inside them: top pages, referrers, countries. Bars grow in on mount. */
export function BarList({ items, format = defaultFormat, sorted = true, limit, showPercent = false, onItemClick, className }: BarListProps) {
  const [all, setAll] = React.useState(false);
  const list = sorted ? [...items].sort((a, b) => b.value - a.value) : items;
  const shown = limit && !all ? list.slice(0, limit) : list;
  const max = Math.max(1, ...list.map((i) => i.value));
  const total = list.reduce((a, i) => a + i.value, 0) || 1;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {shown.map((it, i) => {
        const Row = it.href ? "a" : onItemClick ? "button" : "div";
        return (
          <motion.div key={it.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
            <Row
              {...(it.href ? { href: it.href } : {})}
              {...(onItemClick && !it.href ? { type: "button" as const, onClick: () => onItemClick(it) } : {})}
              className={cn("group relative flex h-9 min-w-0 flex-1 items-center rounded-lg text-left text-sm", (it.href || onItemClick) && "cursor-pointer")}
            >
              <motion.span
                className="absolute inset-y-0 left-0 rounded-lg transition-[filter] group-hover:brightness-125"
                style={{ background: it.color ? `color-mix(in srgb, ${it.color} 30%, transparent)` : "var(--kn-accent-soft)" }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, (it.value / max) * 100)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
              />
              <span className="relative flex min-w-0 items-center gap-2 px-3">
                {it.icon ? <span className="flex shrink-0 text-muted [&_svg]:size-4">{it.icon}</span> : null}
                <span className="truncate group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-2">{it.name}</span>
              </span>
            </Row>
            <span className="shrink-0 text-right font-mono text-sm tabular-nums">
              {format(it.value)}
              {showPercent ? <span className="ml-2 inline-block w-10 text-xs text-subtle">{Math.round((it.value / total) * 100)}%</span> : null}
            </span>
          </motion.div>
        );
      })}
      {limit && list.length > limit ? (
        <button type="button" onClick={() => setAll((a) => !a)} className="mt-1 self-start rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-surface-overlay hover:text-foreground">
          {all ? "Show less" : `Show all ${list.length}`}
        </button>
      ) : null}
    </div>
  );
}
