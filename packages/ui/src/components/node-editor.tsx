"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";
import { CheckIcon, MaximizeIcon, MinusIcon, PlusIcon } from "@kineticui/icons";

/* ------------------------------------------------------------------ types */

export type NodePort = { id: string; label?: string; /** Colour of the port dot, e.g. per data type. */ color?: string };
export type NodeStatus = "idle" | "running" | "done" | "error";

export type EditorNode = {
  id: string;
  x: number;
  y: number;
  title: React.ReactNode;
  /** Shown before the title. */
  icon?: React.ReactNode;
  /** Accent for the header dot and the selected ring. */
  color?: string;
  inputs?: NodePort[];
  outputs?: NodePort[];
  /** Anything under the ports: settings, a preview, a textarea. Mark interactive bits with data-nodrag. */
  content?: React.ReactNode;
  status?: NodeStatus;
  width?: number;
};

export type PortRef = { node: string; port: string };
export type EditorEdge = { id: string; from: PortRef; to: PortRef; /** Marching dashes along the wire. */ animated?: boolean; label?: string };
export type Viewport = { x: number; y: number; k: number };

export type NodeEditorProps = {
  nodes?: EditorNode[];
  defaultNodes?: EditorNode[];
  onNodesChange?: (nodes: EditorNode[]) => void;
  edges?: EditorEdge[];
  defaultEdges?: EditorEdge[];
  onEdgesChange?: (edges: EditorEdge[]) => void;
  /** Return false to refuse a connection. */
  isValidConnection?: (from: PortRef, to: PortRef) => boolean;
  selected?: string | null;
  onSelectionChange?: (id: string | null) => void;
  /** Lock nodes and wires in place; pan and zoom still work. */
  readOnly?: boolean;
  minimap?: boolean;
  controls?: boolean;
  /** Fit all nodes in view on mount. */
  fitView?: boolean;
  minZoom?: number;
  maxZoom?: number;
  /** Plain wheel pans the canvas instead of scrolling the page. Pinch or Ctrl + wheel always zooms. */
  scrollToPan?: boolean;
  className?: string;
};

const HEADER = 40;
const ROW = 28;
const PAD = 6;
const W = 224;

const portY = (n: EditorNode, i: number) => n.y + HEADER + PAD + i * ROW + ROW / 2;
const portPos = (n: EditorNode, side: "in" | "out", id: string) => {
  const list = (side === "in" ? n.inputs : n.outputs) ?? [];
  const i = Math.max(0, list.findIndex((p) => p.id === id));
  return { x: side === "in" ? n.x : n.x + (n.width ?? W), y: portY(n, i) };
};
const wire = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.max(50, Math.abs(x2 - x1) * 0.5);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
};
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Drag =
  | { kind: "pan"; sx: number; sy: number; vx: number; vy: number }
  | { kind: "node"; id: string; ox: number; oy: number; moved: boolean }
  | { kind: "wire"; from: PortRef }
  | { kind: "mini" };

/* ------------------------------------------------------------------ component */

/**
 * A node-graph editor: drag nodes, wire outputs to inputs with bezier cables, pan, zoom, minimap.
 * Controlled or uncontrolled, no dependencies beyond React and Motion.
 */
