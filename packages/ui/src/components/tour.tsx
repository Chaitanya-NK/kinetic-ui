"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";

export type TourStep = {
  /** CSS selector of the element to highlight. */
  target: string;
  title: string;
  body: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
};

export type TourProps = {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish?: () => void;
};

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 6;

/** Product tour: spotlights an element and explains it, step by step. */
export function Tour({ steps, open, onOpenChange, onFinish }: TourProps) {
  const mounted = useMounted();
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const step = steps[index];

  React.useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open || !step) return;
    const el = document.querySelector(step.target);
    if (!el) return setRect(null);
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    measure();
    const t = window.setTimeout(measure, 350);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function next() {
    if (index < steps.length - 1) setIndex(index + 1);
    else {
      onOpenChange(false);
      onFinish?.();
    }
  }

  if (!mounted || !open || !step) return null;

  const placement = step.placement ?? "bottom";
  const pop: React.CSSProperties = rect
    ? placement === "bottom"
      ? { top: rect.top + rect.height + 12, left: rect.left }
      : placement === "top"
        ? { top: rect.top - 12, left: rect.left, transform: "translateY(-100%)" }
        : placement === "right"
          ? { top: rect.top, left: rect.left + rect.width + 12 }
          : { top: rect.top, left: rect.left - 12, transform: "translateX(-100%)" }
    : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={step.title}>
      <svg className="absolute inset-0 size-full" aria-hidden onClick={() => onOpenChange(false)}>
        <defs>
          <mask id="kn-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect ? <motion.rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} initial={false} animate={{ x: rect.left, y: rect.top, width: rect.width, height: rect.height }} transition={{ type: "spring", stiffness: 260, damping: 30 }} rx="12" fill="black" /> : null}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#kn-tour-mask)" />
      </svg>
      {rect ? (
        <motion.div
          className="pointer-events-none absolute rounded-xl ring-2 ring-accent"
          animate={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
        />
      ) : null}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={pop}
        className="absolute w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border-strong bg-surface-raised p-4 text-sm shadow-overlay"
      >
        <span className="font-mono text-[11px] text-accent">
          Step {index + 1} of {steps.length}
        </span>
        <h3 className="mt-1 text-[15px] font-semibold">{step.title}</h3>
        <div className="mt-1 leading-relaxed text-muted">{step.body}</div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-4 bg-accent" : "w-1.5 bg-border-strong")} />
            ))}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="ml-auto px-2 text-xs text-subtle hover:text-foreground">
            Skip
          </button>
          {index > 0 ? (
            <button type="button" onClick={() => setIndex(index - 1)} className="h-8 rounded-lg border border-border-strong px-3 text-xs font-medium hover:bg-surface-overlay">
              Back
            </button>
          ) : null}
          <button type="button" onClick={next} className="h-8 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground">
            {index === steps.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
