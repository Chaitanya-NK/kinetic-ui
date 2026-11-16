"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

type PanelConfig = { defaultSize?: number; minSize: number; maxSize: number; collapsible: boolean; collapsedSize: number };

type Ctx = {
  direction: "horizontal" | "vertical";
  sizes: number[];
  dragging: number | null;
  startDrag: (handle: number, e: React.PointerEvent) => void;
  nudge: (handle: number, delta: number) => void;
  toggle: (handle: number) => void;
  reset: () => void;
  configs: PanelConfig[];
};
const GroupCtx = React.createContext<Ctx | null>(null);
const IndexCtx = React.createContext<number>(0);

export type ResizablePanelGroupProps = {
  direction?: "horizontal" | "vertical";
  /** Remember sizes between visits under this key (localStorage). */
  autoSaveId?: string;
  onLayout?: (sizes: number[]) => void;
  className?: string;
  children: React.ReactNode;
};

export type ResizablePanelProps = {
  /** Percent of the group. Panels without a default share the rest equally. */
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  /** Snap shut when dragged below half the minimum, like a sidebar. */
  collapsible?: boolean;
  collapsedSize?: number;
  className?: string;
  children?: React.ReactNode;
};

const isPanel = (el: React.ReactNode): el is React.ReactElement<ResizablePanelProps> => React.isValidElement(el) && el.type === ResizablePanel;
const isHandle = (el: React.ReactNode) => React.isValidElement(el) && el.type === ResizableHandle;

