"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@kineticui/core";

export type GaugeZone = { to: number; color: string; label?: string };

export type GaugeProps = {
  value: number;
  min?: number;
  max?: number;
  /** Coloured bands, each ending at `to`. Defaults to red / amber / accent thirds. */
  zones?: GaugeZone[];
  /** Arc sweep in degrees. 180 for a half dial, 240 for a speedometer. */
  sweep?: number;
  size?: number;
  label?: React.ReactNode;
  format?: (v: number) => string;
  /** Show a needle instead of only the filled arc. */
  needle?: boolean;
  className?: string;
};

/** Speedometer-style gauge with coloured zones, a springy needle and a counting value. */
export function Gauge({ value, min = 0, max = 100, zones, sweep = 240, size = 240, label, format = (v) => String(Math.round(v)), needle = true, className }: GaugeProps) {
  const z = zones ?? [
    { to: min + (max - min) * 0.33, color: "var(--kn-danger)" },
    { to: min + (max - min) * 0.66, color: "var(--kn-warning)" },
    { to: max, color: "var(--kn-accent)" },
  ];
  const mv = useMotionValue(min);
  React.useEffect(() => {
    const c = animate(mv, Math.min(max, Math.max(min, value)), { type: "spring", stiffness: 60, damping: 12 });
    return () => c.stop();
  }, [value, min, max, mv]);
  const c = size / 2, R = size / 2 - 18, stroke = 14; // needle hub sits at (c, c)
  const start = -90 - sweep / 2;
  const ang = (v: number) => start + ((v - min) / (max - min)) * sweep;
  const polar = (a: number, r = R) => [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)] as const;
  const arc = (a0: number, a1: number, r = R) => {
    const [x0, y0] = polar(a0, r), [x1, y1] = polar(a1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const text = useTransform(mv, (v) => format(v));
  const fill = useTransform(mv, (v) => (v - min) / (max - min));
  const zoneOf = (v: number) => z.find((q) => v <= q.to) ?? z[z.length - 1]!;
  const [cur, setCur] = React.useState(zoneOf(value));
  const [deg, setDeg] = React.useState(ang(min) + 90);
  React.useEffect(() => mv.on("change", (v) => (setCur(zoneOf(v)), setDeg(ang(v) + 90))), [mv]); // eslint-disable-line react-hooks/exhaustive-deps
  const height = sweep <= 180 ? c + 28 : c + Math.sin(((sweep / 2 - 90) * Math.PI) / 180) * R + 30;

  let prev = min;
  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} role="meter" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-label={typeof label === "string" ? label : "Gauge"}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        <path d={arc(start, start + sweep)} fill="none" stroke="var(--kn-surface-overlay)" strokeWidth={stroke} strokeLinecap="round" />
        {z.map((q, i) => {
          const a0 = ang(prev), a1 = ang(q.to);
          prev = q.to;
          return <path key={i} d={arc(a0 + (i ? 1.2 : 0), a1 - (i < z.length - 1 ? 1.2 : 0), R)} fill="none" stroke={q.color} strokeOpacity={0.22} strokeWidth={stroke} strokeLinecap={i === 0 || i === z.length - 1 ? "round" : "butt"} />;
        })}
        <motion.path d={arc(start, start + sweep)} fill="none" stroke={cur.color} strokeWidth={stroke} strokeLinecap="round" style={{ pathLength: fill }} />
        {Array.from({ length: 11 }, (_, i) => {
          const a = start + (sweep * i) / 10;
          const [x0, y0] = polar(a, R - stroke / 2 - 6), [x1, y1] = polar(a, R - stroke / 2 - (i % 5 ? 10 : 14));
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--kn-border-strong)" strokeWidth={i % 5 ? 1 : 2} />;
        })}
        {needle ? (
          <g transform={`rotate(${deg} ${c} ${c})`}>
            <path d={`M ${c - 4} ${c} L ${c} ${c - R + stroke + 10} L ${c + 4} ${c} Z`} fill="var(--kn-foreground)" />
          </g>
        ) : null}
        {needle ? <circle cx={c} cy={c} r={8} fill="var(--kn-surface-raised)" stroke="var(--kn-foreground)" strokeWidth={3} /> : null}
      </svg>
      <div className="absolute inset-x-0 flex flex-col items-center" style={{ top: needle ? c + 16 : c - 24 }}>
        <motion.span className="font-display text-3xl font-semibold tabular-nums tracking-tight">{text}</motion.span>
        {label ? <span className="text-xs text-subtle">{label}</span> : null}
        {cur.label ? <span className="mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: cur.color, background: "var(--kn-surface-overlay)" }}>{cur.label}</span> : null}
      </div>
    </div>
  );
}
