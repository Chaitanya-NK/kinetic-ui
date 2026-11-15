import * as React from "react";
import { cn } from "@kineticui/core";

export type StatCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
  /** Percent change, e.g. 12.4 or -3.1. */
  delta?: number;
  /** Treat a decrease as good (e.g. churn, latency). */
  invertDelta?: boolean;
  /** Context for the delta, e.g. "vs last week". */
  hint?: string;
  icon?: React.ReactNode;
  /** A chart such as <Sparkline />. */
  chart?: React.ReactNode;
};

/** KPI tile with value, trend delta and optional sparkline. */
export function StatCard({ label, value, delta, invertDelta, hint, icon, chart, className, ...props }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  const good = invertDelta ? !up : up;
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5", className)} {...props}>
      <div className="flex items-center gap-2 text-sm text-muted">
        {icon ? <span className="flex size-7 items-center justify-center rounded-lg bg-surface-raised text-foreground [&_svg]:size-3.5">{icon}</span> : null}
        {label}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
          {delta !== undefined ? (
            <span className="flex items-center gap-1.5 whitespace-nowrap text-xs">
              <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono font-medium", good ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                {up ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
              </span>
              {hint ? <span className="text-subtle">{hint}</span> : null}
            </span>
          ) : hint ? (
            <span className="text-xs text-subtle">{hint}</span>
          ) : null}
        </div>
        {chart ? <span className="shrink-0">{chart}</span> : null}
      </div>
    </div>
  );
}
