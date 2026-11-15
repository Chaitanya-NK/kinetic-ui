"use client";

import * as React from "react";
import { cn, useMounted } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  location?: string;
};

export type WeekCalendarProps = {
  events: CalendarEvent[];
  /** Any date inside the week to show first. */
  date?: Date;
  startHour?: number;
  endHour?: number;
  /** First day of the week, 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  onEventClick?: (event: CalendarEvent) => void;
  /** Called with the clicked slot's start time. */
  onSlotClick?: (start: Date) => void;
  className?: string;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOUR = 48;
const fmt = (d: Date) => `${d.getHours() % 12 || 12}${d.getMinutes() ? `:${String(d.getMinutes()).padStart(2, "0")}` : ""}${d.getHours() < 12 ? "am" : "pm"}`;
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Week agenda with hour grid, overlapping-event layout and a live now-line. */
export function WeekCalendar({ events, date, startHour = 8, endHour = 19, weekStartsOn = 1, onEventClick, onSlotClick, className }: WeekCalendarProps) {
  const mounted = useMounted();
  const [anchor, setAnchor] = React.useState(() => date ?? new Date());
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() - weekStartsOn + 7) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const shift = (n: number) => setAnchor((a) => new Date(a.getFullYear(), a.getMonth(), a.getDate() + n * 7));

  const layout = (dayEvents: CalendarEvent[]) => {
    const sorted = [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
    const cols: CalendarEvent[][] = [];
    const placed = new Map<string, { col: number; cols: number }>();
    let cluster: CalendarEvent[] = [];
    let clusterEnd = 0;
    const flush = () => {
      cluster.forEach((e) => (placed.get(e.id)!.cols = cols.length));
      cols.length = 0;
      cluster = [];
    };
    for (const e of sorted) {
      if (e.start.getTime() >= clusterEnd) flush();
      let c = cols.findIndex((col) => col.at(-1)!.end.getTime() <= e.start.getTime());
      if (c < 0) {
        c = cols.length;
        cols.push([]);
      }
      cols[c]!.push(e);
      placed.set(e.id, { col: c, cols: 1 });
      cluster.push(e);
      clusterEnd = Math.max(clusterEnd, e.end.getTime());
    }
    flush();
    return placed;
  };

  const top = (d: Date) => ((d.getHours() + d.getMinutes() / 60 - startHour) * HOUR);

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-sm", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <h3 className="font-display text-base font-semibold">
          {MONTHS[week[0]!.getMonth()]} {week[0]!.getFullYear()}
        </h3>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setAnchor(new Date())} className="h-8 rounded-lg border border-border px-3 text-xs hover:bg-surface-raised">
            Today
          </button>
          <button type="button" aria-label="Previous week" onClick={() => shift(-1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised">
            <ChevronLeftIcon size={15} />
          </button>
          <button type="button" aria-label="Next week" onClick={() => shift(1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-surface-raised">
            <ChevronRightIcon size={15} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[52px_repeat(7,minmax(0,1fr))] border-b border-border">
        <span />
        {week.map((d) => {
          const isToday = mounted && now && sameDay(d, now);
          return (
            <div key={d.toISOString()} className="flex flex-col items-center gap-0.5 py-2">
              <span className="font-mono text-[10px] uppercase text-subtle">{DAYS[d.getDay()]}</span>
              <span className={cn("flex size-7 items-center justify-center rounded-full font-display font-semibold", isToday && "bg-accent text-accent-foreground")}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="relative grid max-h-[420px] grid-cols-[52px_repeat(7,minmax(0,1fr))] overflow-y-auto">
        <div>
          {hours.map((h) => (
            <div key={h} className="relative pr-2 text-right font-mono text-[10px] text-subtle" style={{ height: HOUR }}>
              <span className="-translate-y-1/2 inline-block">{h % 12 || 12}{h < 12 ? "am" : "pm"}</span>
            </div>
          ))}
        </div>
        {week.map((d) => {
          const dayEvents = events.filter((e) => sameDay(e.start, d));
          const pos = layout(dayEvents);
          const isToday = mounted && now && sameDay(d, now);
          return (
            <div key={d.toISOString()} className="relative border-l border-border">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-label={`${DAYS[d.getDay()]} ${h}:00`}
                  onClick={() => onSlotClick?.(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h))}
                  className="block w-full border-b border-border/50 hover:bg-surface-raised/50"
                  style={{ height: HOUR }}
                />
              ))}
              {dayEvents.map((e) => {
                const p = pos.get(e.id)!;
                const t = Math.max(0, top(e.start));
                const h = Math.max(20, top(e.end) - t - 2);
                const c = e.color ?? "var(--kn-accent)";
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onEventClick?.(e)}
                    className="absolute overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left text-[11px] leading-tight transition-[filter] hover:brightness-110"
                    style={{
                      top: t + 1,
                      height: h,
                      left: `calc(${(p.col / p.cols) * 100}% + 2px)`,
                      width: `calc(${100 / p.cols}% - 4px)`,
                      borderColor: c,
                      background: `color-mix(in oklab, ${c} 22%, var(--kn-surface))`,
                    }}
                  >
                    <span className="block truncate font-semibold text-foreground">{e.title}</span>
                    {h > 30 ? <span className="block truncate text-muted">{fmt(e.start)} – {fmt(e.end)}{e.location ? ` · ${e.location}` : ""}</span> : null}
                  </button>
                );
              })}
              {isToday && now && now.getHours() >= startHour && now.getHours() < endHour ? (
                <div className="pointer-events-none absolute inset-x-0 z-[1] h-0.5 bg-danger" style={{ top: top(now) }}>
                  <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-danger" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
