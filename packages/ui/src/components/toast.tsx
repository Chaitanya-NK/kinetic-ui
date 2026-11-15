"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "@kineticui/icons";

export type ToastTone = "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. 0 keeps it open. Loading toasts stay open by default. */
  duration?: number;
  action?: { label: string; onClick: () => void };
  /** Custom icon (replaces the tone icon). */
  icon?: React.ReactNode;
  /** Reuse an id to update an existing toast in place. */
  id?: number | string;
};

type ToastItem = Omit<ToastOptions, "id"> & { id: number | string; createdAt: number };

/* ------------------------------------------------------------------ store */

let items: ToastItem[] = [];
const listeners = new Set<(t: ToastItem[]) => void>();
const emit = () => listeners.forEach((l) => l(items));
const timers = new Map<number | string, { handle?: ReturnType<typeof setTimeout>; remaining: number; started: number }>();
let paused = false;

function schedule(id: number | string, ms: number) {
  const prev = timers.get(id);
  if (prev?.handle) clearTimeout(prev.handle);
  if (ms <= 0) {
    timers.delete(id);
    return;
  }
  const entry = { remaining: ms, started: Date.now(), handle: undefined as ReturnType<typeof setTimeout> | undefined };
  if (!paused) entry.handle = setTimeout(() => dismissToast(id), ms);
  timers.set(id, entry);
}

function pauseAll() {
  paused = true;
  timers.forEach((t) => {
    if (t.handle) clearTimeout(t.handle);
    t.handle = undefined;
    t.remaining -= Date.now() - t.started;
  });
}
function resumeAll() {
  paused = false;
  timers.forEach((t, id) => {
    t.started = Date.now();
    t.handle = setTimeout(() => dismissToast(id), Math.max(0, t.remaining));
  });
}

export function dismissToast(id?: number | string) {
  if (id === undefined) {
    timers.forEach((t) => t.handle && clearTimeout(t.handle));
    timers.clear();
    items = [];
  } else {
    const t = timers.get(id);
    if (t?.handle) clearTimeout(t.handle);
    timers.delete(id);
    items = items.filter((x) => x.id !== id);
  }
  emit();
}

const defaultDuration = (tone?: ToastTone) => (tone === "loading" ? 0 : tone === "error" ? 6000 : 4000);

function show(options: ToastOptions | string): number | string {
  const opts = typeof options === "string" ? { title: options } : options;
  const id = opts.id ?? Date.now() + Math.random();
  const duration = opts.duration ?? defaultDuration(opts.tone);
  const existing = items.find((x) => x.id === id);
  const next: ToastItem = { tone: "default", ...opts, id, duration, createdAt: Date.now() };
  items = existing ? items.map((x) => (x.id === id ? next : x)) : [...items, next];
  emit();
  schedule(id, duration);
  return id;
}

type Shorthand = (title: React.ReactNode, opts?: Omit<ToastOptions, "title" | "tone">) => number | string;
const tone = (t: ToastTone): Shorthand => (title, opts) => show({ ...opts, title, tone: t });

/**
 * Show a toast from anywhere. Requires <Toaster /> once in your layout.
 *
 *   toast("Saved")
 *   toast.success("Profile updated")
 *   toast.error("Upload failed", { action: { label: "Retry", onClick } })
 *   const id = toast.loading("Sending…"); toast.success("Sent", { id })
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: (e) => String(e) })
 */
export const toast = Object.assign(show, {
  success: tone("success"),
  error: tone("error"),
  warning: tone("warning"),
  info: tone("info"),
  loading: tone("loading"),
  dismiss: dismissToast,
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    msgs: { loading: React.ReactNode; success: React.ReactNode | ((v: T) => React.ReactNode); error: React.ReactNode | ((e: unknown) => React.ReactNode); description?: React.ReactNode },
  ): Promise<T> {
    const id = show({ title: msgs.loading, description: msgs.description, tone: "loading" });
    const p = typeof promise === "function" ? promise() : promise;
    p.then(
      (v) => show({ id, tone: "success", title: typeof msgs.success === "function" ? (msgs.success as (v: T) => React.ReactNode)(v) : msgs.success }),
      (e) => show({ id, tone: "error", title: typeof msgs.error === "function" ? (msgs.error as (e: unknown) => React.ReactNode)(e) : msgs.error }),
    );
    return p;
  },
});

