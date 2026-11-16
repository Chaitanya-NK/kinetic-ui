"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChartTooltip, chartPalette, defaultFormat, useChartSize, type ChartTip } from "./charts";

export type ScatterPoint = { x: number; y: number; /** Bubble size value. */ z?: number; label?: string };
export type ScatterGroup = { key: string; name?: string; color?: string; points: ScatterPoint[] };

export type ScatterChartProps = {
  groups: ScatterGroup[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
  /** Draw a least-squares trend line per group. */
  trend?: boolean;
  /** Bubble radius range in px when points have z. */
  radius?: [number, number];
  showLegend?: boolean;
  className?: string;
};

const nice = (min: number, max: number) => {
  const span = max - min || 1;
  const step = Math.pow(10, Math.floor(Math.log10(span / 4)));
  const k = [1, 2, 2.5, 5, 10].find((m) => span / (m * step) <= 5) ?? 10;
  const s = k * step;
  return { lo: Math.floor(min / s) * s, hi: Math.ceil(max / s) * s, step: s };
};

/** Scatter and bubble chart with trend lines and a crosshair. Groups fade in point by point. */
export function ScatterChart({ groups, height = 300, xLabel, yLabel, formatX = defaultFormat, formatY = defaultFormat, trend = false, radius = [4, 22], showLegend = true, className }: ScatterChartProps) {
  const [ref, w] = useChartSize<HTMLDivElement>();
  const [tip, setTip] = React.useState<ChartTip>(null);
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const all = groups.flatMap((g) => g.points);
  const xs = nice(Math.min(...all.map((p) => p.x)), Math.max(...all.map((p) => p.x)));
  const ys = nice(Math.min(0, ...all.map((p) => p.y)), Math.max(...all.map((p) => p.y)));
  const zs = all.map((p) => p.z ?? 0);
  const zMax = Math.max(...zs, 1);
  const P = { top: 14, right: 16, bottom: xLabel ? 44 : 28, left: yLabel ? 56 : 44 };
  const iw = Math.max(10, w - P.left - P.right), ih = height - P.top - P.bottom;
  const X = (v: number) => P.left + ((v - xs.lo) / (xs.hi - xs.lo)) * iw;
  const Y = (v: number) => P.top + ih - ((v - ys.lo) / (ys.hi - ys.lo)) * ih;
  const r = (z?: number) => (z == null ? radius[0] + 1 : radius[0] + Math.sqrt(z / zMax) * (radius[1] - radius[0]));
  const ticks = (a: { lo: number; hi: number; step: number }) => Array.from({ length: Math.round((a.hi - a.lo) / a.step) + 1 }, (_, i) => a.lo + i * a.step);

  return (
    <div ref={ref} className={cn("relative w-full", className)} onPointerLeave={() => (setTip(null), setHover(null))}>
      {showLegend && groups.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
          {groups.map((g, i) => (
            <span key={g.key} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: g.color ?? chartPalette[i] }} />{g.name ?? g.key}</span>
          ))}
        </div>
      ) : null}
      <svg width={w} height={height} role="img" aria-label="Scatter chart">
        {ticks(ys).map((t) => (
          <g key={`y${t}`}>
            <line x1={P.left} x2={P.left + iw} y1={Y(t)} y2={Y(t)} stroke="var(--kn-border)" strokeDasharray="3 4" />
            <text x={P.left - 8} y={Y(t)} textAnchor="end" dominantBaseline="middle" className="fill-[var(--kn-subtle)] font-mono text-[10px]">{formatY(t)}</text>
          </g>
        ))}
        {ticks(xs).map((t) => (
          <text key={`x${t}`} x={X(t)} y={P.top + ih + 16} textAnchor="middle" className="fill-[var(--kn-subtle)] font-mono text-[10px]">{formatX(t)}</text>
        ))}
        {xLabel ? <text x={P.left + iw / 2} y={height - 6} textAnchor="middle" className="fill-[var(--kn-muted)] text-[11px]">{xLabel}</text> : null}
        {yLabel ? <text transform={`translate(14 ${P.top + ih / 2}) rotate(-90)`} textAnchor="middle" className="fill-[var(--kn-muted)] text-[11px]">{yLabel}</text> : null}
        {hover ? (
          <g pointerEvents="none">
            <line x1={hover.x} x2={hover.x} y1={P.top} y2={P.top + ih} stroke="var(--kn-border-strong)" strokeDasharray="2 3" />
            <line x1={P.left} x2={P.left + iw} y1={hover.y} y2={hover.y} stroke="var(--kn-border-strong)" strokeDasharray="2 3" />
          </g>
        ) : null}
        {groups.map((g, gi) => {
          const col = g.color ?? chartPalette[gi]!;
          let line: React.ReactNode = null;
          if (trend && g.points.length > 1) {
            const n = g.points.length, sx = g.points.reduce((a, p) => a + p.x, 0), sy = g.points.reduce((a, p) => a + p.y, 0);
            const sxy = g.points.reduce((a, p) => a + p.x * p.y, 0), sxx = g.points.reduce((a, p) => a + p.x * p.x, 0);
            const m = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1), b = (sy - m * sx) / n;
            line = <motion.line x1={X(xs.lo)} y1={Y(m * xs.lo + b)} x2={X(xs.hi)} y2={Y(m * xs.hi + b)} stroke={col} strokeWidth={1.5} strokeDasharray="6 5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ duration: 1, delay: 0.4 }} />;
          }
          return (
            <g key={g.key}>
              {line}
              {g.points.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={X(p.x)}
                  cy={Y(p.y)}
                  fill={col}
                  fillOpacity={p.z != null ? 0.35 : 0.85}
                  stroke={col}
                  strokeWidth={1.5}
                  r={r(p.z)}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: gi * 0.15 + i * 0.015 }}
                  onPointerEnter={() => {
                    setHover({ x: X(p.x), y: Y(p.y) });
                    setTip({ x: X(p.x), y: Y(p.y) - r(p.z), label: p.label ?? g.name ?? g.key, rows: [{ name: xLabel ?? "x", value: formatX(p.x), color: col }, { name: yLabel ?? "y", value: formatY(p.y), color: col }, ...(p.z != null ? [{ name: "size", value: defaultFormat(p.z), color: col }] : [])] });
                  }}
                  className="cursor-pointer transition-[fill-opacity] hover:fill-opacity-100"
                />
              ))}
            </g>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  );
}
