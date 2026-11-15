"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type MonthEvent = { id: string; title: string; date: Date; end?: Date; color?: string; allDay?: boolean };

export type MonthCalendarProps = {
  events: MonthEvent[];
  /** Any date in the month to show first. */
  month?: Date;
  weekStartsOn?: 0 | 1;
  /** Events visible per day before "+N more". */
  maxPerDay?: number;
  onDayClick?: (date: Date) => void;
  onEventClick?: (e: MonthEvent) => void;
  className?: string;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => key(a) === key(b);

/** Month view with event chips, "+N more" popovers, today ring and animated month switching. */
export function MonthCalendar({ events, month, weekStartsOn = 1, maxPerDay = 3, onDayClick, onEventClick, className }: MonthCalendarProps) {
  const mounted = useMounted();
  const [cursor, setCursor] = React.useState(() => {
    const d = month ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dir, setDir] = React.useState(1);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const first = new Date(cursor);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const byDay = React.useMemo(() => {
    const m = new Map<string, MonthEvent[]>();
    for (const e of events) {
      const end = e.end ?? e.date;
      for (let d = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate()); d <= end; d.setDate(d.getDate() + 1)) {
        const k = key(d);
        m.set(k, [...(m.get(k) ?? []), e]);
      }
    }
    return m;
  }, [events]);

  const go = (n: number) => {
    setDir(n);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
    setExpanded(null);
  };
  const today = mounted ? new Date() : null;
  const weekdays = Array.from({ length: 7 }, (_, i) => DAYS[(i + weekStartsOn) % 7]!);

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h3 className="font-display text-lg font-semibold">
          {MONTHS[cursor.getMonth()]} <span className="text-subtle">{cursor.getFullYear()}</span>
        </h3>
        <div className="ml-auto flex gap-1">
          <button type="button" onClick={() => { const n = new Date(); setDir(1); setCursor(new Date(n.getFullYear(), n.getMonth(), 1)); }} className="h-8 rounded-lg border border-border px-3 text-xs hover:bg-surface-raised">Today</button>
          <button type="button" aria-label="Previous month" onClick={() => go(-1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised"><ChevronLeftIcon size={15} /></button>
          <button type="button" aria-label="Next month" onClick={() => go(1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised"><ChevronRightIcon size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border">
        {weekdays.map((d) => (
          <span key={d} className="py-2 text-center font-mono text-[10px] uppercase tracking-wider text-subtle">{d}</span>
        ))}
      </div>
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.div key={cursor.toISOString()} custom={dir} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -30 }} transition={{ duration: 0.22 }} className="grid grid-cols-7">
          {days.map((d) => {
            const list = byDay.get(key(d)) ?? [];
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = today && sameDay(d, today);
            const k = key(d);
            const more = list.length - maxPerDay;
            return (
              <div
                key={k}
                role="gridcell"
                onClick={() => onDayClick?.(d)}
                className={cn("relative flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0", !inMonth && "bg-background/40", onDayClick && "cursor-pointer hover:bg-surface-raised/50")}
              >
                <span className={cn("flex size-6 items-center justify-center self-end rounded-full font-mono text-xs", isToday ? "bg-accent font-bold text-accent-foreground" : inMonth ? "text-foreground" : "text-subtle/60")}>{d.getDate()}</span>
                {(expanded === k ? list : list.slice(0, maxPerDay)).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick?.(e);
                    }}
                    className="truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium"
                    style={{ background: `color-mix(in oklab, ${e.color ?? "var(--kn-accent)"} 22%, transparent)`, color: "var(--kn-foreground)", boxShadow: `inset 2px 0 0 ${e.color ?? "var(--kn-accent)"}` }}
                  >
                    {!e.allDay && !e.end ? <span className="mr-1 opacity-60">{e.date.getHours() % 12 || 12}{e.date.getMinutes() ? `:${String(e.date.getMinutes()).padStart(2, "0")}` : ""}{e.date.getHours() < 12 ? "a" : "p"}</span> : null}
                    {e.title}
                  </button>
                ))}
                {more > 0 && expanded !== k ? (
                  <button type="button" onClick={(ev) => { ev.stopPropagation(); setExpanded(k); }} className="px-1.5 text-left text-[11px] text-muted hover:text-foreground">
                    +{more} more
                  </button>
                ) : null}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
