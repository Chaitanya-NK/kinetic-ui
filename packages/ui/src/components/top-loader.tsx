"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

/* Global NProgress-style bar. Call topLoader.start() / .done() from anywhere (route changes, fetches). */

type State = { progress: number; visible: boolean };
let state: State = { progress: 0, visible: false };
const subs = new Set<(s: State) => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let pending = 0;
const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  subs.forEach((f) => f(state));
};

export const topLoader = {
  start() {
    pending++;
    if (state.visible) return;
    set({ visible: true, progress: 0.08 });
    clearInterval(timer);
    // Trickle: fast at first, slowing as it approaches 90%.
    timer = setInterval(() => set({ progress: Math.min(0.92, state.progress + (0.95 - state.progress) * 0.08) }), 220);
  },
  set(p: number) {
    set({ visible: true, progress: Math.max(0, Math.min(1, p)) });
  },
  done(force = false) {
    pending = force ? 0 : Math.max(0, pending - 1);
    if (pending > 0) return;
    clearInterval(timer);
    set({ progress: 1 });
    setTimeout(() => set({ visible: false, progress: 0 }), 350);
  },
  /** Wraps a promise: start, then done when it settles. */
  async track<T>(p: Promise<T>): Promise<T> {
    topLoader.start();
    try {
      return await p;
    } finally {
      topLoader.done();
    }
  },
};

export type TopLoaderProps = { color?: string; height?: number; /** Fixed to the top of the viewport. */ fixed?: boolean; className?: string };

/** Thin top-of-page progress bar with a glowing head. Mount once; drive it with `topLoader`. */
export function TopLoader({ color = "var(--kn-accent)", height = 3, fixed = true, className }: TopLoaderProps) {
  const [s, setS] = React.useState(state);
  React.useEffect(() => {
    subs.add(setS);
    return () => {
      subs.delete(setS);
    };
  }, []);
  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      aria-valuenow={Math.round(s.progress * 100)}
      aria-hidden={!s.visible}
      className={cn("pointer-events-none left-0 right-0 top-0 z-[100] transition-opacity duration-300", fixed ? "fixed" : "absolute", s.visible ? "opacity-100" : "opacity-0", className)}
      style={{ height }}
    >
      <div className="h-full origin-left transition-transform duration-200 ease-out" style={{ background: color, transform: `scaleX(${s.progress})` }}>
        <span className="absolute right-0 top-0 h-full w-24 opacity-80" style={{ boxShadow: `0 0 12px ${color}, 0 0 4px ${color}`, transform: "translateX(1px)" }} />
      </div>
    </div>
  );
}
