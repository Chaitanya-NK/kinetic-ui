"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type UptimeDay = { date: string; status: "up" | "degraded" | "down" | "none"; note?: string };

export type UptimeBarsProps = {
  name: string;
  days: UptimeDay[];
  /** Overrides the computed uptime percentage. */
  uptime?: number;
  className?: string;
};

const color = { up: "bg-success", degraded: "bg-warning", down: "bg-danger", none: "bg-surface-overlay" };
const text = { up: "Operational", degraded: "Degraded performance", down: "Outage", none: "No data" };

/** Status-page style uptime history for one service. */
export function UptimeBars({ name, days, uptime, className }: UptimeBarsProps) {
  const [hover, setHover] = React.useState<number | null>(null);
  const counted = days.filter((d) => d.status !== "none");
  const pct = uptime ?? (counted.length ? (counted.reduce((a, d) => a + (d.status === "up" ? 1 : d.status === "degraded" ? 0.98 : 0.9), 0) / counted.length) * 100 : 100);
  const current = days.at(-1)?.status ?? "none";
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("size-2 rounded-full", color[current])} />
        <span className="font-medium">{name}</span>
        <span className="ml-auto font-mono text-xs text-muted">{pct.toFixed(2)}% uptime</span>
      </div>
      <div className="relative flex h-8 gap-[2px]" onPointerLeave={() => setHover(null)}>
        {days.map((d, i) => (
          <span
            key={d.date}
            onPointerEnter={() => setHover(i)}
            className={cn("flex-1 rounded-[3px] transition-[transform,opacity]", color[d.status], hover !== null && hover !== i && "opacity-50", hover === i && "scale-y-110")}
          />
        ))}
        {hover !== null ? (
          <div
            className="pointer-events-none absolute bottom-full z-10 mb-2 w-48 -translate-x-1/2 rounded-lg border border-border-strong bg-surface-overlay p-2.5 text-xs shadow-overlay"
            style={{ left: `${((hover + 0.5) / days.length) * 100}%` }}
          >
            <div className="font-mono text-subtle">{days[hover]!.date}</div>
            <div className="mt-1 flex items-center gap-1.5 font-medium">
              <span className={cn("size-2 rounded-full", color[days[hover]!.status])} />
              {text[days[hover]!.status]}
            </div>
            {days[hover]!.note ? <div className="mt-1 text-muted">{days[hover]!.note}</div> : null}
          </div>
        ) : null}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-subtle">
        <span>{days.length} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
