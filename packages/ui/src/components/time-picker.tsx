"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type TimeValue = { hours: number; minutes: number };

export type TimePickerProps = {
  value?: TimeValue;
  defaultValue?: TimeValue;
  onValueChange?: (value: TimeValue) => void;
  /** Minute increments. */
  minuteStep?: number;
  /** 12-hour clock with AM/PM column. */
  hour12?: boolean;
  className?: string;
};

const ROW = 40;

function Wheel({
  items,
  index,
  onIndex,
  label,
}: {
  items: string[];
  index: number;
  onIndex: (i: number) => void;
  label: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== index) el.scrollTo({ top: index * ROW, behavior: "smooth" });
  }, [index]);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={(e) => {
        clearTimeout(timer.current);
        const top = e.currentTarget.scrollTop;
        timer.current = setTimeout(() => {
          const i = Math.max(0, Math.min(items.length - 1, Math.round(top / ROW)));
          if (i !== index) onIndex(i);
        }, 90);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          onIndex(Math.min(items.length - 1, index + 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          onIndex(Math.max(0, index - 1));
        }
      }}
      className="relative h-[200px] flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-foreground [&::-webkit-scrollbar]:hidden"
    >
      <div style={{ height: ROW * 2 }} />
      {items.map((it, i) => (
        <div
          key={it}
          role="option"
          aria-selected={i === index}
          onClick={() => onIndex(i)}
          className={cn(
            "flex snap-center items-center justify-center font-display text-xl tabular-nums transition-[color,opacity,transform] duration-150",
            i === index ? "font-semibold text-foreground" : Math.abs(i - index) === 1 ? "text-subtle" : "scale-90 text-border-strong",
          )}
          style={{ height: ROW }}
        >
          {it}
        </div>
      ))}
      <div style={{ height: ROW * 2 }} />
    </div>
  );
}

/** iOS-style scroll wheels for hours, minutes and AM/PM. Scroll, click or use arrow keys. */
export function TimePicker({
  value,
  defaultValue = { hours: 10, minutes: 30 },
  onValueChange,
  minuteStep = 5,
  hour12 = true,
  className,
}: TimePickerProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const t = value ?? internal;
  const set = (next: TimeValue) => {
    if (!value) setInternal(next);
    onValueChange?.(next);
  };

  const hours = hour12 ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")) : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => String(i * minuteStep).padStart(2, "0"));
  const pm = t.hours >= 12;
  const hourIndex = hour12 ? ((t.hours % 12) + 11) % 12 : t.hours;

  return (
    <div className={cn("relative flex w-64 gap-1 rounded-2xl border border-border bg-background p-2", className)}>
      <span aria-hidden className="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-accent-soft" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-2xl bg-gradient-to-b from-background to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-gradient-to-t from-background to-transparent" />
      <Wheel
        label="Hours"
        items={hours}
        index={hourIndex}
        onIndex={(i) => set({ ...t, hours: hour12 ? ((i + 1) % 12) + (pm ? 12 : 0) : i })}
      />
      <Wheel label="Minutes" items={minutes} index={Math.round(t.minutes / minuteStep) % minutes.length} onIndex={(i) => set({ ...t, minutes: i * minuteStep })} />
      {hour12 ? (
        <Wheel label="AM or PM" items={["AM", "PM"]} index={pm ? 1 : 0} onIndex={(i) => set({ ...t, hours: (t.hours % 12) + (i ? 12 : 0) })} />
      ) : null}
    </div>
  );
}

export function formatTime({ hours, minutes }: TimeValue, hour12 = true) {
  if (!hour12) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}
