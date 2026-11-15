"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type HeatmapProps = {
  /** Map of ISO date (YYYY-MM-DD) to count. */
  values: Record<string, number>;
  /** Last day shown. Defaults to today. */
  endDate?: Date;
  weeks?: number;
  /** Text for the tooltip, e.g. (n) => `${n} commits`. */
  label?: (count: number, date: Date) => string;
  className?: string;
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** GitHub-style contribution calendar. */
export function Heatmap({ values, endDate, weeks = 26, label = (n) => `${n} contributions`, className }: HeatmapProps) {
  const [hover, setHover] = React.useState<{ text: string; x: number; y: number } | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const end = React.useMemo(() => {
    const d = endDate ? new Date(endDate) : new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, [endDate]);
  const start = new Date(end);
  start.setDate(end.getDate() - end.getDay() - (weeks - 1) * 7);
  const max = Math.max(1, ...Object.values(values));
  const level = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
  const shades = ["var(--kn-surface-raised)", "color-mix(in oklab, var(--kn-accent) 30%, var(--kn-surface-raised))", "color-mix(in oklab, var(--kn-accent) 55%, var(--kn-surface-raised))", "color-mix(in oklab, var(--kn-accent) 78%, var(--kn-surface-raised))", "var(--kn-accent)"];

  const cols = Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      return date;
    }),
  );

  return (
    <div ref={ref} className={cn("relative inline-flex flex-col gap-2", className)} onPointerLeave={() => setHover(null)}>
      <div className="flex gap-[3px] pl-7 text-[10px] text-subtle">
        {cols.map((c, i) => (
          <span key={i} className="w-3 overflow-visible whitespace-nowrap">
            {c[0]!.getDate() <= 7 ? months[c[0]!.getMonth()] : ""}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex w-6 flex-col gap-[3px] text-[10px] text-subtle">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
            <span key={i} className="h-3 leading-3">
              {d}
            </span>
          ))}
        </div>
        {cols.map((c, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {c.map((date) => {
              if (date > end) return <span key={iso(date)} className="size-3" />;
              const n = values[iso(date)] ?? 0;
              return (
                <span
                  key={iso(date)}
                  className="size-3 rounded-[3px] transition-transform hover:scale-125"
                  style={{ background: shades[level(n)] }}
                  onPointerEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const p = ref.current!.getBoundingClientRect();
                    setHover({ text: `${label(n, date)} · ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`, x: r.left - p.left + 6, y: r.top - p.top });
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 text-[10px] text-subtle">
        Less
        {shades.map((s) => (
          <span key={s} className="size-3 rounded-[3px]" style={{ background: s }} />
        ))}
        More
      </div>
      {hover ? (
        <span className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+6px)] whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background" style={{ left: hover.x, top: hover.y }}>
          {hover.text}
        </span>
      ) : null}
    </div>
  );
}
