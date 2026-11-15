"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn, useControllableState } from "@kineticui/core";

export type TimeRangeSliderProps = {
  /** [start, end] in minutes from midnight. */
  value?: [number, number];
  defaultValue?: [number, number];
  onValueChange?: (v: [number, number]) => void;
  min?: number;
  max?: number;
  /** Snap step in minutes. */
  step?: number;
  /** Highlighted blocks (busy times) drawn on the track. */
  blocked?: [number, number][];
  /** 12h or 24h labels. */
  format?: "12h" | "24h";
  className?: string;
};

export const formatMinutes = (m: number, format: "12h" | "24h" = "12h") => {
  const h = Math.floor(m / 60) % 24;
  const mm = String(m % 60).padStart(2, "0");
  if (format === "24h") return `${String(h).padStart(2, "0")}:${mm}`;
  return `${h % 12 || 12}:${mm} ${h < 12 ? "am" : "pm"}`;
};

/** Dual-thumb time range picker with hour ticks, busy blocks and a duration readout. */
export function TimeRangeSlider({ value, defaultValue = [9 * 60, 17 * 60], onValueChange, min = 6 * 60, max = 22 * 60, step = 15, blocked = [], format = "12h", className }: TimeRangeSliderProps) {
  const [range, setRange] = useControllableState<[number, number]>({ value, defaultValue, onChange: onValueChange });
  const pct = (m: number) => ((m - min) / (max - min)) * 100;
  const dur = range[1] - range[0];
  const clash = blocked.some(([a, b]) => a < range[1] && b > range[0]);
  const hours = Array.from({ length: Math.floor((max - min) / 60) + 1 }, (_, i) => min + i * 60);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2 font-display text-2xl font-semibold tabular-nums">
          {formatMinutes(range[0], format)}
          <span className="text-base text-subtle">→</span>
          {formatMinutes(range[1], format)}
        </div>
        <span className={cn("rounded-full px-2.5 py-1 font-mono text-xs", clash ? "bg-warning-soft text-warning" : "bg-accent-soft text-accent")}>
          {Math.floor(dur / 60)}h {dur % 60 ? `${dur % 60}m` : ""}
          {clash ? " · overlaps" : ""}
        </span>
      </div>
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={1}
        value={range}
        onValueChange={(v) => setRange([v[0]!, v[1]!])}
        className="relative flex h-10 w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-10 w-full overflow-hidden rounded-xl bg-surface-raised">
          {hours.map((h) => (
            <span key={h} className="absolute inset-y-0 w-px bg-border" style={{ left: `${pct(h)}%` }} />
          ))}
          {blocked.map(([a, b], i) => (
            <span key={i} className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,var(--kn-danger-soft)_0_6px,transparent_6px_12px)]" style={{ left: `${pct(a)}%`, width: `${pct(b) - pct(a)}%` }} />
          ))}
          <SliderPrimitive.Range className="absolute inset-y-0 bg-accent/35 ring-2 ring-inset ring-accent" />
        </SliderPrimitive.Track>
        {[0, 1].map((i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={i ? "End time" : "Start time"}
            className="block h-12 w-3 cursor-grab rounded-full bg-accent shadow-[0_0_0_4px_var(--kn-background)] outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:cursor-grabbing"
          />
        ))}
      </SliderPrimitive.Root>
      <div className="relative h-4 font-mono text-[10px] text-subtle">
        {hours.filter((_, i) => i % 2 === 0).map((h) => (
          <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>
            {format === "24h" ? `${Math.floor(h / 60)}:00` : `${Math.floor(h / 60) % 12 || 12}${Math.floor(h / 60) < 12 ? "a" : "p"}`}
          </span>
        ))}
      </div>
    </div>
  );
}
