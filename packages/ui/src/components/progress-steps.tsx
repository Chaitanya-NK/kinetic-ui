"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon } from "@kineticui/icons";

export type ProgressStep = {
  id: string;
  title: string;
  description?: string;
  /** Sub-tasks; the step completes when all are done. */
  tasks?: { id: string; label: string; done?: boolean }[];
  done?: boolean;
  /** Free content shown when expanded. */
  content?: React.ReactNode;
};

export type ProgressStepsProps = {
  steps: ProgressStep[];
  onToggleTask?: (stepId: string, taskId: string, done: boolean) => void;
  className?: string;
};

/** Vertical milestone list with nested sub-tasks, per-step progress and the current step auto-expanded. */
export function ProgressSteps({ steps, onToggleTask, className }: ProgressStepsProps) {
  const status = (s: ProgressStep) => {
    const total = s.tasks?.length ?? 0;
    const done = s.tasks?.filter((t) => t.done).length ?? 0;
    const complete = s.done ?? (total > 0 && done === total);
    return { total, done, complete };
  };
  const currentIndex = steps.findIndex((s) => !status(s).complete);
  const [open, setOpen] = React.useState<string | null>(steps[currentIndex]?.id ?? null);

  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((s, i) => {
        const st = status(s);
        const current = i === currentIndex;
        const isOpen = open === s.id;
        return (
          <li key={s.id} className="relative flex gap-4 pb-2">
            {i < steps.length - 1 ? <span className={cn("absolute left-[15px] top-9 bottom-0 w-0.5 rounded-full", st.complete ? "bg-accent" : "bg-border")} aria-hidden /> : null}
            <span
              className={cn(
                "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-colors",
                st.complete ? "border-accent bg-accent text-accent-foreground" : current ? "border-accent text-accent" : "border-border-strong text-subtle",
              )}
            >
              {st.complete ? <CheckIcon size={14} strokeWidth={3} /> : i + 1}
              {current ? <span className="absolute inset-0 rounded-full border-2 border-accent animate-ping opacity-40" /> : null}
            </span>
            <div className="flex min-w-0 flex-1 flex-col pb-5">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} className="flex items-center gap-3 pt-1 text-left">
                <span className="flex flex-1 flex-col">
                  <span className={cn("font-medium", st.complete && "text-muted")}>{s.title}</span>
                  {s.description ? <span className="text-sm text-subtle">{s.description}</span> : null}
                </span>
                {st.total ? (
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-raised">
                      <motion.span className="block h-full rounded-full bg-accent" animate={{ width: `${(st.done / st.total) * 100}%` }} />
                    </span>
                    <span className="font-mono text-[11px] text-subtle">{st.done}/{st.total}</span>
                  </span>
                ) : null}
                {s.tasks || s.content ? <ChevronDownIcon size={15} className={cn("text-subtle transition-transform", isOpen && "rotate-180")} /> : null}
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (s.tasks || s.content) ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 flex flex-col gap-1 rounded-xl border border-border bg-surface p-2">
                      {s.tasks?.map((t) => (
                        <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-raised">
                          <input type="checkbox" checked={!!t.done} onChange={(e) => onToggleTask?.(s.id, t.id, e.target.checked)} className="size-4 accent-[var(--kn-accent)]" />
                          <span className={cn(t.done && "text-subtle line-through")}>{t.label}</span>
                        </label>
                      ))}
                      {s.content ? <div className="p-2 text-sm text-muted">{s.content}</div> : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
