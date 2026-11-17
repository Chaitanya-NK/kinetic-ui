"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChartTooltip, chartPalette, defaultFormat, useChartSize, type ChartTip } from "./charts";

export type SankeyNode = { id: string; label?: string; color?: string };
export type SankeyLink = { source: string; target: string; value: number };

export type SankeyChartProps = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  /** Width of each node bar in px. */
  nodeWidth?: number;
  /** Vertical gap between nodes in a column. */
  nodePadding?: number;
  format?: (v: number) => string;
  /** Colour links by their source node, or as a gradient from source to target. */
  linkColor?: "source" | "gradient";
  className?: string;
};

type LNode = SankeyNode & { col: number; value: number; x: number; y: number; h: number; color: string; inV: number; outV: number; inL: LLink[]; outL: LLink[] };
type LLink = SankeyLink & { i: number; s: LNode; t: LNode; w: number; sy: number; ty: number };

function layout(nodes: SankeyNode[], links: SankeyLink[], W: number, H: number, nw: number, pad: number) {
  const map = new Map<string, LNode>();
  nodes.forEach((n, i) =>
    map.set(n.id, { ...n, col: 0, value: 0, x: 0, y: 0, h: 0, color: n.color ?? chartPalette[i % (chartPalette.length - 1)]!, inV: 0, outV: 0, inL: [], outL: [] }),
  );
  const ls: LLink[] = [];
  links.forEach((l, i) => {
    const s = map.get(l.source), t = map.get(l.target);
    if (!s || !t || l.value <= 0) return;
    const link = { ...l, i, s, t, w: 0, sy: 0, ty: 0 };
    s.outL.push(link);
    t.inL.push(link);
    s.outV += l.value;
    t.inV += l.value;
    ls.push(link);
  });
  const all = [...map.values()];
  for (const n of all) n.value = Math.max(n.inV, n.outV);

  // Columns: longest path from a source (guards against cycles).
  for (let pass = 0; pass < all.length; pass++) {
    let changed = false;
    for (const l of ls) if (l.t.col < l.s.col + 1) { l.t.col = l.s.col + 1; changed = true; }
    if (!changed) break;
  }
  const maxCol = Math.max(0, ...all.map((n) => n.col));
  // Push sinks to the last column.
  for (const n of all) if (!n.outL.length && n.inL.length) n.col = maxCol;
  const cols = Array.from({ length: maxCol + 1 }, (_, c) => all.filter((n) => n.col === c));

  const ky = Math.min(...cols.map((c) => (H - pad * Math.max(0, c.length - 1)) / (c.reduce((a, n) => a + n.value, 0) || 1)));
  for (const n of all) {
    n.h = Math.max(2, n.value * ky);
    n.x = maxCol ? (n.col / maxCol) * (W - nw) : 0;
  }
  const place = (c: LNode[]) => {
    const total = c.reduce((a, n) => a + n.h, 0) + pad * (c.length - 1);
    let y = Math.max(0, (H - total) / 2);
    for (const n of c) { n.y = y; y += n.h + pad; }
  };
  cols.forEach(place);

  // A few relaxation passes: order each column by the weighted centre of its neighbours.
  const centre = (n: LNode, dir: "in" | "out") => {
    const list = dir === "in" ? n.inL : n.outL;
    const v = list.reduce((a, l) => a + l.value, 0);
    if (!v) return n.y + n.h / 2;
    return list.reduce((a, l) => a + ((dir === "in" ? l.s : l.t).y + (dir === "in" ? l.s : l.t).h / 2) * l.value, 0) / v;
  };
  for (let it = 0; it < 6; it++) {
    const order = it % 2 === 0 ? cols : [...cols].reverse();
    for (const c of order) {
      c.sort((a, b) => centre(a, it % 2 === 0 ? "in" : "out") - centre(b, it % 2 === 0 ? "in" : "out"));
      place(c);
    }
  }

  for (const n of all) {
    n.outL.sort((a, b) => a.t.y - b.t.y);
    n.inL.sort((a, b) => a.s.y - b.s.y);
    let sy = n.y, ty = n.y;
    for (const l of n.outL) { l.w = l.value * ky; l.sy = sy; sy += l.w; }
    for (const l of n.inL) { l.ty = ty; ty += l.value * ky; }
  }
  return { nodes: all, links: ls, maxCol };
}

const band = (l: LLink, nw: number) => {
  const x0 = l.s.x + nw, x1 = l.t.x, xm = (x0 + x1) / 2;
  const a = l.sy, b = l.ty, w = l.w;
  return `M${x0},${a} C${xm},${a} ${xm},${b} ${x1},${b} L${x1},${b + w} C${xm},${b + w} ${xm},${a + w} ${x0},${a + w} Z`;
};

