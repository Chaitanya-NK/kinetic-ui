"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type DateRange = { from?: Date; to?: Date };

const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

type CalendarBase = {
  /** Month shown first. */
  defaultMonth?: Date;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  /** Return true to disable a day. */
  disabled?: (date: Date) => boolean;
  locale?: string;
  className?: string;
};

export type CalendarProps =
  | (CalendarBase & { mode?: "single"; selected?: Date; onSelect?: (date: Date) => void })
  | (CalendarBase & { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange) => void });

/** Month grid with single or range selection and full keyboard support. No date library needed. */
export function Calendar(props: CalendarProps) {
  const { weekStartsOn = 0, disabled, locale = "en-US", className } = props;
  const initial = props.defaultMonth ?? (props.mode === "range" ? props.selected?.from : props.selected) ?? new Date();
  const [month, setMonth] = React.useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [focus, setFocus] = React.useState<Date>(startOfDay(initial));
  const [hover, setHover] = React.useState<Date>();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());

  const days = React.useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
  }, [month, weekStartsOn]);

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 7 + i + weekStartsOn)).slice(0, 2),
  );

  const range = props.mode === "range" ? props.selected ?? {} : undefined;
  const choose = (d: Date) => {
    if (disabled?.(d)) return;
    if (props.mode === "range") {
      const r = props.selected ?? {};
      if (!r.from || (r.from && r.to) || d < r.from) props.onSelect?.({ from: d, to: undefined });
      else props.onSelect?.({ from: r.from, to: d });
    } else props.onSelect?.(d);
  };

  const moveFocus = (d: Date) => {
    setFocus(d);
    if (d.getMonth() !== month.getMonth()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus());
  };

  const inRange = (d: Date) => {
    if (!range?.from) return false;
    const end = range.to ?? hover;
    if (!end) return false;
    const [a, b] = range.from <= end ? [range.from, end] : [end, range.from];
    return d > a && d < b;
  };

  return (
    <div className={cn("w-[280px] select-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-overlay hover:text-foreground">
          <ChevronLeftIcon size={16} />
        </button>
        <span aria-live="polite" className="text-sm font-semibold">
          {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month)}
        </span>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-overlay hover:text-foreground">
          <ChevronRightIcon size={16} />
        </button>
      </div>
      <div role="grid" ref={gridRef} className="grid grid-cols-7 gap-y-1 text-center text-sm" onPointerLeave={() => setHover(undefined)}>
        {/* Rows use display:contents so the 7-column grid layout is untouched while assistive tech sees a proper grid. */}
        <div role="row" className="contents">
          {weekdays.map((w) => (
            <span key={w} role="columnheader" className="pb-1 text-[11px] text-subtle">{w}</span>
          ))}
        </div>
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, week) => (
        <div key={week} role="row" className="contents">
        {days.slice(week * 7, week * 7 + 7).map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const isDisabled = disabled?.(d) ?? false;
          const selectedSingle = props.mode !== "range" && sameDay(d, props.selected as Date | undefined);
          const edge = range && (sameDay(d, range.from) || sameDay(d, range.to));
          const mid = range && inRange(d);
          const isFocus = sameDay(d, focus);
          return (
            <span key={d.toISOString()} role="gridcell" className={cn("flex justify-center", mid && "bg-accent-soft")}>
              <button
                type="button"
                tabIndex={isFocus ? 0 : -1}
                data-focus={isFocus}
                disabled={isDisabled}
                aria-selected={selectedSingle || edge || undefined}
                aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(d)}
                onClick={() => {
                  setFocus(d);
                  choose(d);
                }}
                onPointerEnter={() => setHover(d)}
                onKeyDown={(e) => {
                  const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
                  if (map[e.key] !== undefined) {
                    e.preventDefault();
                    moveFocus(addDays(d, map[e.key]!));
                  } else if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(d);
                  }
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-[10px] tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:text-border-strong disabled:line-through",
                  outside ? "text-subtle" : "text-foreground",
                  !selectedSingle && !edge && !isDisabled && "hover:bg-surface-overlay",
                  sameDay(d, today) && !selectedSingle && !edge && "font-semibold text-accent",
                  (selectedSingle || edge) && "bg-accent font-semibold text-accent-foreground",
                  mid && "rounded-none text-accent-soft-foreground",
                )}
              >
                {d.getDate()}
              </button>
            </span>
          );
        })}
        </div>
        ))}
      </div>
    </div>
  );
}

const fmt = (d: Date | undefined, locale: string) =>
  d ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(d) : "";

const triggerClass =
  "flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 text-left text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--kn-ring)] data-[state=open]:border-accent";

export type DatePickerProps = {
  value?: Date;
  onValueChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  locale?: string;
  className?: string;
};

/** Button that opens a Calendar in a popover. */
export function DatePicker({ value, onValueChange, placeholder = "Pick a date", disabled, locale = "en-US", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<Date | undefined>(value);
  const selected = value ?? internal;
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger className={cn(triggerClass, className)}>
        <CalendarIcon size={16} className="text-subtle" />
        <span className={selected ? "" : "text-subtle"}>{selected ? fmt(selected, locale) : placeholder}</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50 rounded-2xl border border-border-strong bg-surface-raised p-4 shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_ease-out]">
          <Calendar
            selected={selected}
            disabled={disabled}
            locale={locale}
            onSelect={(d) => {
              setInternal(d);
              onValueChange?.(d);
              setOpen(false);
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export type DateRangePickerProps = {
  value?: DateRange;
  onValueChange?: (range: DateRange) => void;
  placeholder?: string;
  /** Quick ranges shown above the calendar. Defaults to 7/30/90 days. */
  presets?: { label: string; range: () => DateRange }[];
  locale?: string;
  className?: string;
};

const defaultPresets = [
  { label: "Last 7 days", range: () => ({ from: addDays(startOfDay(new Date()), -6), to: startOfDay(new Date()) }) },
  { label: "Last 30 days", range: () => ({ from: addDays(startOfDay(new Date()), -29), to: startOfDay(new Date()) }) },
  { label: "Last 90 days", range: () => ({ from: addDays(startOfDay(new Date()), -89), to: startOfDay(new Date()) }) },
];

/** Range picker with presets. */
export function DateRangePicker({ value, onValueChange, placeholder = "Select dates", presets = defaultPresets, locale = "en-US", className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<DateRange>(value ?? {});
  const range = value ?? internal;
  const set = (r: DateRange) => {
    setInternal(r);
    onValueChange?.(r);
    if (r.from && r.to) setTimeout(() => setOpen(false), 150);
  };
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger className={cn(triggerClass, className)}>
        <CalendarIcon size={16} className="text-subtle" />
        <span className={range.from ? "" : "text-subtle"}>
          {range.from ? `${fmt(range.from, locale)} – ${range.to ? fmt(range.to, locale) : "…"}` : placeholder}
        </span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50 flex flex-col gap-3 rounded-2xl border border-border-strong bg-surface-raised p-4 shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_ease-out]">
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button key={p.label} type="button" onClick={() => set(p.range())} className="rounded-full border border-border-strong px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-foreground">
                {p.label}
              </button>
            ))}
          </div>
          <Calendar mode="range" selected={range} onSelect={set} locale={locale} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
