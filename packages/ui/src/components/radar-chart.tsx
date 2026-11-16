"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChartTooltip, chartPalette, defaultFormat, type ChartSeries, type ChartTip } from "./charts";

export type RadarChartProps<T extends Record<string, unknown>> = {
  /** One row per axis (e.g. per skill). */
  data: T[];
  /** Field holding the axis label. */
  index: keyof T & string;
  series: ChartSeries[];
  /** Max value of every axis. Defaults to the largest value. */
  max?: number;
  rings?: number;
  size?: number;
  format?: (v: number) => string;
  showLegend?: boolean;
  className?: string;
};

/** Spider / radar chart for comparing a few series across several dimensions. Polygons grow from the centre. */
export function RadarChart<T extends Record<string, unknown>>({ data, index, series, max, rings = 4, size = 320, format = defaultFormat, showLegend = true, className }: RadarChartProps<T>) {
  const [tip, setTip] = React.useState<ChartTip>(null);
  const [active, setActive] = React.useState<string | null>(null);
  const top = max ?? Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0))));
  const c = size / 2, R = size / 2 - 44;
  const n = data.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / top), c + Math.sin(a) * R * (v / top)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <div className={cn("relative flex flex-col items-center", className)} onPointerLeave={() => setTip(null)}>
      {showLegend && series.length > 1 ? (
        <div className="mb-2 flex flex-wrap justify-center gap-4 text-xs text-muted">
          {series.map((s, i) => (
            <button key={s.key} type="button" onPointerEnter={() => setActive(s.key)} onPointerLeave={() => setActive(null)} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: s.color ?? chartPalette[i] }} />
              {s.name ?? s.key}
            </button>
          ))}
        </div>
      ) : null}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar chart" className="max-w-full overflow-visible">
        {Array.from({ length: rings }, (_, r) => (
          <polygon key={r} points={poly(Array(n).fill((top * (r + 1)) / rings))} fill="none" stroke="var(--kn-border)" strokeDasharray={r === rings - 1 ? undefined : "3 4"} />
        ))}
        {data.map((d, i) => {
          const [x, y] = pt(i, top);
          const [lx, ly] = pt(i, top * 1.16);
          return (
            <g key={i}>
              <line x1={c} y1={c} x2={x} y2={y} stroke="var(--kn-border)" />
              <text x={lx} y={ly} textAnchor={Math.abs(lx - c) < 4 ? "middle" : lx > c ? "start" : "end"} dominantBaseline="middle" className="fill-[var(--kn-muted)] text-[11px]">
                {String(d[index])}
              </text>
            </g>
          );
        })}
        {series.map((s, j) => {
          const col = s.color ?? chartPalette[j]!;
          const vals = data.map((d) => Number(d[s.key] ?? 0));
          const dim = active && active !== s.key;
          return (
            <motion.g key={s.key} style={{ transformOrigin: `${c}px ${c}px` }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: dim ? 0.2 : 1 }} transition={{ type: "spring", stiffness: 120, damping: 16, delay: j * 0.12 }}>
              <polygon points={poly(vals)} fill={col} fillOpacity={0.16} stroke={col} strokeWidth={2} strokeLinejoin="round" />
              {vals.map((v, i) => {
                const [x, y] = pt(i, v);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={4}
                    fill="var(--kn-background)"
                    stroke={col}
                    strokeWidth={2}
                    onPointerEnter={() => setTip({ x, y, label: String(data[i]![index]), rows: series.map((t, k) => ({ name: t.name ?? t.key, value: format(Number(data[i]![t.key] ?? 0)), color: t.color ?? chartPalette[k]! })) })}
                    className="cursor-pointer"
                  />
                );
              })}
            </motion.g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0" style={{ top: showLegend && series.length > 1 ? 28 : 0, left: "50%", marginLeft: -size / 2, width: size }}>
        <ChartTooltip tip={tip} />
      </div>
    </div>
  );
}
