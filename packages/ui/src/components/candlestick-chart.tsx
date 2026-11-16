"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { useChartSize } from "./charts";

export type Candle = { time: string; open: number; high: number; low: number; close: number; volume?: number };

export type CandlestickChartProps = {
  data: Candle[];
  height?: number;
  /** Show a volume histogram under the candles. */
  volume?: boolean;
  /** Moving-average periods to overlay, e.g. [7, 25]. */
  movingAverages?: number[];
  upColor?: string;
  downColor?: string;
  format?: (v: number) => string;
  className?: string;
};

const maColors = ["#7C8CFF", "#F4A86A", "#F0A3D0"];

/** OHLC candlestick chart with volume, moving averages, a crosshair and a price readout. */
export function CandlestickChart({ data, height = 340, volume = true, movingAverages = [], upColor = "var(--kn-success)", downColor = "var(--kn-danger)", format = (v) => v.toFixed(2), className }: CandlestickChartProps) {
  const [ref, w] = useChartSize<HTMLDivElement>();
  const [hi, setHi] = React.useState<number | null>(null);
  const [mouseY, setMouseY] = React.useState<number | null>(null);
  const P = { top: 12, right: 58, bottom: 24, left: 8 };
  const volH = volume ? Math.round(height * 0.18) : 0;
  const ih = height - P.top - P.bottom - volH - (volume ? 8 : 0);
  const iw = Math.max(10, w - P.left - P.right);
  const lo = Math.min(...data.map((d) => d.low)), top = Math.max(...data.map((d) => d.high));
  const pad = (top - lo) * 0.06;
  const yMin = lo - pad, yMax = top + pad;
  const Y = (v: number) => P.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const band = iw / data.length;
  const X = (i: number) => P.left + band * i + band / 2;
  const cw = Math.max(1.5, band * 0.62);
  const vMax = Math.max(1, ...data.map((d) => d.volume ?? 0));
  const ticks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * (i + 0.5)) / 5);
  const ma = movingAverages.map((n) => data.map((_, i) => (i + 1 < n ? null : data.slice(i + 1 - n, i + 1).reduce((a, d) => a + d.close, 0) / n)));
  const cur = data[hi ?? data.length - 1]!;
  const up = cur.close >= cur.open;
  const change = ((cur.close - cur.open) / cur.open) * 100;
  const last = data[data.length - 1]!;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs">
        <span className="text-subtle">{cur.time}</span>
        {(["open", "high", "low", "close"] as const).map((k) => (
          <span key={k} className="text-subtle">{k[0]!.toUpperCase()} <span style={{ color: up ? upColor : downColor }}>{format(cur[k])}</span></span>
        ))}
        <span style={{ color: up ? upColor : downColor }}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
        {movingAverages.map((n, j) => {
          const v = ma[j]![hi ?? data.length - 1];
          return v != null ? <span key={n} style={{ color: maColors[j % 3] }}>MA{n} {format(v)}</span> : null;
        })}
      </div>
      <div
        ref={ref}
        className="relative w-full cursor-crosshair"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.floor((e.clientX - r.left - P.left) / band);
          setHi(i >= 0 && i < data.length ? i : null);
          const y = e.clientY - r.top;
          setMouseY(y >= P.top && y <= P.top + ih ? y : null);
        }}
        onPointerLeave={() => (setHi(null), setMouseY(null))}
      >
        <svg width={w} height={height} role="img" aria-label={`Candlestick chart, last close ${format(last.close)}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={P.left} x2={P.left + iw} y1={Y(t)} y2={Y(t)} stroke="var(--kn-border)" strokeDasharray="2 4" />
              <text x={P.left + iw + 8} y={Y(t)} dominantBaseline="middle" className="fill-[var(--kn-subtle)] font-mono text-[10px]">{format(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 6) !== 0) return null;
            return <text key={`t${i}`} x={X(i)} y={height - 6} textAnchor="middle" className="fill-[var(--kn-subtle)] font-mono text-[10px]">{d.time}</text>;
          })}
          {data.map((d, i) => {
            const isUp = d.close >= d.open;
            const col = isUp ? upColor : downColor;
            const bTop = Y(Math.max(d.open, d.close)), bBot = Y(Math.min(d.open, d.close));
            return (
              <motion.g key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: hi != null && hi !== i ? 0.55 : 1, scaleY: 1 }} transition={{ delay: i * 0.008, type: "spring", stiffness: 200, damping: 22 }} style={{ originY: `${(bTop + bBot) / 2}px` }}>
                <line x1={X(i)} x2={X(i)} y1={Y(d.high)} y2={Y(d.low)} stroke={col} strokeWidth={1} />
                <rect x={X(i) - cw / 2} y={bTop} width={cw} height={Math.max(1, bBot - bTop)} rx={Math.min(2, cw / 4)} fill={isUp ? col : col} fillOpacity={isUp ? 0.9 : 0.9} />
                {volume && d.volume != null ? <rect x={X(i) - cw / 2} y={height - P.bottom - (d.volume / vMax) * volH} width={cw} height={(d.volume / vMax) * volH} fill={col} fillOpacity={0.3} /> : null}
              </motion.g>
            );
          })}
          {ma.map((series, j) => {
            const pts = series.map((v, i) => (v == null ? null : `${X(i)},${Y(v)}`)).filter(Boolean);
            return <motion.polyline key={j} points={pts.join(" ")} fill="none" stroke={maColors[j % 3]} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />;
          })}
          {/* last price tag */}
          <line x1={P.left} x2={P.left + iw} y1={Y(last.close)} y2={Y(last.close)} stroke={last.close >= last.open ? upColor : downColor} strokeDasharray="1 3" />
          <rect x={P.left + iw + 2} y={Y(last.close) - 9} width={P.right - 4} height={18} rx={4} fill={last.close >= last.open ? upColor : downColor} />
          <text x={P.left + iw + P.right / 2} y={Y(last.close)} textAnchor="middle" dominantBaseline="middle" className="fill-[var(--kn-background)] font-mono text-[10px] font-semibold">{format(last.close)}</text>
          {hi != null ? (
            <g pointerEvents="none">
              <line x1={X(hi)} x2={X(hi)} y1={P.top} y2={height - P.bottom} stroke="var(--kn-border-strong)" strokeDasharray="3 3" />
              {mouseY != null ? (
                <>
                  <line x1={P.left} x2={P.left + iw} y1={mouseY} y2={mouseY} stroke="var(--kn-border-strong)" strokeDasharray="3 3" />
                  <rect x={P.left + iw + 2} y={mouseY - 9} width={P.right - 4} height={18} rx={4} fill="var(--kn-surface-overlay)" stroke="var(--kn-border-strong)" />
                  <text x={P.left + iw + P.right / 2} y={mouseY} textAnchor="middle" dominantBaseline="middle" className="fill-[var(--kn-foreground)] font-mono text-[10px]">{format(yMin + ((P.top + ih - mouseY) / ih) * (yMax - yMin))}</text>
                </>
              ) : null}
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