/** Panels separated by draggable handles. Drag, use arrow keys on a handle, double-click to reset, Enter to collapse. */
export function ResizablePanelGroup({ direction = "horizontal", autoSaveId, onLayout, className, children }: ResizablePanelGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const kids = React.Children.toArray(children);
  const configs: PanelConfig[] = kids.filter(isPanel).map((p) => ({
    defaultSize: p.props.defaultSize,
    minSize: p.props.minSize ?? 10,
    maxSize: p.props.maxSize ?? 90,
    collapsible: p.props.collapsible ?? false,
    collapsedSize: p.props.collapsedSize ?? 0,
  }));
  const defaults = React.useMemo(() => {
    const fixed = configs.reduce((a, c) => a + (c.defaultSize ?? 0), 0);
    const free = configs.filter((c) => c.defaultSize == null).length;
    return configs.map((c) => c.defaultSize ?? (100 - fixed) / Math.max(free, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configs.length]);
  const [sizes, setSizes] = React.useState<number[]>(defaults);
  const [dragging, setDragging] = React.useState<number | null>(null);
  const beforeCollapse = React.useRef<Record<number, number>>({});

  React.useEffect(() => {
    if (!autoSaveId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(`kn-panels:${autoSaveId}`) ?? "null") as number[] | null;
      if (saved?.length === defaults.length) setSizes(saved);
    } catch {
      /* storage unavailable */
    }
  }, [autoSaveId, defaults.length]);

  const commit = React.useCallback(
    (next: number[]) => {
      setSizes(next);
      onLayout?.(next);
      if (autoSaveId) {
        try {
          localStorage.setItem(`kn-panels:${autoSaveId}`, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    },
    [autoSaveId, onLayout],
  );

  // Resize the pair of panels on either side of handle `h` so their total stays the same.
  const resizePair = (base: number[], h: number, delta: number) => {
    const a = h, b = h + 1;
    const ca = configs[a]!, cb = configs[b]!;
    const total = base[a]! + base[b]!;
    let na = base[a]! + delta;
    const minA = ca.collapsible ? ca.collapsedSize : ca.minSize;
    const minB = cb.collapsible ? cb.collapsedSize : cb.minSize;
    na = Math.max(minA, Math.min(na, ca.maxSize, total - minB));
    let nb = total - na;
    // Snap collapsible panels shut, or back to their minimum.
    if (ca.collapsible && na < ca.minSize) na = na < ca.minSize / 2 ? ca.collapsedSize : ca.minSize;
    if (cb.collapsible && nb < cb.minSize) nb = nb < cb.minSize / 2 ? cb.collapsedSize : cb.minSize;
    if (nb > cb.maxSize) nb = cb.maxSize;
    const next = [...base];
    next[a] = na;
    next[b] = total - na === nb ? nb : total - na;
    return next;
  };

  const startDrag = (h: number, e: React.PointerEvent) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const span = direction === "horizontal" ? rect.width : rect.height;
    const start = direction === "horizontal" ? e.clientX : e.clientY;
    const base = sizes;
    setDragging(h);
    const move = (ev: PointerEvent) => {
      const pos = direction === "horizontal" ? ev.clientX : ev.clientY;
      setSizes(resizePair(base, h, ((pos - start) / span) * 100));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(null);
      setSizes((s) => {
        commit(s);
        return s;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const ctx: Ctx = {
    direction,
    sizes,
    dragging,
    configs,
    startDrag,
    nudge: (h, d) => commit(resizePair(sizes, h, d)),
    toggle: (h) => {
      const c = configs[h]!;
      if (!c.collapsible) return;
      if (sizes[h]! <= c.collapsedSize + 0.5) commit(resizePair(sizes, h, (beforeCollapse.current[h] ?? c.minSize) - sizes[h]!));
      else {
        beforeCollapse.current[h] = sizes[h]!;
        commit(resizePair(sizes, h, c.collapsedSize - sizes[h]!));
      }
    },
    reset: () => commit(defaults),
  };

  let p = 0;
  let hIdx = 0;
  return (
    <GroupCtx.Provider value={ctx}>
      <div ref={ref} data-direction={direction} className={cn("flex size-full overflow-hidden", direction === "vertical" && "flex-col", dragging !== null && "select-none", className)}>
        {kids.map((child, i) => {
          if (isPanel(child)) return <IndexCtx.Provider key={i} value={p++}>{child}</IndexCtx.Provider>;
          if (isHandle(child)) return <IndexCtx.Provider key={i} value={hIdx++}>{child}</IndexCtx.Provider>;
          return child;
        })}
      </div>
    </GroupCtx.Provider>
  );
}

export function ResizablePanel({ className, children }: ResizablePanelProps) {
  const ctx = React.useContext(GroupCtx)!;
  const i = React.useContext(IndexCtx);
  const size = ctx.sizes[i] ?? 0;
  const collapsed = ctx.configs[i]?.collapsible && size <= (ctx.configs[i]?.collapsedSize ?? 0) + 0.5;
  return (
    <div
      data-collapsed={collapsed || undefined}
      style={{ flexBasis: `${size}%`, flexGrow: 0, flexShrink: 0, transition: ctx.dragging === null ? "flex-basis 0.32s cubic-bezier(0.22,1,0.36,1)" : "none" }}
      className={cn("min-h-0 min-w-0 overflow-hidden", className)}
    >
      {children}
    </div>
  );
}

export type ResizableHandleProps = { withGrip?: boolean; className?: string; label?: string };

export function ResizableHandle({ withGrip = true, className, label = "Resize" }: ResizableHandleProps) {
  const ctx = React.useContext(GroupCtx)!;
  const h = React.useContext(IndexCtx);
  const horizontal = ctx.direction === "horizontal";
  const active = ctx.dragging === h;
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(ctx.sizes[h] ?? 0)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-active={active || undefined}
      onPointerDown={(e) => ctx.startDrag(h, e)}
      onDoubleClick={ctx.reset}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 2;
        const back = horizontal ? "ArrowLeft" : "ArrowUp";
        const fwd = horizontal ? "ArrowRight" : "ArrowDown";
        if (e.key === back || e.key === fwd) {
          e.preventDefault();
          ctx.nudge(h, e.key === fwd ? step : -step);
        } else if (e.key === "Enter") {
          e.preventDefault();
          ctx.toggle(h);
        } else if (e.key === "Home" || e.key === "End") {
          e.preventDefault();
          ctx.nudge(h, e.key === "End" ? 100 : -100);
        }
      }}
      className={cn(
        "group relative flex shrink-0 items-center justify-center outline-none",
        horizontal ? "w-px cursor-col-resize bg-border" : "h-px cursor-row-resize bg-border",
        "after:absolute after:content-['']",
        horizontal ? "after:inset-y-0 after:-left-1.5 after:w-3" : "after:inset-x-0 after:-top-1.5 after:h-3",
        "transition-colors hover:bg-accent focus-visible:bg-accent data-[active]:bg-accent",
        className,
      )}
    >
      {withGrip ? (
        <span
          className={cn(
            "z-10 flex items-center justify-center rounded-full border border-border-strong bg-surface-raised shadow-sm transition-[transform,background-color,border-color] group-hover:border-accent group-data-[active]:scale-110 group-data-[active]:border-accent group-data-[active]:bg-accent",
            horizontal ? "h-8 w-3 flex-col gap-[3px]" : "h-3 w-8 gap-[3px]",
          )}
        >
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-[3px] rounded-full bg-muted group-data-[active]:bg-accent-foreground" />
          ))}
        </span>
      ) : null}
    </div>
  );
}
