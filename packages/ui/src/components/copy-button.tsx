"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, CopyIcon } from "@kineticui/icons";

export type CopyButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string;
  /** Shows the text next to the icon. */
  label?: string;
  copiedLabel?: string;
  onCopied?: () => void;
};

/** Copies text to the clipboard with an animated check confirmation. */
export function CopyButton({ value, label, copiedLabel = "Copied", onCopied, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={label ? undefined : copied ? copiedLabel : "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          onCopied?.();
        } catch {
          /* clipboard blocked */
        }
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-2 text-xs font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground",
        copied && "border-success/40 text-success hover:text-success",
        className,
      )}
      {...props}
    >
      <span className="relative size-3.5">
        <AnimatePresence initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            {copied ? <CheckIcon size={14} strokeWidth={2.5} /> : <CopyIcon size={14} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {label ? <span aria-live="polite">{copied ? copiedLabel : label}</span> : null}
    </button>
  );
}
