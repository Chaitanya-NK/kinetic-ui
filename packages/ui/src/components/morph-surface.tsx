"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon } from "@kineticui/icons";

export type MorphSurfaceApi = {
  close: () => void;
  /** Show the success state, then close. */
  done: (message?: React.ReactNode) => void;
};

export type MorphSurfaceProps = {
  /** Content of the closed button. */
  label: React.ReactNode;
  /** The open panel. Receives close() and done(). */
  children: (api: MorphSurfaceApi) => React.ReactNode;
  /** Size of the open panel in px. Height grows with content when omitted. */
  width?: number;
  height?: number;
  /** Which corner the panel grows from. */
  origin?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name of the open panel. */
  title?: string;
  className?: string;
  panelClassName?: string;
};

const spring = { type: "spring", stiffness: 380, damping: 34, mass: 0.85 } as const;

/**
 * A button that physically morphs into a panel (a form, a menu, a card) and back. Call done() from inside the
 * panel to shrink it into a check mark before it settles back into the button.
 */
export function MorphSurface({ label, children, width = 340, height, origin = "bottom-right", open: controlled, onOpenChange, title = "Panel", className, panelClassName }: MorphSurfaceProps) {
  const [inner, setInner] = React.useState(false);
  const open = controlled ?? inner;
  const [success, setSuccess] = React.useState<React.ReactNode | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (controlled === undefined) setInner(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );
  const close = React.useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }, [setOpen]);
  const done = React.useCallback(
    (msg?: React.ReactNode) => {
      setSuccess(msg ?? "Sent");
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => setSuccess(null), 400);
      }, 1300);
    },
    [setOpen],
  );

  React.useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    // Focus the first field once the panel has grown.
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-morph-close])")?.focus(), 180);
    return () => (document.removeEventListener("pointerdown", away), document.removeEventListener("keydown", esc), clearTimeout(t));
  }, [open, close]);

  const [v, h] = origin.split("-") as ["top" | "bottom", "left" | "right"];
  const state = success ? "success" : open ? "open" : "closed";

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: "fit-content" }}>
      {/* Placeholder keeps the layout stable while the surface floats. */}
      <span aria-hidden className="invisible flex h-11 items-center gap-2 whitespace-nowrap px-5 text-sm font-semibold">{label}</span>
      <motion.div
        ref={ref}
        layout
        initial={false}
        role={state === "open" ? "dialog" : undefined}
        aria-label={state === "open" ? title : undefined}
        aria-modal={state === "open" ? false : undefined}
        transition={spring}
        style={{
          position: "absolute",
          [v]: 0,
          [h]: 0,
          width: state === "open" ? width : state === "success" ? 180 : "auto",
          height: state === "open" ? height ?? "auto" : state === "success" ? 52 : 44,
          borderRadius: state === "open" ? 22 : 999,
          zIndex: state === "closed" ? 1 : 40,
        }}
        className={cn(
          "overflow-hidden border shadow-overlay",
          state === "closed" ? "border-transparent bg-accent text-accent-foreground" : state === "success" ? "border-transparent bg-success text-background" : "border-border-strong bg-surface-raised text-foreground",
          state === "open" && panelClassName,
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "closed" ? (
            <motion.button
              key="label"
              ref={trigger}
              type="button"
              aria-expanded={false}
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.1 } }}
              className="flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap px-5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 [&_svg]:size-4"
            >
              {label}
            </motion.button>
          ) : state === "open" ? (
            <motion.div key="panel" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)", transition: { delay: 0.08 } }} exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.12 } }} style={{ width }}>
              {children({ close, done })}
            </motion.div>
          ) : (
            <motion.div key="ok" role="status" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex h-[52px] items-center justify-center gap-2 whitespace-nowrap px-5 text-sm font-semibold">
              <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }} className="flex size-6 items-center justify-center rounded-full bg-background/20">
                <CheckIcon size={14} strokeWidth={3.2} />
              </motion.span>
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Header row for a MorphSurface panel with a close button. */
export function MorphSurfaceHeader({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <span className="text-sm font-semibold">{children}</span>
      <button type="button" data-morph-close onClick={onClose} aria-label="Close" className="rounded-md px-1.5 text-lg leading-none text-subtle hover:text-foreground">
        ×
      </button>
    </div>
  );
}
