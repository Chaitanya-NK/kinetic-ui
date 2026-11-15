"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { XIcon } from "@kineticui/icons";

export type BulkAction = { id: string; label: string; icon?: React.ReactNode; shortcut?: string; destructive?: boolean; onClick: () => void };

export type BulkActionBarProps = {
  /** Number of selected items. The bar shows when > 0. */
  count: number;
  total?: number;
  actions: BulkAction[];
  onClear: () => void;
  onSelectAll?: () => void;
  noun?: [string, string];
  fixed?: boolean;
  className?: string;
};

/** Floating bar that slides up while items are selected: count with rolling digits, select-all, actions with shortcuts, Esc to clear. */
export function BulkActionBar({ count, total, actions, onClear, onSelectAll, noun = ["item", "items"], fixed = true, className }: BulkActionBarProps) {
  React.useEffect(() => {
    if (!count) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "Escape") onClear();
      const a = actions.find((x) => x.shortcut && x.shortcut.toLowerCase() === e.key.toLowerCase() && !e.metaKey && !e.ctrlKey);
      if (a) {
        e.preventDefault();
        a.onClick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, actions, onClear]);

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          role="toolbar"
          aria-label="Bulk actions"
          initial={{ y: 80, opacity: 0, x: fixed ? "-50%" : 0 }}
          animate={{ y: 0, opacity: 1, x: fixed ? "-50%" : 0 }}
          exit={{ y: 80, opacity: 0, x: fixed ? "-50%" : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className={cn("flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 rounded-2xl border border-border-strong bg-surface-overlay/95 p-1.5 pl-2 shadow-overlay backdrop-blur-xl", fixed && "fixed bottom-6 left-1/2 z-40", className)}
        >
          <span className="flex items-center gap-2 pl-1 pr-2 text-sm">
            <span className="relative flex h-6 min-w-6 items-center justify-center overflow-hidden rounded-md bg-accent px-1.5 font-mono text-xs font-bold text-accent-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={count} initial={{ y: -14 }} animate={{ y: 0 }} exit={{ y: 14 }}>{count}</motion.span>
              </AnimatePresence>
            </span>
            <span className="whitespace-nowrap">{count === 1 ? noun[0] : noun[1]} selected</span>
          </span>
          {onSelectAll && total && count < total ? (
            <button type="button" onClick={onSelectAll} className="h-9 whitespace-nowrap rounded-lg px-2.5 text-sm text-accent hover:bg-surface-raised">
              Select all {total}
            </button>
          ) : null}
          <span className="mx-1 h-6 w-px bg-border" />
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {actions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={a.onClick}
                title={a.shortcut ? `${a.label} (${a.shortcut.toUpperCase()})` : a.label}
                className={cn("flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors [&_svg]:size-4", a.destructive ? "text-danger hover:bg-danger-soft" : "text-muted hover:bg-surface-raised hover:text-foreground")}
              >
                {a.icon}
                <span className="hidden sm:inline">{a.label}</span>
                {a.shortcut ? <kbd className="hidden rounded border border-border px-1 font-mono text-[10px] text-subtle md:inline">{a.shortcut.toUpperCase()}</kbd> : null}
              </button>
            ))}
          </div>
          <span className="mx-1 h-6 w-px bg-border" />
          <button type="button" aria-label="Clear selection (Esc)" onClick={onClear} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-foreground">
            <XIcon size={15} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
