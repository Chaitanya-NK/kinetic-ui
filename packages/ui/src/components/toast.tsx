"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "@kineticui/icons";

type Tone = "default" | "success" | "error" | "info";

export type ToastOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Tone;
  /** Milliseconds before auto-dismiss. 0 keeps it open. */
  duration?: number;
  action?: { label: string; onClick: () => void };
};

type ToastItem = ToastOptions & { id: number };

let items: ToastItem[] = [];
const listeners = new Set<(t: ToastItem[]) => void>();
const emit = () => listeners.forEach((l) => l(items));

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

/** Show a toast from anywhere: toast({ title: "Saved" }). Requires <Toaster /> once in your layout. */
export function toast(options: ToastOptions | string) {
  const opts = typeof options === "string" ? { title: options } : options;
  const id = Date.now() + Math.random();
  items = [...items, { id, tone: "default", duration: 4000, ...opts }];
  emit();
  if (opts.duration !== 0) setTimeout(() => dismissToast(id), opts.duration ?? 4000);
  return id;
}

const toneIcon = { default: null, success: CheckIcon, error: AlertIcon, info: InfoIcon };
const toneClass = {
  default: "",
  success: "bg-accent text-accent-foreground",
  error: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export type ToasterProps = {
  position?: "bottom-right" | "bottom-center" | "top-right" | "top-center";
  /** How many toasts are visible before they stack. */
  visible?: number;
};

/** Renders stacked toasts. Hover to expand the stack. */
export function Toaster({ position = "bottom-right", visible = 3 }: ToasterProps) {
  const [list, setList] = React.useState<ToastItem[]>(items);
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  const top = position.startsWith("top");
  const shown = list.slice(-visible);

  return (
    <section
      aria-label="Notifications"
      aria-live="polite"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "pointer-events-none fixed z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-center" && "bottom-4 left-1/2 -translate-x-1/2",
        position === "top-right" && "right-4 top-4",
        position === "top-center" && "left-1/2 top-4 -translate-x-1/2",
      )}
    >
      <div className="relative">
        <AnimatePresence initial={false}>
          {shown.map((t, i) => {
            const fromFront = shown.length - 1 - i;
            const Icon = toneIcon[t.tone ?? "default"];
            const offset = expanded ? fromFront * 76 : fromFront * 10;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: top ? -20 : 20, scale: 0.95 }}
                animate={{
                  opacity: fromFront > 2 ? 0 : 1,
                  y: top ? offset : -offset,
                  scale: expanded ? 1 : 1 - fromFront * 0.05,
                }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 80) dismissToast(t.id);
                }}
                style={{ zIndex: i }}
                className={cn(
                  "pointer-events-auto absolute inset-x-0 flex items-start gap-3 rounded-2xl border border-border-strong bg-surface-overlay p-4 shadow-overlay",
                  top ? "top-0" : "bottom-0",
                )}
              >
                {Icon ? (
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", toneClass[t.tone ?? "default"])}>
                    <Icon size={14} strokeWidth={2.5} />
                  </span>
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold">{t.title}</span>
                  {t.description ? <span className="text-sm text-muted">{t.description}</span> : null}
                </div>
                {t.action ? (
                  <button
                    type="button"
                    onClick={() => {
                      t.action!.onClick();
                      dismissToast(t.id);
                    }}
                    className="h-8 shrink-0 rounded-lg border border-border-strong px-2.5 text-xs font-medium hover:bg-surface-raised"
                  >
                    {t.action.label}
                  </button>
                ) : (
                  <button type="button" aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-subtle hover:text-foreground">
                    <XIcon size={14} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
