"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { SegmentedControl } from "@kineticui/ui";
import { CloudIcon, MapPinIcon, SunIcon } from "@kineticui/icons";

type Day = { d: string; hi: number; lo: number; kind: "sun" | "cloud" | "rain" };
const week: Day[] = [
  { d: "Today", hi: 29, lo: 19, kind: "sun" },
  { d: "Mon", hi: 27, lo: 18, kind: "cloud" },
  { d: "Tue", hi: 24, lo: 17, kind: "rain" },
  { d: "Wed", hi: 26, lo: 18, kind: "cloud" },
  { d: "Thu", hi: 30, lo: 20, kind: "sun" },
  { d: "Fri", hi: 31, lo: 21, kind: "sun" },
];
const hours = [24, 25, 27, 28, 29, 29, 28, 26, 24, 22, 21, 20];

function Icon({ kind, size = 18 }: { kind: Day["kind"]; size?: number }) {
  if (kind === "sun") return <SunIcon size={size} className="text-[#F5C451]" />;
  if (kind === "cloud") return <CloudIcon size={size} className="text-muted" />;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-info" aria-hidden>
      <path d="M17.5 15a4.5 4.5 0 00-1.2-8.8A6 6 0 004.3 9.5 4 4 0 006 15h11.5zM8 18l-1 2M12 18l-1 2M16 18l-1 2" />
    </svg>
  );
}

/** Weather card: animated sun, current conditions, hourly temperature curve and 6-day range bars. */
export function WeatherWidget({ city = "Bengaluru" }: { city?: string }) {
  const [unit, setUnit] = React.useState("c");
  const t = (c: number) => (unit === "c" ? c : Math.round((c * 9) / 5 + 32));
  const min = Math.min(...week.map((d) => d.lo));
  const max = Math.max(...week.map((d) => d.hi));
  const pts = hours.map((h, i) => `${(i / (hours.length - 1)) * 100},${40 - ((h - 19) / 11) * 34}`).join(" ");

  return (
    <section className="flex min-h-[620px] items-center justify-center p-6">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(170deg,#1d2a4a,var(--kn-surface)_60%)] p-6">
        <motion.div className="absolute -right-10 -top-10 size-40 rounded-full bg-[#F5C451] opacity-80 blur-[2px]" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <motion.div className="absolute -right-16 -top-16 size-56 rounded-full bg-[#F5C451]/20 blur-2xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }} aria-hidden />
        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm"><MapPinIcon size={14} /> {city}</span>
          <SegmentedControl value={unit} defaultValue="c" onValueChange={setUnit} options={[{ value: "c", label: "°C" }, { value: "f", label: "°F" }]} />
        </div>
        <div className="relative mt-8 flex flex-col">
          <span className="font-display text-7xl font-semibold tracking-tighter">{t(28)}°</span>
          <span className="text-muted">Sunny · feels like {t(30)}°</span>
          <span className="mt-1 text-sm text-subtle">H {t(29)}° · L {t(19)}° · Humidity 48%</span>
        </div>
        <div className="relative mt-6">
          <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-16 w-full" aria-hidden>
            <defs>
              <linearGradient id="kn-wx" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#F5C451" stopOpacity=".5" />
                <stop offset="1" stopColor="#F5C451" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,44 ${pts} 100,44`} fill="url(#kn-wx)" />
            <motion.polyline points={pts} fill="none" stroke="#F5C451" strokeWidth="1.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
          </svg>
          <div className="flex justify-between font-mono text-[10px] text-subtle">
            {["9a", "12p", "3p", "6p", "9p"].map((h) => <span key={h}>{h}</span>)}
          </div>
        </div>
        <ul className="relative mt-5 flex flex-col gap-2.5 border-t border-border pt-4 text-sm">
          {week.map((d, i) => (
            <motion.li key={d.d} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="grid grid-cols-[56px_24px_32px_1fr_32px] items-center gap-2">
              <span className={cn(i === 0 && "font-semibold")}>{d.d}</span>
              <Icon kind={d.kind} />
              <span className="text-right font-mono text-subtle">{t(d.lo)}°</span>
              <span className="relative h-1.5 rounded-full bg-surface-overlay">
                <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#7C8CFF] to-[#F5C451]" style={{ left: `${((d.lo - min) / (max - min)) * 100}%`, right: `${100 - ((d.hi - min) / (max - min)) * 100}%` }} />
              </span>
              <span className="font-mono">{t(d.hi)}°</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
