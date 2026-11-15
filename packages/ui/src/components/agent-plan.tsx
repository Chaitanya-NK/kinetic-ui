"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronRightIcon, XIcon } from "@kineticui/icons";

export type PlanStep = {
  id: string;
  title: string;
  status: "pending" | "running" | "done" | "error" | "skipped";
  detail?: React.ReactNode;
  substeps?: { title: string; done?: boolean }[];
};

export type AgentPlanProps = {
  title?: string;
  steps: PlanStep[];
  className?: string;
};

function Status({ s }: { s: PlanStep["status"] }) {
  if (s === "done")
    return (
      <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <CheckIcon size={12} strokeWidth={3} />
      </motion.span>
    );
  if (s === "running") return <span className="size-5 rounded-full border-2 border-accent border-t-transparent animate-kn-spin" />;
  if (s === "error")
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-danger text-background">
        <XIcon size={12} strokeWidth={3} />
      </span>
    );
  return <span className={cn("size-5 rounded-full border-2 border-dashed border-border-strong", s === "skipped" && "opacity-40")} />;
}

/** Live checklist of an agent's plan with progress, running step and expandable details. */
export function AgentPlan({ title = "Plan", steps, className }: AgentPlanProps) {
  const done = steps.filter((s) => s.status === "done").length;
  const [open, setOpen] = React.useState<string | null>(null);
  const running = steps.find((s) => s.status === "running");
  React.useEffect(() => {
    if (running) setOpen(running.id);
  }, [running?.id]);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="font-mono text-xs text-subtle">
          {done}/{steps.length}
        </span>
        <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-surface-raised">
          <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(done / Math.max(1, steps.length)) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>
      <ol className="border-t border-border">
        {steps.map((s, i) => {
          const expandable = !!(s.detail || s.substeps?.length);
          const isOpen = open === s.id && expandable;
          return (
            <li key={s.id} className={cn("relative border-b border-border/60 last:border-0", s.status === "running" && "bg-accent-soft/30")}>
              {i < steps.length - 1 ? <span className={cn("absolute left-[25px] top-9 bottom-0 w-px", s.status === "done" ? "bg-accent/50" : "bg-border")} aria-hidden /> : null}
              <button type="button" disabled={!expandable} aria-expanded={expandable ? isOpen : undefined} onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm">
                <Status s={s.status} />
                <span className={cn("flex-1", s.status === "done" && "text-muted", s.status === "skipped" && "text-subtle line-through", s.status === "running" && "font-medium text-foreground", s.status === "error" && "text-danger")}>
                  {s.title}
                </span>
                {expandable ? <ChevronRightIcon size={14} className={cn("text-subtle transition-transform", isOpen && "rotate-90")} /> : null}
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex flex-col gap-1.5 pb-3 pl-12 pr-4 text-xs text-muted">
                      {s.detail}
                      {s.substeps?.map((sub) => (
                        <span key={sub.title} className="flex items-center gap-2">
                          <span className={cn("size-1.5 rounded-full", sub.done ? "bg-accent" : "bg-border-strong")} />
                          <span className={sub.done ? "text-muted" : "text-subtle"}>{sub.title}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
