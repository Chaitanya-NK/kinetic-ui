"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type BeforeAfterProps = {
  before: React.ReactNode;
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting position, 0–100. */
  defaultPosition?: number;
  className?: string;
};

/** Drag (or arrow-key) slider that reveals one image over another. */
export function BeforeAfter({ before, after, beforeLabel = "Before", afterLabel = "After", defaultPosition = 50, className }: BeforeAfterProps) {
  const [pos, setPos] = React.useState(defaultPosition);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const fromEvent = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className={cn("relative select-none overflow-hidden rounded-2xl touch-pan-y [&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover", className)}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromEvent(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromEvent(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      <div className="size-full">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>
      <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur" style={{ opacity: pos > 12 ? 1 : 0 }}>
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur" style={{ opacity: pos < 88 ? 1 : 0 }}>
        {afterLabel}
      </span>
      <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]" style={{ left: `${pos}%` }}>
        <button
          type="button"
          role="slider"
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          }}
          className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-[#0b0c0e] shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-accent"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
