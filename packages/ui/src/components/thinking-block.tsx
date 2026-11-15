"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronDownIcon } from "@kineticui/icons";

export type ThinkingBlockProps = {
  /** True while the model is still reasoning. */
  active?: boolean;
  /** Seconds spent; shown once finished. Counted live when omitted. */
  duration?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

/** Collapsible reasoning trace: shimmering "Thinking…" while active, "Thought for 8s" after. */
export function ThinkingBlock({ active, duration, children, defaultOpen = false, className }: ThinkingBlockProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 500);
    return () => window.clearInterval(t);
  }, [active]);
  const secs = duration ?? elapsed;

  return (
    <div className={cn("flex flex-col", className)}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
        <svg viewBox="0 0 24 24" className={cn("size-4", active && "animate-kn-pulse text-accent")} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0012 3z" />
        </svg>
        {active ? (
          <span className="bg-[linear-gradient(90deg,var(--kn-muted)_30%,var(--kn-foreground)_50%,var(--kn-muted)_70%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-kn-shine">Thinking…</span>
        ) : (
          <span>Thought for {secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`}</span>
        )}
        <ChevronDownIcon size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="mt-2.5 border-l-2 border-border pl-4 text-sm leading-relaxed text-subtle">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
