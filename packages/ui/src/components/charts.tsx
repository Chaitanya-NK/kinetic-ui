"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

/* Dependency-free SVG charts. Colours default to the accent plus a muted palette. */

export const chartPalette = ["var(--kn-accent)", "#7C8CFF", "#F4A86A", "#F0A3D0", "#6EE7A0", "var(--kn-muted)"];

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

const defaultFormat = (v: number) => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(+v.toFixed(2)));

function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(600);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e!.contentRect.width));
    ro.observe(el);
    setW(el.getBoundingClientRect().width || 600);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

type Tip = { x: number; y: number; label: string; rows: { name: string; value: string; color: string }[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-28 -translate-x-1/2 -translate-y-full rounded-lg border border-border-strong bg-surface-overlay px-2.5 py-2 text-xs shadow-overlay"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      <div className="mb-1 font-medium text-foreground">{tip.label}</div>
      {tip.rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2 text-muted">
          <span className="size-2 rounded-full" style={{ background: r.color }} />
          <span className="flex-1">{r.name}</span>
          <span className="font-mono text-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export type ChartSeries = { key: string; name?: string; color?: string };

type CartesianProps<T> = {
  data: T[];
  /** Field used for the x-axis labels. */
  index: keyof T & string;
  series: ChartSeries[];
  height?: number;
  format?: (v: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
};

const PAD = { top: 12, right: 12, bottom: 28, left: 40 };

function Legend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
      {series.map((s, i) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: s.color ?? chartPalette[i] }} />
          {s.name ?? s.key}
        </span>
      ))}
    </div>
  );
}

