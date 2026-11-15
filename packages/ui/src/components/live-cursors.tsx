"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type LiveCursor = {
  id: string;
  name: string;
  color: string;
  /** Position in px relative to the container (or 0–1 when `relative`). */
  x: number;
  y: number;
  /** Optional chat bubble next to the cursor. */
  message?: string;
};

export type LiveCursorsProps = {
  cursors: LiveCursor[];
  /** Treat x/y as fractions of the container size. */
  relative?: boolean;
  /** Report the local pointer so you can broadcast it (fractions when `relative`). */
  onMove?: (pos: { x: number; y: number } | null) => void;
  children?: React.ReactNode;
  className?: string;
};

export function CursorArrow({ color, name, message }: { color: string; name: string; message?: string }) {
  return (
    <div className="pointer-events-none flex flex-col items-start">
      <svg width="18" height="20" viewBox="0 0 18 20" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" aria-hidden>
        <path d="M1 1l15.5 7.2-6.6 1.9-3.1 6.4z" fill={color} stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span className="-mt-1 ml-3.5 flex max-w-52 flex-col rounded-lg rounded-tl-sm px-2 py-1 text-[11px] font-semibold text-[#0b0c0e] shadow-md" style={{ background: color }}>
        {name}
        {message ? <span className="font-normal">{message}</span> : null}
      </span>
    </div>
  );
}

/** Multiplayer cursor layer: smooth spring-following pointers with name tags. */
export function LiveCursors({ cursors, relative, onMove, children, className }: LiveCursorsProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 1, h: 1 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !relative) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [relative]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(e) => {
        if (!onMove) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        onMove(relative ? { x: x / r.width, y: y / r.height } : { x, y });
      }}
      onPointerLeave={() => onMove?.(null)}
    >
      {children}
      <AnimatePresence>
        {cursors.map((c) => (
          <motion.div
            key={c.id}
            className="pointer-events-none absolute left-0 top-0 z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, x: relative ? c.x * size.w : c.x, y: relative ? c.y * size.h : c.y }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.6, opacity: { duration: 0.15 } }}
          >
            <CursorArrow color={c.color} name={c.name} message={c.message} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
