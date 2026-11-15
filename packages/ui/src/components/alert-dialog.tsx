"use client";

import * as React from "react";
import { AlertDialog as AlertPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { AlertIcon, TrashIcon } from "@kineticui/icons";

export type ConfirmDialogProps = {
  /** The button that opens the dialog. */
  trigger: React.ReactElement;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** destructive: red styling and a trash icon. */
  tone?: "default" | "warning" | "destructive";
  /** If set, the user must type this text before confirming. */
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const toneStyles = {
  default: { icon: null, iconBg: "", button: "bg-accent text-accent-foreground" },
  warning: { icon: AlertIcon, iconBg: "bg-warning-soft text-warning", button: "bg-warning text-background" },
  destructive: { icon: TrashIcon, iconBg: "bg-danger-soft text-danger", button: "bg-danger text-background" },
};

/** Confirmation that can't be dismissed by clicking outside. Optional type-to-confirm. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  confirmText,
  onConfirm,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const t = toneStyles[tone];
  const Icon = t.icon;
  const locked = !!confirmText && typed !== confirmText;

  return (
    <AlertPrimitive.Root open={open} onOpenChange={(o) => { if (!o) setTyped(""); onOpenChange?.(o); }}>
      <AlertPrimitive.Trigger asChild>{trigger}</AlertPrimitive.Trigger>
      <AlertPrimitive.Portal>
        <AlertPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.2s_ease-out]" />
        <AlertPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[20px] border border-border-strong bg-surface-raised p-6 shadow-overlay data-[state=open]:animate-[kn-dialog-in_0.25s_var(--ease-kn-spring)] focus:outline-none">
          <div className="flex gap-4">
            {Icon ? (
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", t.iconBg)}>
                <Icon size={18} />
              </span>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <AlertPrimitive.Title className="text-lg font-semibold tracking-tight">{title}</AlertPrimitive.Title>
              {description ? <AlertPrimitive.Description className="text-sm leading-relaxed text-muted">{description}</AlertPrimitive.Description> : null}
            </div>
          </div>
          {confirmText ? (
            <label className="flex flex-col gap-1.5 text-xs text-muted">
              <span>
                Type <code className="font-mono text-foreground">{confirmText}</code> to confirm
              </span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                className="h-10 rounded-[10px] border border-border bg-background px-3 font-mono text-sm text-foreground outline-none focus:border-accent"
              />
            </label>
          ) : null}
          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertPrimitive.Cancel className="h-10 rounded-[10px] border border-border-strong px-4 text-sm font-medium hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
              {cancelLabel}
            </AlertPrimitive.Cancel>
            <AlertPrimitive.Action
              disabled={locked || busy}
              onClick={async (e) => {
                const r = onConfirm();
                if (r instanceof Promise) {
                  e.preventDefault();
                  setBusy(true);
                  await r.finally(() => setBusy(false));
                  onOpenChange?.(false);
                }
              }}
              className={cn("h-10 rounded-[10px] px-4 text-sm font-semibold transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground", t.button)}
            >
              {busy ? "Working…" : confirmLabel}
            </AlertPrimitive.Action>
          </div>
        </AlertPrimitive.Content>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  );
}
