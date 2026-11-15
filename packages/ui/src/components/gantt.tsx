"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type GanttTask = {
  id: string;
  name: string;
  /** Inclusive start / end, as Date or ISO date. */
  start: Date | string;
  end: Date | string;
  /** 0–100. */
  progress?: number;
  color?: string;
  group?: string;
  /** Show as a diamond on its start date. */
  milestone?: boolean;
};

export type GanttProps = {
  tasks: GanttTask[];
  /** Pixels per day. */
  dayWidth?: number;
  today?: Date | string;
  onTaskClick?: (task: GanttTask) => void;
  className?: string;
};

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day0 = (d: Date | string) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** Project timeline with progress bars, milestones and a today marker. */
export function Gantt({ tasks, dayWidth = 28, today, onTaskClick, className }: GanttProps) {
  const starts = tasks.map((t) => day0(t.start).getTime());
  const ends = tasks.map((t) => day0(t.end).getTime());
  const min = Math.min(...starts) - DAY * 2;
  const max = Math.max(...ends) + DAY * 3;
  const days = Math.round((max - min) / DAY);
  const x = (d: Date | string) => ((day0(d).getTime() - min) / DAY) * dayWidth;
  const todayX = today ? x(today) : null;
  const rowH = 40;

  return (
    <div className={cn("flex overflow-hidden rounded-2xl border border-border bg-surface text-sm", className)}>
      <div className="w-44 shrink-0 border-r border-border">
        <div className="flex h-12 items-end border-b border-border px-4 pb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">Task</div>
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 truncate border-b border-border/60 px-4 last:border-0" style={{ height: rowH }}>
            <span className="size-2 shrink-0 rounded-full" style={{ background: t.color ?? "var(--kn-accent)" }} />
            <span className="truncate">{t.name}</span>
          </div>
        ))}
      </div>
      <div className="relative flex-1 overflow-x-auto">
        <div className="relative" style={{ width: days * dayWidth }}>
          <div className="flex h-12 border-b border-border">
            {Array.from({ length: days }, (_, i) => {
              const d = new Date(min + i * DAY);
              const weekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <div key={i} className={cn("flex shrink-0 flex-col items-center justify-end pb-1.5 text-[10px] text-subtle", weekend && "bg-surface-raised/50")} style={{ width: dayWidth }}>
                  {d.getDate() === 1 || (i === 0 && d.getDate() < 26) ? <span className="font-medium text-muted">{MONTHS[d.getMonth()]}</span> : null}
                  <span className="font-mono">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-12 bottom-0 flex">
            {Array.from({ length: days }, (_, i) => {
              const d = new Date(min + i * DAY);
              return <div key={i} className={cn("shrink-0 border-r border-border/40", (d.getDay() === 0 || d.getDay() === 6) && "bg-surface-raised/40")} style={{ width: dayWidth }} />;
            })}
          </div>
          {todayX !== null ? (
            <div className="absolute top-10 bottom-0 z-[2] w-px bg-accent" style={{ left: todayX + dayWidth / 2 }}>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-accent px-1 font-mono text-[9px] font-bold text-accent-foreground">TODAY</span>
            </div>
          ) : null}
          {tasks.map((t, i) => {
            const left = x(t.start);
            const width = x(t.end) - left + dayWidth;
            const color = t.color ?? "var(--kn-accent)";
            return (
              <div key={t.id} className="relative border-b border-border/60 last:border-0" style={{ height: rowH }}>
                {t.milestone ? (
                  <button
                    type="button"
                    title={t.name}
                    onClick={() => onTaskClick?.(t)}
                    className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[3px]"
                    style={{ left: left + dayWidth / 2, background: color }}
                  />
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => onTaskClick?.(t)}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.05 }}
                    className="absolute top-2 flex h-6 origin-left items-center overflow-hidden rounded-md text-left text-[11px] font-medium"
                    style={{ left: left + 2, width: width - 4, background: `color-mix(in oklab, ${color} 28%, transparent)` }}
                  >
                    <span className="absolute inset-y-0 left-0" style={{ width: `${t.progress ?? 0}%`, background: color }} />
                    <span className="relative truncate px-2" style={{ color: (t.progress ?? 0) > 40 ? "var(--kn-accent-foreground)" : "var(--kn-foreground)" }}>
                      {t.progress !== undefined ? `${t.progress}%` : ""}
                    </span>
                  </motion.button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