/* ---------------------------------------------------------------- toaster */

const toneIcon = { default: null, success: CheckIcon, error: AlertIcon, warning: AlertIcon, info: InfoIcon, loading: null };
const toneClass: Record<ToastTone, string> = {
  default: "",
  success: "bg-accent text-accent-foreground",
  error: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  loading: "bg-surface-raised text-accent",
};
const barClass: Record<ToastTone, string> = {
  default: "bg-muted",
  success: "bg-accent",
  error: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
  loading: "bg-accent",
};

export type ToasterProps = {
  position?: "bottom-right" | "bottom-center" | "bottom-left" | "top-right" | "top-center" | "top-left";
  /** How many toasts are visible before they stack. */
  visible?: number;
  /** Thin countdown bar along the bottom of each toast. */
  showProgress?: boolean;
};

/** Renders stacked toasts. Hover to expand the stack and pause timers; swipe to dismiss. */
export function Toaster({ position = "bottom-right", visible = 3, showProgress = true }: ToasterProps) {
  const [list, setList] = React.useState<ToastItem[]>(items);
  const [expanded, setExpanded] = React.useState(false);
  React.useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  const top = position.startsWith("top");
  const left = position.endsWith("left");
  const shown = list.slice(-visible);

  return (
    <section
      aria-label="Notifications"
      aria-live="polite"
      onMouseEnter={() => {
        setExpanded(true);
        pauseAll();
      }}
      onMouseLeave={() => {
        setExpanded(false);
        resumeAll();
      }}
      className={cn(
        "pointer-events-none fixed z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col",
        position === "bottom-right" && "bottom-4 right-4",
        position === "bottom-left" && "bottom-4 left-4",
        position === "bottom-center" && "bottom-4 left-1/2 -translate-x-1/2",
        position === "top-right" && "right-4 top-4",
        position === "top-left" && "left-4 top-4",
        position === "top-center" && "left-1/2 top-4 -translate-x-1/2",
      )}
    >
      <div className="relative">
        <AnimatePresence initial={false}>
          {shown.map((t, i) => {
            const fromFront = shown.length - 1 - i;
            const tn = t.tone ?? "default";
            const Icon = toneIcon[tn];
            const offset = expanded ? fromFront * 80 : fromFront * 10;
            return (
              <motion.div
                key={t.id}
                layout
                role={tn === "error" ? "alert" : "status"}
                initial={{ opacity: 0, y: top ? -20 : 20, scale: 0.95 }}
                animate={{ opacity: fromFront > 2 ? 0 : 1, y: top ? offset : -offset, scale: expanded ? 1 : 1 - fromFront * 0.05 }}
                exit={{ opacity: 0, x: left ? -60 : 60, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 80) dismissToast(t.id);
                }}
                style={{ zIndex: i }}
                className={cn(
                  "pointer-events-auto absolute inset-x-0 flex items-start gap-3 overflow-hidden rounded-2xl border border-border-strong bg-surface-overlay p-4 shadow-overlay",
                  top ? "top-0" : "bottom-0",
                )}
              >
                {t.icon ? (
                  <span className="flex size-7 shrink-0 items-center justify-center">{t.icon}</span>
                ) : tn === "loading" ? (
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", toneClass.loading)}>
                    <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-kn-spin" />
                  </span>
                ) : Icon ? (
                  <motion.span key={tn} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", toneClass[tn])}>
                    <Icon size={14} strokeWidth={2.5} />
                  </motion.span>
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
                {showProgress && t.duration ? (
                  <span
                    key={`${t.id}-${t.createdAt}`}
                    aria-hidden
                    className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-60", barClass[tn])}
                    style={{ animation: `kn-toast-bar ${t.duration}ms linear forwards`, animationPlayState: expanded ? "paused" : "running" }}
                  />
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
