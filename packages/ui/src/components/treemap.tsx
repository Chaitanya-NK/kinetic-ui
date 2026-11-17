"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronRightIcon } from "@kineticui/icons";
import { chartPalette, defaultFormat, useChartSize } from "./charts";

export type TreemapNode = { name: string; value?: number; color?: string; children?: TreemapNode[] };

export type TreemapProps = {
  data: TreemapNode[];
  height?: number;
  format?: (v: number) => string;
  /** Click a group to zoom into it, with a breadcrumb to go back. */
  drilldown?: boolean;
  className?: string;
};

type Rect = { x: number; y: number; w: number; h: number; node: TreemapNode; total: number; color: string };
const sum = (n: TreemapNode): number => n.value ?? (n.children ?? []).reduce((a, c) => a + sum(c), 0);

// Squarified treemap layout (Bruls et al.).
function squarify(items: { node: TreemapNode; v: number; color: string }[], x: number, y: number, w: number, h: number): Rect[] {
  const out: Rect[] = [];
  const total = items.reduce((a, i) => a + i.v, 0) || 1;
  const scale = (w * h) / total;
  let rest = items.map((i) => ({ ...i, a: i.v * scale })).sort((a, b) => b.a - a.a);
  while (rest.length) {
    const short = Math.min(w, h);
    let row: typeof rest = [];
    let worst = Infinity;
    for (const it of rest) {
      const next = [...row, it];
      const s = next.reduce((a, r) => a + r.a, 0);
      const wr = Math.max(...next.map((r) => Math.max((short * short * r.a) / (s * s), (s * s) / (short * short * r.a))));
      if (wr > worst) break;
      worst = wr;
      row = next;
    }
    const s = row.reduce((a, r) => a + r.a, 0);
    const thick = s / short;
    let off = 0;
    for (const r of row) {
      const len = r.a / thick;
      if (w >= h) out.push({ x, y: y + off, w: thick, h: len, node: r.node, total: r.v, color: r.color });
      else out.push({ x: x + off, y, w: len, h: thick, node: r.node, total: r.v, color: r.color });
      off += len;
    }
    if (w >= h) { x += thick; w -= thick; } else { y += thick; h -= thick; }
    rest = rest.slice(row.length);
  }
  return out;
}

/** Squarified treemap with hover detail and click-to-zoom drilldown. */
export function Treemap({ data, height = 360, format = defaultFormat, drilldown = true, className }: TreemapProps) {
  const [ref, w] = useChartSize<HTMLDivElement>();
  const [path, setPath] = React.useState<TreemapNode[]>([]);
  const [hover, setHover] = React.useState<string | null>(null);
  const level = path.length ? path[path.length - 1]!.children ?? [] : data;
  const baseColor = (i: number, n: TreemapNode) => n.color ?? (path.length ? path[0]!.color ?? chartPalette[data.indexOf(path[0]!) % chartPalette.length]! : chartPalette[i % chartPalette.length]!);
  const rects = squarify(level.map((n, i) => ({ node: n, v: sum(n), color: baseColor(i, n) })), 0, 0, w, height);
  const grand = rects.reduce((a, r) => a + r.total, 0) || 1;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {drilldown ? (
        <nav aria-label="Treemap level" className="flex items-center gap-1 text-sm">
          <button type="button" onClick={() => setPath([])} className={cn("rounded-md px-1.5 py-0.5 transition-colors hover:bg-surface-overlay", !path.length ? "font-medium text-foreground" : "text-subtle")}>All</button>
          {path.map((p, i) => (
            <React.Fragment key={p.name}>
              <ChevronRightIcon size={13} className="text-subtle" />
              <button type="button" onClick={() => setPath(path.slice(0, i + 1))} className={cn("rounded-md px-1.5 py-0.5 hover:bg-surface-overlay", i === path.length - 1 ? "font-medium text-foreground" : "text-subtle")}>{p.name}</button>
            </React.Fragment>
          ))}
        </nav>
      ) : null}
      <div ref={ref} className="relative w-full overflow-hidden rounded-xl" style={{ height }} role="list" aria-label="Treemap">
        <AnimatePresence mode="popLayout" initial={false}>
          {rects.map((r, i) => {
            const canDrill = drilldown && !!r.node.children?.length;
            const big = r.w > 90 && r.h > 50;
            const shade = path.length ? 0.35 + 0.65 * (1 - i / Math.max(1, rects.length)) : 1;
            return (
              <motion.button
                key={`${path.map((p) => p.name).join("/")}/${r.node.name}`}
                type="button"
                role="listitem"
                aria-label={`${r.node.name}: ${format(r.total)} (${Math.round((r.total / grand) * 100)}%)`}
                disabled={!canDrill}
                onClick={() => canDrill && setPath([...path, r.node])}
                onPointerEnter={() => setHover(r.node.name)}
                onPointerLeave={() => setHover(null)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: hover && hover !== r.node.name ? 0.55 : 1, scale: 1, left: r.x, top: r.y, width: r.w, height: r.h }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, delay: i * 0.012 }}
                className="absolute p-[2px] text-left disabled:cursor-default"
              >
                <span className="relative flex size-full flex-col justify-between overflow-hidden rounded-lg p-2.5" style={{ background: `color-mix(in srgb, ${r.color} ${Math.round(22 + shade * 18)}%, var(--kn-surface))` }}>
                  {big || (r.w > 56 && r.h > 30) ? <span className="truncate text-xs font-semibold text-foreground">{r.node.name}</span> : null}
                  {big ? (
                    <span className="flex items-end justify-between gap-2">
                      <span className="font-mono text-[11px] text-foreground">{format(r.total)}</span>
                      <span className="font-mono text-[10px] text-foreground">{Math.round((r.total / grand) * 100)}%</span>
                    </span>
                  ) : null}
                  {canDrill && big ? <ChevronRightIcon size={12} className="absolute right-2 top-2.5 text-foreground/60" /> : null}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
