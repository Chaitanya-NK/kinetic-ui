"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon, XIcon } from "@kineticui/icons";

export type ToolCallProps = {
  /** Tool name, e.g. "search_web". */
  name: string;
  /** Human label, e.g. "Searched the web". */
  title?: React.ReactNode;
  status: "pending" | "running" | "success" | "error";
  icon?: React.ReactNode;
  input?: unknown;
  output?: React.ReactNode;
  /** Shown on the right, e.g. "1.2s" or "4 results". */
  meta?: React.ReactNode;
  /** Approve / deny for tools that need permission (status "pending"). */
  onApprove?: () => void;
  onDeny?: () => void;
  defaultOpen?: boolean;
  className?: string;
};

const statusIcon = {
  pending: <span className="size-2 rounded-full bg-warning" />,
  running: <span className="size-3.5 rounded-full border-2 border-accent border-t-transparent animate-kn-spin" />,
  success: <CheckIcon size={13} strokeWidth={2.6} className="text-success" />,
  error: <XIcon size={13} strokeWidth={2.6} className="text-danger" />,
};

/** Agent tool invocation card with arguments, result and approval controls. */
export function ToolCall({ name, title, status, icon, input, output, meta, onApprove, onDeny, defaultOpen = false, className }: ToolCallProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const expandable = input !== undefined || output !== undefined;
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface text-sm", status === "error" && "border-danger/40", className)}>
      <button type="button" disabled={!expandable} aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-raised text-muted [&_svg]:size-3.5">{icon ?? <span className="font-mono text-[10px]">fn</span>}</span>
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="truncate font-medium text-foreground">{title ?? name}</span>
          {title ? <span className="truncate font-mono text-[11px] text-subtle">{name}</span> : null}
        </span>
        {meta ? <span className="shrink-0 font-mono text-[11px] text-subtle">{meta}</span> : null}
        <span className="flex size-5 items-center justify-center">{statusIcon[status]}</span>
        {expandable ? <ChevronDownIcon size={14} className={cn("text-subtle transition-transform", open && "rotate-180")} /> : null}
      </button>
      {status === "pending" && (onApprove || onDeny) ? (
        <div className="flex items-center gap-2 border-t border-border bg-warning-soft/40 px-3 py-2">
          <span className="flex-1 text-xs text-muted">This tool needs your permission to run.</span>
          {onDeny ? (
            <button type="button" onClick={onDeny} className="h-7 rounded-lg border border-border-strong px-2.5 text-xs font-medium hover:bg-surface-overlay">
              Deny
            </button>
          ) : null}
          {onApprove ? (
            <button type="button" onClick={onApprove} className="h-7 rounded-lg bg-accent px-2.5 text-xs font-semibold text-accent-foreground">
              Allow
            </button>
          ) : null}
        </div>
      ) : null}
      <AnimatePresence initial={false}>
        {open && expandable ? (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 border-t border-border p-3">
              {input !== undefined ? (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">Input</div>
                  <pre className="overflow-x-auto rounded-lg bg-background p-2.5 font-mono text-[12px] leading-relaxed text-muted">{typeof input === "string" ? input : JSON.stringify(input, null, 2)}</pre>
                </div>
              ) : null}
              {output !== undefined ? (
                <div>
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">Output</div>
                  <div className="rounded-lg bg-background p-2.5 text-[13px] text-muted">{output}</div>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
