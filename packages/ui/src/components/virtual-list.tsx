"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { ArrowDownIcon, ArrowUpIcon } from "@kineticui/icons";

/* A dependency-free windowing engine: only the rows in view (plus overscan) are in the DOM. */
function useWindow(count: number, rowHeight: number, overscan: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScroll(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  const start = Math.max(0, Math.floor(scroll / rowHeight) - overscan);
  const end = Math.min(count, Math.ceil((scroll + height) / rowHeight) + overscan);
  return { ref, start, end, total: count * rowHeight, scroll };
}

export type VirtualListHandle = { scrollToIndex: (index: number, align?: "start" | "center" | "end") => void };

export type VirtualListProps<T> = {
  items: T[];
  /** Fixed row height in px. */
  rowHeight: number;
  /** Viewport height (px or any CSS length). */
  height: number | string;
  overscan?: number;
  getKey?: (item: T, index: number) => React.Key;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  /** Called with the visible range, e.g. to load more near the end. */
  onRangeChange?: (start: number, end: number) => void;
  "aria-label"?: string;
};

function VirtualListInner<T>(
  { items, rowHeight, height, overscan = 6, getKey, renderItem, className, onRangeChange, "aria-label": label }: VirtualListProps<T>,
  handle: React.Ref<VirtualListHandle>,
) {
  const { ref, start, end, total } = useWindow(items.length, rowHeight, overscan);
  React.useImperativeHandle(handle, () => ({
    scrollToIndex: (i, align = "start") => {
      const el = ref.current;
      if (!el) return;
      const top = i * rowHeight - (align === "center" ? el.clientHeight / 2 - rowHeight / 2 : align === "end" ? el.clientHeight - rowHeight : 0);
      el.scrollTo({ top, behavior: "smooth" });
    },
  }));
  React.useEffect(() => onRangeChange?.(start, end), [start, end, onRangeChange]);
  return (
    <div ref={ref} role="list" aria-label={label} tabIndex={0} style={{ height }} className={cn("relative overflow-auto overscroll-contain outline-none [scrollbar-color:var(--kn-border-strong)_transparent] [scrollbar-width:thin]", className)}>
      <div style={{ height: total, position: "relative" }}>
        {items.slice(start, end).map((item, k) => {
          const i = start + k;
          return (
            <div key={getKey ? getKey(item, i) : i} role="listitem" aria-setsize={items.length} aria-posinset={i + 1} style={{ position: "absolute", top: i * rowHeight, height: rowHeight, left: 0, right: 0 }}>
              {renderItem(item, i)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Renders 100,000+ rows smoothly by only mounting what's on screen. No dependencies. */
export const VirtualList = React.forwardRef(VirtualListInner) as <T>(p: VirtualListProps<T> & { ref?: React.Ref<VirtualListHandle> }) => React.ReactElement;

export type VirtualColumn<T> = {
  key: string;
  header: React.ReactNode;
  /** CSS grid track, e.g. "120px" or "2fr". */
  width?: string;
  align?: "left" | "right" | "center";
  /** Return a comparable value to make the column sortable. */
  sortValue?: (row: T) => string | number;
  render: (row: T, index: number) => React.ReactNode;
};

export type VirtualTableProps<T> = {
  rows: T[];
  columns: VirtualColumn<T>[];
  rowHeight?: number;
  height: number | string;
  getKey?: (row: T, index: number) => React.Key;
  onRowClick?: (row: T) => void;
  className?: string;
  /** Show the "rendering N of M" counter. */
  showStats?: boolean;
};

/** Sticky-header table that virtualises rows, with click-to-sort columns and keyboard row focus. */
export function VirtualTable<T>({ rows, columns, rowHeight = 44, height, getKey, onRowClick, className, showStats = false }: VirtualTableProps<T>) {
  const [sort, setSort] = React.useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sortValue!(a), y = col.sortValue!(b);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [rows, columns, sort]);
  const { ref, start, end, total } = useWindow(sorted.length, rowHeight, 8);
  const template = columns.map((c) => c.width ?? "1fr").join(" ");
  const align = (a?: string) => (a === "right" ? "justify-end text-right" : a === "center" ? "justify-center text-center" : "justify-start");

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div ref={ref} role="grid" aria-rowcount={sorted.length + 1} style={{ height }} className="overflow-auto overscroll-contain [scrollbar-color:var(--kn-border-strong)_transparent] [scrollbar-width:thin]">
        <div role="row" aria-rowindex={1} style={{ gridTemplateColumns: template }} className="sticky top-0 z-10 grid min-w-full border-b border-border bg-surface-raised/95 backdrop-blur">
          {columns.map((c) => {
            const active = sort?.key === c.key;
            return (
              <div key={c.key} role="columnheader" aria-sort={active ? (sort!.dir === 1 ? "ascending" : "descending") : undefined} className={cn("flex items-center px-4 text-xs font-medium text-subtle", align(c.align))} style={{ height: rowHeight }}>
                {c.sortValue ? (
                  <button
                    type="button"
                    onClick={() => setSort(active ? (sort!.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 })}
                    className={cn("flex items-center gap-1 rounded-md transition-colors hover:text-foreground", active && "text-foreground")}
                  >
                    {c.header}
                    <span className={cn("transition-opacity", active ? "opacity-100" : "opacity-0")}>{sort?.dir === -1 && active ? <ArrowDownIcon size={12} /> : <ArrowUpIcon size={12} />}</span>
                  </button>
                ) : (
                  c.header
                )}
              </div>
            );
          })}
        </div>
        <div style={{ height: total, position: "relative" }}>
          {sorted.slice(start, end).map((row, k) => {
            const i = start + k;
            return (
              <div
                key={getKey ? getKey(row, i) : i}
                role="row"
                aria-rowindex={i + 2}
                tabIndex={onRowClick ? 0 : -1}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(row) : undefined}
                style={{ position: "absolute", top: i * rowHeight, height: rowHeight, left: 0, right: 0, gridTemplateColumns: template }}
                className={cn("grid border-b border-border/60 text-sm outline-none transition-colors hover:bg-surface-raised focus-visible:bg-accent-soft/40", onRowClick && "cursor-pointer")}
              >
                {columns.map((c) => (
                  <div key={c.key} role="gridcell" className={cn("flex min-w-0 items-center truncate px-4", align(c.align))}>
                    {c.render(row, i)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {showStats ? (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-border-strong bg-background/85 px-3 py-1 font-mono text-[11px] text-subtle backdrop-blur">
          rendering <b className="text-accent">{end - start}</b> of {sorted.length.toLocaleString("en-US")} rows
        </span>
      ) : null}
    </div>
  );
}