export function NodeEditor({
  nodes: nodesProp,
  defaultNodes = [],
  onNodesChange,
  edges: edgesProp,
  defaultEdges = [],
  onEdgesChange,
  isValidConnection,
  selected: selectedProp,
  onSelectionChange,
  readOnly = false,
  minimap = true,
  controls = true,
  fitView = true,
  minZoom = 0.3,
  maxZoom = 2,
  scrollToPan = false,
  className,
}: NodeEditorProps) {
  const [nodes, setNodes] = useControllableState({ value: nodesProp, defaultValue: defaultNodes, onChange: onNodesChange });
  const [edges, setEdges] = useControllableState({ value: edgesProp, defaultValue: defaultEdges, onChange: onEdgesChange });
  const [selected, setSelected] = useControllableState<string | null>({ value: selectedProp, defaultValue: null, onChange: onSelectionChange });
  const [vp, setVp] = React.useState<Viewport>({ x: 0, y: 0, k: 1 });
  const [smooth, setSmooth] = React.useState(false);
  const [size, setSize] = React.useState({ w: 800, h: 500 });
  const [pending, setPending] = React.useState<{ from: PortRef; x: number; y: number } | null>(null);
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const root = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<Drag | null>(null);
  const live = React.useRef({ nodes, vp });
  live.current = { nodes, vp };
  const byId = React.useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  /* ---- sizing & fit */
  const bounds = React.useCallback(
    (list = nodes) => {
      if (!list.length) return { x: 0, y: 0, w: 1, h: 1 };
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of list) {
        x0 = Math.min(x0, n.x);
        y0 = Math.min(y0, n.y);
        x1 = Math.max(x1, n.x + (n.width ?? W));
        y1 = Math.max(y1, n.y + (heights[n.id] ?? 120));
      }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    },
    [nodes, heights],
  );

  const fit = React.useCallback(
    (animated = true) => {
      const el = root.current;
      if (!el) return;
      const b = bounds();
      // Keep the bottom strip clear for the controls and minimap.
      const w = el.clientWidth, h = el.clientHeight, pad = 40, bottom = minimap ? 120 + 24 : controls ? 56 : pad;
      const k = clamp(Math.min((w - pad * 2) / b.w, (h - pad - bottom) / b.h), minZoom, 1);
      setSmooth(animated);
      setVp({ k, x: (w - b.w * k) / 2 - b.x * k, y: pad + (h - pad - bottom - b.h * k) / 2 - b.y * k });
    },
    [bounds, minZoom, minimap, controls],
  );

  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fitted = React.useRef(false);
  React.useEffect(() => {
    if (!fitView || fitted.current || !Object.keys(heights).length) return;
    fitted.current = true;
    fit(false);
  }, [fitView, fit, heights]);

  const measure = React.useCallback((id: string, el: HTMLElement | null) => {
    if (!el) return;
    const h = el.offsetHeight;
    setHeights((m) => (m[id] === h ? m : { ...m, [id]: h }));
  }, []);

  /* ---- zoom */
  const zoomAt = React.useCallback(
    (factor: number, px?: number, py?: number, animated = false) => {
      const el = root.current;
      if (!el) return;
      const { vp: v } = live.current;
      const cx = px ?? el.clientWidth / 2, cy = py ?? el.clientHeight / 2;
      const k = clamp(v.k * factor, minZoom, maxZoom);
      setSmooth(animated);
      setVp({ k, x: cx - (cx - v.x) * (k / v.k), y: cy - (cy - v.y) * (k / v.k) });
    },
    [minZoom, maxZoom],
  );

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
      } else if (scrollToPan) {
        e.preventDefault();
        setSmooth(false);
        setVp((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, scrollToPan]);

  /* ---- pointer */
  const toWorld = (cx: number, cy: number) => {
    const r = root.current!.getBoundingClientRect();
    const { vp: v } = live.current;
    return { x: (cx - r.left - v.x) / v.k, y: (cy - r.top - v.y) / v.k };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-nodrag],[data-controls]")) return;
    const port = t.closest<HTMLElement>("[data-port]");
    const nodeEl = t.closest<HTMLElement>("[data-node]");
    const edgeEl = t.closest<SVGElement>("[data-edge]");
    setSmooth(false);

    if (port && !readOnly) {
      const ref = { node: port.dataset.portNode!, port: port.dataset.portId! };
      if (port.dataset.port === "out") drag.current = { kind: "wire", from: ref };
      else {
        // Pick up an existing wire from an input and move it somewhere else.
        const existing = edges.find((ed) => ed.to.node === ref.node && ed.to.port === ref.port);
        if (!existing) return;
        setEdges(edges.filter((ed) => ed !== existing));
        drag.current = { kind: "wire", from: existing.from };
      }
      const w = toWorld(e.clientX, e.clientY);
      setPending({ from: (drag.current as { from: PortRef }).from, ...w });
    } else if (edgeEl) {
      setSelected(edgeEl.dataset.edge!);
      return;
    } else if (nodeEl) {
      const id = nodeEl.dataset.node!;
      setSelected(id);
      root.current?.focus({ preventScroll: true });
      if (readOnly) return;
      const n = byId.get(id)!;
      const w = toWorld(e.clientX, e.clientY);
      drag.current = { kind: "node", id, ox: w.x - n.x, oy: w.y - n.y, moved: false };
    } else {
      setSelected(null);
      root.current?.focus({ preventScroll: true });
      drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, vx: vp.x, vy: vp.y };
    }
    root.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pan") setVp((v) => ({ ...v, x: d.vx + e.clientX - d.sx, y: d.vy + e.clientY - d.sy }));
    else if (d.kind === "node") {
      const w = toWorld(e.clientX, e.clientY);
      d.moved = true;
      setNodes(live.current.nodes.map((n) => (n.id === d.id ? { ...n, x: Math.round(w.x - d.ox), y: Math.round(w.y - d.oy) } : n)));
    } else if (d.kind === "wire") setPending({ from: d.from, ...toWorld(e.clientX, e.clientY) });
    else if (d.kind === "mini") miniMove(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d?.kind === "wire") {
      setPending(null);
      const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-port="in"]');
      if (!hit) return;
      const to = { node: hit.dataset.portNode!, port: hit.dataset.portId! };
      if (to.node === d.from.node) return;
      if (isValidConnection && !isValidConnection(d.from, to)) return;
      const id = `${d.from.node}.${d.from.port}->${to.node}.${to.port}`;
      if (edges.some((ed) => ed.id === id)) return;
      // An input takes one wire; a new one replaces the old.
      setEdges([...edges.filter((ed) => !(ed.to.node === to.node && ed.to.port === to.port)), { id, from: d.from, to }]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("[data-nodrag]")) return;
    if (e.key === "+" || e.key === "=") zoomAt(1.2, undefined, undefined, true);
    else if (e.key === "-") zoomAt(1 / 1.2, undefined, undefined, true);
    else if (e.key === "0") fit();
    else if ((e.key === "Delete" || e.key === "Backspace") && selected && !readOnly) {
      if (byId.has(selected)) {
        setNodes(nodes.filter((n) => n.id !== selected));
        setEdges(edges.filter((ed) => ed.from.node !== selected && ed.to.node !== selected));
      } else setEdges(edges.filter((ed) => ed.id !== selected));
      setSelected(null);
    } else if (e.key.startsWith("Arrow") && selected && byId.has(selected) && !readOnly) {
      const step = e.shiftKey ? 40 : 10;
      const [dx, dy] = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key] ?? [0, 0];
      setNodes(nodes.map((n) => (n.id === selected ? { ...n, x: n.x + dx!, y: n.y + dy! } : n)));
    } else if (e.key === "Escape") setSelected(null);
    else return;
    e.preventDefault();
  };

  /* ---- minimap */
  const MW = 184, MH = 120;
  const world = React.useMemo(() => {
    const b = bounds();
    const view = { x: -vp.x / vp.k, y: -vp.y / vp.k, w: size.w / vp.k, h: size.h / vp.k };
    const x0 = Math.min(b.x, view.x) - 40, y0 = Math.min(b.y, view.y) - 40;
    const x1 = Math.max(b.x + b.w, view.x + view.w) + 40, y1 = Math.max(b.y + b.h, view.y + view.h) + 40;
    const s = Math.min(MW / (x1 - x0), MH / (y1 - y0));
    return { x0, y0, s, view, ox: (MW - (x1 - x0) * s) / 2, oy: (MH - (y1 - y0) * s) / 2 };
  }, [bounds, vp, size]);
  const miniRef = React.useRef<SVGSVGElement>(null);
  const miniMove = (cx: number, cy: number) => {
    const r = miniRef.current!.getBoundingClientRect();
    const wx = (cx - r.left - world.ox) / world.s + world.x0;
    const wy = (cy - r.top - world.oy) / world.s + world.y0;
    setVp((v) => ({ ...v, x: size.w / 2 - wx * v.k, y: size.h / 2 - wy * v.k }));
  };

  /* ---- render */
  const active = (ed: EditorEdge) => byId.get(ed.from.node)?.status === "running" || ed.animated;
  const tx = smooth ? "transform .4s cubic-bezier(.16,1,.3,1)" : undefined;

  return (
    <div
      ref={root}
      tabIndex={0}
      role="application"
      aria-roledescription="node editor"
      aria-label={`Node editor, ${nodes.length} nodes, ${edges.length} connections. Drag to pan, Ctrl and scroll to zoom.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn("relative h-[32rem] w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring", drag.current?.kind === "pan" ? "cursor-grabbing" : "cursor-grab", className)}
      style={{
        backgroundImage: "radial-gradient(circle, var(--kn-border-strong) 1px, transparent 1.2px)",
        backgroundSize: `${22 * vp.k}px ${22 * vp.k}px`,
        backgroundPosition: `${vp.x}px ${vp.y}px`,
      }}
    >
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.k})`, transition: tx }}>
        {/* wires */}
        <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={1} height={1}>
          {edges.map((ed) => {
            const a = byId.get(ed.from.node), b = byId.get(ed.to.node);
            if (!a || !b) return null;
            const p = portPos(a, "out", ed.from.port), q = portPos(b, "in", ed.to.port);
            const d = wire(p.x, p.y, q.x, q.y);
            const on = selected === ed.id || selected === a.id || selected === b.id;
            const run = active(ed);
            return (
              <g key={ed.id}>
                <path d={d} data-edge={ed.id} fill="none" stroke="transparent" strokeWidth={14} className="pointer-events-[stroke] cursor-pointer" style={{ pointerEvents: "stroke" }} />
                <motion.path
                  d={d}
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  stroke={on || run ? "var(--kn-accent)" : "var(--kn-border-strong)"}
                  strokeWidth={on ? 2.5 : 2}
                />
                {run && (
                  <path d={d} fill="none" stroke="var(--kn-accent)" strokeWidth={2.5} strokeDasharray="4 10" strokeLinecap="round" opacity={0.9}>
                    <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.6s" repeatCount="indefinite" />
                  </path>
                )}
                {ed.label && (
                  <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 8} textAnchor="middle" className="fill-[var(--kn-muted)] font-mono text-[10px]">
                    {ed.label}
                  </text>
                )}
              </g>
            );
          })}
          {pending &&
            (() => {
              const a = byId.get(pending.from.node);
              if (!a) return null;
              const p = portPos(a, "out", pending.from.port);
              return <path d={wire(p.x, p.y, pending.x, pending.y)} fill="none" stroke="var(--kn-accent)" strokeWidth={2} strokeDasharray="6 5" />;
            })()}
        </svg>

        {/* nodes */}
        {nodes.map((n) => {
          const rows = Math.max(n.inputs?.length ?? 0, n.outputs?.length ?? 0);
          const isSel = selected === n.id;
          return (
            <motion.div
              key={n.id}
              ref={(el: HTMLDivElement | null) => measure(n.id, el)}
              data-node={n.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={cn(
                "absolute cursor-default rounded-xl border bg-surface-raised shadow-overlay transition-[border-color,box-shadow]",
                isSel ? "border-accent ring-4 ring-accent/15" : "border-border",
                n.status === "running" && "border-accent/70",
                n.status === "error" && "border-danger",
              )}
              style={{ left: n.x, top: n.y, width: n.width ?? W }}
            >
              <div className="flex items-center gap-2 border-b border-border px-3" style={{ height: HEADER }}>
                <span className="grid size-5 shrink-0 place-items-center rounded-md text-[11px]" style={{ background: `color-mix(in oklab, ${n.color ?? "var(--kn-accent)"} 18%, transparent)`, color: n.color ?? "var(--kn-accent)" }}>
                  {n.icon ?? <span className="size-1.5 rounded-full bg-current" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">{n.title}</span>
                {n.status === "running" && <span className="size-3.5 animate-kn-spin rounded-full border-2 border-accent border-t-transparent" aria-label="Running" />}
                {n.status === "done" && <CheckIcon className="size-3.5 text-success" aria-label="Done" />}
                {n.status === "error" && <span className="size-2 rounded-full bg-danger" aria-label="Error" />}
              </div>
              {rows > 0 && (
                <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
                  {Array.from({ length: rows }, (_, i) => {
                    const inp = n.inputs?.[i], out = n.outputs?.[i];
                    return (
                      <div key={i} className="relative flex items-center justify-between px-3 text-[11px] text-muted" style={{ height: ROW }}>
                        <span>{inp?.label ?? inp?.id}</span>
                        <span>{out?.label ?? out?.id}</span>
                        {inp && <Port side="in" node={n.id} port={inp} connected={edges.some((ed) => ed.to.node === n.id && ed.to.port === inp.id)} />}
                        {out && <Port side="out" node={n.id} port={out} connected={edges.some((ed) => ed.from.node === n.id && ed.from.port === out.id)} />}
                      </div>
                    );
                  })}
                </div>
              )}
              {n.content && <div className="border-t border-border p-3 text-xs text-muted">{n.content}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* controls */}
      {controls && (
        <div data-controls className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-xl border border-border bg-surface-raised/90 p-1 shadow-overlay backdrop-blur">
          <CtrlButton label="Zoom out" onClick={() => zoomAt(1 / 1.25, undefined, undefined, true)}>
            <MinusIcon className="size-3.5" />
          </CtrlButton>
          <span className="w-11 text-center font-mono text-[11px] tabular-nums text-muted">{Math.round(vp.k * 100)}%</span>
          <CtrlButton label="Zoom in" onClick={() => zoomAt(1.25, undefined, undefined, true)}>
            <PlusIcon className="size-3.5" />
          </CtrlButton>
          <CtrlButton label="Fit to view" onClick={() => fit()}>
            <MaximizeIcon className="size-3.5" />
          </CtrlButton>
        </div>
      )}

      {/* minimap */}
      {minimap && (
        <div data-controls className="absolute bottom-3 right-3 overflow-hidden rounded-xl border border-border bg-surface-raised/90 shadow-overlay backdrop-blur">
          <svg
            ref={miniRef}
            width={MW}
            height={MH}
            aria-label="Minimap"
            role="img"
            className="block cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation();
              drag.current = { kind: "mini" };
              setSmooth(false);
              miniMove(e.clientX, e.clientY);
              root.current?.setPointerCapture(e.pointerId);
            }}
          >
            <g transform={`translate(${world.ox} ${world.oy}) scale(${world.s}) translate(${-world.x0} ${-world.y0})`}>
              {nodes.map((n) => (
                <rect
                  key={n.id}
                  x={n.x}
                  y={n.y}
                  width={n.width ?? W}
                  height={heights[n.id] ?? 120}
                  rx={10}
                  fill={selected === n.id || n.status === "running" ? "var(--kn-accent)" : "var(--kn-border-strong)"}
                />
              ))}
              <rect x={world.view.x} y={world.view.y} width={world.view.w} height={world.view.h} fill="var(--kn-accent)" fillOpacity={0.06} stroke="var(--kn-accent)" strokeWidth={2 / world.s} rx={6 / world.s} />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}

function Port({ side, node, port, connected }: { side: "in" | "out"; node: string; port: NodePort; connected: boolean }) {
  return (
    <span
      data-port={side}
      data-port-node={node}
      data-port-id={port.id}
      aria-label={`${side === "in" ? "Input" : "Output"} ${port.label ?? port.id}`}
      className={cn("group absolute top-1/2 grid size-5 -translate-y-1/2 cursor-crosshair place-items-center", side === "in" ? "-left-2.5" : "-right-2.5")}
    >
      <span
        className={cn("size-2.5 rounded-full border-2 transition-transform group-hover:scale-150", connected ? "border-transparent" : "bg-surface-raised")}
        style={{ borderColor: connected ? undefined : (port.color ?? "var(--kn-border-strong)"), background: connected ? (port.color ?? "var(--kn-accent)") : undefined }}
      />
    </span>
  );
}

function CtrlButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-overlay hover:text-foreground">
      {children}
    </button>
  );
}