/** A flow diagram: values split and merge across stages. Hover a node or a band to trace it. */
export function SankeyChart({ nodes, links, height = 380, nodeWidth = 12, nodePadding = 18, format = defaultFormat, linkColor = "gradient", className }: SankeyChartProps) {
  const [ref, width] = useChartSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<{ node?: string; link?: number } | null>(null);
  const [tip, setTip] = React.useState<ChartTip>(null);
  const id = React.useId().replace(/:/g, "");
  const labelW = 110;
  const W = Math.max(200, width - labelW * 2), H = height - 8;
  const g = React.useMemo(() => layout(nodes, links, W, H, nodeWidth, nodePadding), [nodes, links, W, H, nodeWidth, nodePadding]);

  const lit = (l: LLink) => !hover || hover.link === l.i || hover.node === l.source || hover.node === l.target;
  const litNode = (n: LNode) => {
    if (!hover) return true;
    if (hover.node) return hover.node === n.id || n.inL.some((l) => l.source === hover.node) || n.outL.some((l) => l.target === hover.node);
    const l = g.links.find((x) => x.i === hover.link);
    return !!l && (l.s.id === n.id || l.t.id === n.id);
  };

  const local = (e: React.PointerEvent) => {
    const r = (ref.current as HTMLDivElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div ref={ref} className={cn("relative w-full", className)} onPointerLeave={() => { setHover(null); setTip(null); }}>
      <svg width="100%" height={height} role="img" aria-label={`Flow chart with ${g.nodes.length} stages`} className="overflow-visible">
        <defs>
          {g.links.map((l) => (
            <linearGradient key={l.i} id={`${id}-g${l.i}`} gradientUnits="userSpaceOnUse" x1={l.s.x + nodeWidth} x2={l.t.x}>
              <stop offset="0%" stopColor={l.s.color} />
              <stop offset="100%" stopColor={linkColor === "gradient" ? l.t.color : l.s.color} />
            </linearGradient>
          ))}
          <clipPath id={`${id}-reveal`}>
            <motion.rect x={-10} y={-10} height={height + 20} initial={{ width: 0 }} animate={{ width: W + 20 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
          </clipPath>
        </defs>
        <g transform={`translate(${labelW} 4)`}>
          <g clipPath={`url(#${id}-reveal)`}>
            {g.links.map((l) => (
              <path
                key={l.i}
                d={band(l, nodeWidth)}
                fill={`url(#${id}-g${l.i})`}
                className="cursor-pointer transition-opacity duration-200"
                opacity={lit(l) ? (hover ? 0.6 : 0.35) : 0.07}
                onPointerMove={(e) => {
                  setHover({ link: l.i });
                  const p = local(e);
                  setTip({ x: p.x, y: p.y, label: `${l.s.label ?? l.s.id} → ${l.t.label ?? l.t.id}`, rows: [{ name: "Flow", value: format(l.value), color: l.s.color }, { name: `Share of ${l.s.label ?? l.s.id}`, value: `${Math.round((l.value / l.s.outV) * 100)}%`, color: l.s.color }] });
                }}
              >
                <title>{`${l.s.label ?? l.s.id} to ${l.t.label ?? l.t.id}: ${format(l.value)}`}</title>
              </path>
            ))}
          </g>
          {g.nodes.map((n, k) => {
            const last = n.col === g.maxCol && g.maxCol > 0;
            return (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: litNode(n) ? 1 : 0.35, y: 0 }}
                transition={{ delay: hover ? 0 : 0.05 * n.col + 0.01 * k, duration: 0.35 }}
                onPointerMove={(e) => {
                  setHover({ node: n.id });
                  const p = local(e);
                  setTip({ x: p.x, y: p.y, label: n.label ?? n.id, rows: [...(n.inV ? [{ name: "In", value: format(n.inV), color: n.color }] : []), ...(n.outV ? [{ name: "Out", value: format(n.outV), color: n.color }] : [])] });
                }}
                className="cursor-pointer"
              >
                <rect x={n.x} y={n.y} width={nodeWidth} height={n.h} rx={3} fill={n.color} />
                <text x={last ? n.x + nodeWidth + 8 : n.x - 8} y={n.y + n.h / 2} textAnchor={last ? "start" : "end"} dominantBaseline="middle" className="fill-[var(--kn-foreground)] text-[12px] font-medium"
                  style={{ paintOrder: "stroke", stroke: "var(--kn-background)", strokeWidth: 4, strokeLinejoin: "round" }}
                >
                  {n.label ?? n.id}
                  <tspan className="fill-[var(--kn-muted)] font-mono text-[11px] font-normal" dx={6}>
                    {format(n.value)}
                  </tspan>
                </text>
              </motion.g>
            );
          })}
        </g>
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  );
}
