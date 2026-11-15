"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@kineticui/core";

export type PullToRefreshProps = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  /** Pull distance in px that triggers a refresh. */
  threshold?: number;
  /** Height of the scroll area. */
  height?: number | string;
  className?: string;
};

/** Scroll area that refreshes when pulled down from the top, with a spinner that fills as you pull. */
export function PullToRefresh({ onRefresh, children, threshold = 72, height = 420, className }: PullToRefreshProps) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const start = React.useRef<number | null>(null);
  const progress = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold * 1.5], [0, 270]);
  const opacity = useTransform(y, [0, 20], [0, 1]);

  const release = async () => {
    start.current = null;
    if (y.get() >= threshold && !refreshing) {
      setRefreshing(true);
      void animate(y, threshold * 0.8, { type: "spring", stiffness: 400, damping: 35 });
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        void animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
      }
    } else void animate(y, 0, { type: "spring", stiffness: 400, damping: 35 });
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-surface", className)} style={{ height }}>
      <motion.div style={{ opacity, y: useTransform(y, (v) => v / 2 - 20) }} className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <span className="flex size-9 items-center justify-center rounded-full border border-border-strong bg-surface-overlay shadow-overlay">
          {refreshing ? (
            <span className="size-4 rounded-full border-2 border-accent border-t-transparent animate-kn-spin" />
          ) : (
            <motion.svg viewBox="0 0 24 24" className="size-4" style={{ rotate }} aria-hidden>
              <circle cx="12" cy="12" r="8" fill="none" stroke="var(--kn-border-strong)" strokeWidth="2.4" />
              <motion.circle cx="12" cy="12" r="8" fill="none" stroke="var(--kn-accent)" strokeWidth="2.4" strokeLinecap="round" style={{ pathLength: progress }} />
            </motion.svg>
          )}
        </span>
      </motion.div>
      <motion.div
        ref={scroller}
        style={{ y }}
        aria-busy={refreshing}
        className="h-full touch-pan-x select-none overflow-y-auto overscroll-contain"
        onPointerDown={(e) => {
          if ((scroller.current?.scrollTop ?? 0) <= 0 && !refreshing) {
            start.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          if (start.current === null) return;
          const d = e.clientY - start.current;
          if (d <= 0) return y.set(0);
          y.set(Math.min(threshold * 1.8, d * 0.55));
        }}
        onPointerUp={() => void release()}
        onPointerCancel={() => void release()}
      >
        {children}
      </motion.div>
      <span className="sr-only" aria-live="polite">
        {refreshing ? "Refreshing" : ""}
      </span>
    </div>
  );
}