function Axes({ ticks, max, w, h, format, labels, xAt }: { ticks: number; max: number; w: number; h: number; format: (v: number) => string; labels: string[]; xAt: (i: number) => number }) {
  const step = Math.ceil(labels.length / Math.max(1, Math.floor((w - PAD.left) / 64)));
  return (
    <g className="text-[10px]" fill="var(--kn-subtle)">
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        const y = PAD.top + (h - PAD.top - PAD.bottom) * (1 - i / ticks);
        return (
          <g key={i}>
            <line x1={PAD.left} x2={w - PAD.right} y1={y} y2={y} stroke="var(--kn-border)" strokeDasharray={i === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 8} y={y + 3} textAnchor="end" className="font-mono">
              {format(v)}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) =>
        i % step === 0 ? (
          <text key={i} x={xAt(i)} y={h - 8} textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </g>
  );
}

/** Grouped or stacked bar chart. */
export function BarChart<T extends Record<string, unknown>>({
  data,
  index,
  series,
  height = 260,
  format = defaultFormat,
  stacked,
  showLegend = true,
  className,
}: CartesianProps<T> & { stacked?: boolean }) {
  const [ref, w] = useSize<HTMLDivElement>();
  const [tip, setTip] = React.useState<Tip>(null);
  const totals = data.map((d) => (stacked ? series.reduce((a, s) => a + Number(d[s.key] ?? 0), 0) : Math.max(...series.map((s) => Number(d[s.key] ?? 0)))));
  const max = niceMax(Math.max(...totals, 0));
  const innerW = w - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const band = innerW / Math.max(1, data.length);
  const barGap = band * 0.28;
  const xAt = (i: number) => PAD.left + band * i + band / 2;
  const y = (v: number) => (v / max) * innerH;

  return (
    <div ref={ref} className={cn("relative w-full", className)} onPointerLeave={() => setTip(null)}>
      {showLegend && series.length > 1 ? <Legend series={series} /> : null}
      <svg width={w} height={height} role="img" aria-label="Bar chart">
        <Axes ticks={4} max={max} w={w} h={height} format={format} labels={data.map((d) => String(d[index]))} xAt={xAt} />
        {data.map((d, i) => {
          const x0 = PAD.left + band * i + barGap / 2;
          const bw = band - barGap;
          let acc = 0;
          return (
            <g
              key={i}
              onPointerEnter={() =>
                setTip({
                  x: xAt(i),
                  y: PAD.top + innerH - y(totals[i]!),
                  label: String(d[index]),
                  rows: series.map((s, j) => ({ name: s.name ?? s.key, value: format(Number(d[s.key] ?? 0)), color: s.color ?? chartPalette[j]! })),
                })
              }
            >
              <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} fill="transparent" />
              {series.map((s, j) => {
                const v = Number(d[s.key] ?? 0);
                const h = y(v);
                const sw = stacked ? bw : bw / series.length;
                const x = stacked ? x0 : x0 + sw * j;
                const yTop = PAD.top + innerH - (stacked ? acc + h : h);
                acc += h;
                return (
                  <motion.rect
                    key={s.key}
                    x={x + (stacked ? 0 : 1)}
                    width={Math.max(1, sw - (stacked ? 0 : 2))}
                    rx={stacked ? 0 : 4}
                    fill={s.color ?? chartPalette[j]}
                    initial={{ height: 0, y: PAD.top + innerH }}
                    animate={{ height: h, y: yTop }}
                    transition={{ type: "spring", stiffness: 140, damping: 20, delay: i * 0.03 }}
                    opacity={tip && tip.label !== String(d[index]) ? 0.45 : 1}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}

function path(points: [number, number][], curved: boolean) {
  if (!points.length) return "";
  if (!curved) return points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  let d = `M${points[0]![0]},${points[0]![1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/** Line chart; set `area` for filled gradients. */
export function LineChart<T extends Record<string, unknown>>({
  data,
  index,
  series,
  height = 260,
  format = defaultFormat,
  area,
  curved = true,
  showLegend = true,
  className,
}: CartesianProps<T> & { area?: boolean; curved?: boolean }) {
  const [ref, w] = useSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);
  const id = React.useId().replace(/:/g, "");
  const max = niceMax(Math.max(...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0))), 0));
  const innerW = w - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const xAt = (i: number) => PAD.left + (data.length <= 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const yAt = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - PAD.left;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((x / innerW) * (data.length - 1)))));
  };

  const tip: Tip =
    hover === null
      ? null
      : {
          x: xAt(hover),
          y: Math.min(...series.map((s) => yAt(Number(data[hover]![s.key] ?? 0)))),
          label: String(data[hover]![index]),
          rows: series.map((s, j) => ({ name: s.name ?? s.key, value: format(Number(data[hover]![s.key] ?? 0)), color: s.color ?? chartPalette[j]! })),
        };

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {showLegend && series.length > 1 ? <Legend series={series} /> : null}
      <svg width={w} height={height} role="img" aria-label="Line chart" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <defs>
          {series.map((s, j) => (
            <linearGradient key={s.key} id={`${id}-${j}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={s.color ?? chartPalette[j]} stopOpacity="0.35" />
              <stop offset="1" stopColor={s.color ?? chartPalette[j]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        <Axes ticks={4} max={max} w={w} h={height} format={format} labels={data.map((d) => String(d[index]))} xAt={xAt} />
        {series.map((s, j) => {
          const pts = data.map((d, i) => [xAt(i), yAt(Number(d[s.key] ?? 0))] as [number, number]);
          const line = path(pts, curved);
          const color = s.color ?? chartPalette[j];
          return (
            <g key={s.key}>
              {area ? <motion.path d={`${line} L${pts.at(-1)![0]},${PAD.top + innerH} L${pts[0]![0]},${PAD.top + innerH} Z`} fill={`url(#${id}-${j})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} /> : null}
              <motion.path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} />
            </g>
          );
        })}
        {hover !== null ? (
          <g>
            <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--kn-border-strong)" />
            {series.map((s, j) => (
              <circle key={s.key} cx={xAt(hover)} cy={yAt(Number(data[hover]![s.key] ?? 0))} r={4.5} fill="var(--kn-background)" stroke={s.color ?? chartPalette[j]} strokeWidth={2.2} />
            ))}
          </g>
        ) : null}
      </svg>
      <Tooltip tip={tip} />
    </div>
  );
}

export function AreaChart<T extends Record<string, unknown>>(props: CartesianProps<T> & { curved?: boolean }) {
  return <LineChart {...props} area />;
}

export type DonutSlice = { label: string; value: number; color?: string };

/** Donut with animated segments, centre total and legend. */
export function DonutChart({
  data,
  size = 200,
  thickness = 22,
  label = "Total",
  format = defaultFormat,
  className,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  label?: string;
  format?: (v: number) => string;
  className?: string;
}) {
  const [active, setActive] = React.useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const shown = active === null ? { label, value: total } : { label: data[active]!.label, value: data[active]!.value };
  return (
    <div className={cn("flex flex-wrap items-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label="Donut chart">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--kn-surface-raised)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const gap = data.length > 1 ? Math.min(4, len / 3) : 0;
            const el = (
              <motion.circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color ?? chartPalette[i]}
                strokeWidth={active === i ? thickness + 6 : thickness}
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                initial={{ strokeDashoffset: c }}
                animate={{ strokeDashoffset: -offset }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: i * 0.08 }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className="cursor-pointer transition-[stroke-width]"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold tabular-nums">{format(shown.value)}</span>
          <span className="text-xs text-subtle">{shown.label}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} className={cn("flex items-center gap-2.5 transition-opacity", active !== null && active !== i && "opacity-40")}>
            <span className="size-2.5 rounded-full" style={{ background: d.color ?? chartPalette[i] }} />
            <span className="w-24 text-muted">{d.label}</span>
            <span className="font-mono text-xs">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tiny inline trend line. */
export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "var(--kn-accent)",
  area = true,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
  className?: string;
}) {
  const id = React.useId().replace(/:/g, "");
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * width, height - 3 - ((v - min) / (max - min || 1)) * (height - 6)] as [number, number]);
  const line = path(pts, true);
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area ? <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} /> : null}
      <motion.path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
      <circle cx={pts.at(-1)![0]} cy={pts.at(-1)![1]} r={2.5} fill={color} />
    </svg>
  );
}

/** Conversion funnel with drop-off between steps. */
export function FunnelChart({ steps, format = defaultFormat, className }: { steps: { label: string; value: number }[]; format?: (v: number) => string; className?: string }) {
  const max = steps[0]?.value || 1;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = i ? steps[i - 1]!.value : null;
        return (
          <div key={s.label} className="flex items-center gap-4">
            <span className="w-28 shrink-0 text-sm text-muted">{s.label}</span>
            <div className="relative flex h-10 flex-1 items-center gap-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 20, delay: i * 0.08 }}
                className="h-full min-w-1.5 rounded-lg"
                style={{ background: `color-mix(in oklab, var(--kn-accent) ${100 - i * 16}%, var(--kn-surface-raised))` }}
              />
              <span className="shrink-0 font-mono text-xs font-semibold">{format(s.value)}</span>
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-xs text-subtle">{prev ? `${Math.round((s.value / prev) * 100)}%` : "100%"}</span>
          </div>
        );
      })}
    </div>
  );
}
