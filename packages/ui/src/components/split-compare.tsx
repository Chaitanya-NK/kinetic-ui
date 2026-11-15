"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type SplitCompareProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  leftLabel?: React.ReactNode;
  rightLabel?: React.ReactNode;
  /** Keep both panes scrolled to the same position. */
  syncScroll?: boolean;
  /** Initial split, 0–100. */
  defaultSplit?: number;
  height?: number;
  className?: string;
};

/** Two resizable panes side by side (drag or arrow-key the divider) with optional synced scrolling. */
export function SplitCompare({ left, right, leftLabel, rightLabel, syncScroll = true, defaultSplit = 50, height = 380, className }: SplitCompareProps) {
  const [split, setSplit] = React.useState(defaultSplit);
  const wrap = React.useRef<HTMLDivElement>(null);
  const a = React.useRef<HTMLDivElement>(null);
  const b = React.useRef<HTMLDivElement>(null);
  const lock = React.useRef(false);

  const mirror = (from: HTMLDivElement | null, to: HTMLDivElement | null) => {
    if (!syncScroll || !from || !to || lock.current) return;
    lock.current = true;
    const ratio = from.scrollTop / Math.max(1, from.scrollHeight - from.clientHeight);
    to.scrollTop = ratio * (to.scrollHeight - to.clientHeight);
    requestAnimationFrame(() => (lock.current = false));
  };

  const pane = (ref: React.RefObject<HTMLDivElement | null>, other: React.RefObject<HTMLDivElement | null>, label: React.ReactNode, content: React.ReactNode) => (
    <div className="flex min-w-0 flex-col">
      {label ? <div className="border-b border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-subtle">{label}</div> : null}
      <div ref={ref} onScroll={() => mirror(ref.current, other.current)} className="flex-1 overflow-auto p-4">
        {content}
      </div>
    </div>
  );

  return (
    <div ref={wrap} className={cn("relative grid overflow-hidden rounded-2xl border border-border bg-surface", className)} style={{ height, gridTemplateColumns: `${split}% 0px 1fr` }}>
      {pane(a, b, leftLabel, left)}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(split)}
        aria-valuemin={15}
        aria-valuemax={85}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setSplit((s) => Math.max(15, s - 2));
          if (e.key === "ArrowRight") setSplit((s) => Math.min(85, s + 2));
        }}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const r = wrap.current!.getBoundingClientRect();
          setSplit(Math.max(15, Math.min(85, ((e.clientX - r.left) / r.width) * 100)));
        }}
        className="group relative z-[1] -mx-2 w-4 cursor-col-resize outline-none"
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-accent group-focus-visible:bg-accent" />
        <span className="absolute left-1/2 top-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-strong transition-colors group-hover:bg-accent" />
      </div>
      {pane(b, a, rightLabel, right)}
    </div>
  );
}
