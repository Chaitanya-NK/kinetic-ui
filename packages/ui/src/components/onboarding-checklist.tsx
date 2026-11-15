"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, XIcon } from "@kineticui/icons";

export type ChecklistTask = { id: string; title: string; description?: string; done?: boolean; action?: { label: string; onClick: () => void }; time?: string };

export type OnboardingChecklistProps = {
  title?: string;
  tasks: ChecklistTask[];
  onToggle?: (id: string, done: boolean) => void;
  onDismiss?: () => void;
  /** Shown when every task is done. */
  reward?: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
};

/** "Get started" checklist: progress ring, expandable tasks with CTAs, collapse and a completion state. */
export function OnboardingChecklist({ title = "Get started", tasks, onToggle, onDismiss, reward, defaultCollapsed, className }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = React.useState(!!defaultCollapsed);
  const firstOpen = tasks.find((t) => !t.done)?.id ?? null;
  const [open, setOpen] = React.useState<string | null>(firstOpen);
  const done = tasks.filter((t) => t.done).length;
  const pct = done / Math.max(1, tasks.length);
  const complete = done === tasks.length;
  const r = 16;
  const c = 2 * Math.PI * r;

  React.useEffect(() => setOpen(firstOpen), [firstOpen]);

  return (
    <div className={cn("w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 p-4">
        <span className="relative flex size-10 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="20" cy="20" r={r} fill="none" stroke="var(--kn-border)" strokeWidth="4" />
            <motion.circle cx="20" cy="20" r={r} fill="none" stroke="var(--kn-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ type: "spring", stiffness: 80, damping: 18 }} />
          </svg>
          <span className="font-mono text-[10px] font-semibold">{Math.round(pct * 100)}%</span>
        </span>
        <div className="flex flex-1 flex-col">
          <span className="font-semibold">{complete ? "You're all set!" : title}</span>
          <span className="text-xs text-subtle">{done} of {tasks.length} done</span>
        </div>
        <button type="button" aria-label={collapsed ? "Expand" : "Collapse"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised">
          <ChevronDownIcon size={16} className={cn("transition-transform", collapsed && "-rotate-90")} />
        </button>
        {onDismiss ? (
          <button type="button" aria-label="Dismiss" onClick={onDismiss} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised">
            <XIcon size={15} />
          </button>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            {complete && reward ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-3 mb-3 rounded-xl bg-accent-soft p-4 text-sm">{reward}</motion.div>
            ) : null}
            <ul className="flex flex-col border-t border-border p-2">
              {tasks.map((t) => {
                const isOpen = open === t.id;
                return (
                  <li key={t.id} className={cn("rounded-xl transition-colors", isOpen && "bg-surface-raised")}>
                    <div className="flex items-center gap-3 p-2.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={!!t.done}
                        aria-label={t.title}
                        onClick={() => onToggle?.(t.id, !t.done)}
                        className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors", t.done ? "border-accent bg-accent text-accent-foreground" : "border-border-strong hover:border-accent")}
                      >
                        <AnimatePresence>{t.done ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><CheckIcon size={13} strokeWidth={3} /></motion.span> : null}</AnimatePresence>
                      </button>
                      <button type="button" onClick={() => setOpen(isOpen ? null : t.id)} className="flex flex-1 items-center gap-2 text-left">
                        <span className={cn("flex-1 text-sm font-medium", t.done && "text-subtle line-through")}>{t.title}</span>
                        {t.time && !t.done ? <span className="font-mono text-[10px] text-subtle">{t.time}</span> : null}
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && !t.done && (t.description || t.action) ? (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="flex flex-col gap-3 px-2.5 pb-3 pl-11">
                            {t.description ? <p className="text-sm text-muted">{t.description}</p> : null}
                            {t.action ? (
                              <button type="button" onClick={t.action.onClick} className="flex h-8 w-fit items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-foreground">
                                {t.action.label} <ArrowRightIcon size={13} />
                              </button>
                            ) : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
