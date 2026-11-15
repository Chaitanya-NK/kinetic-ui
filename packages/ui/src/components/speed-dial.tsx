"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { PlusIcon } from "@kineticui/icons";

export type SpeedDialAction = { label: string; icon: React.ReactNode; onClick: () => void };

export type SpeedDialProps = {
  actions: SpeedDialAction[];
  /** Pin to the bottom-right corner of the viewport. */
  fixed?: boolean;
  label?: string;
  className?: string;
};

/** Floating action button that fans out labelled actions. */
export function SpeedDial({ actions, fixed, label = "Actions", className }: SpeedDialProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("flex flex-col items-end gap-3", fixed && "fixed bottom-6 right-6 z-40", className)}>
      <AnimatePresence>
        {open
          ? actions.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: (actions.length - 1 - i) * 0.04 } }}
                exit={{ opacity: 0, y: 8, scale: 0.8, transition: { duration: 0.12 } }}
                className="flex items-center gap-3"
              >
                <span className="rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-overlay">{a.label}</span>
                <button
                  type="button"
                  aria-label={a.label}
                  onClick={() => {
                    a.onClick();
                    setOpen(false);
                  }}
                  className="mr-1.5 flex size-11 items-center justify-center rounded-full border border-border-strong bg-surface-overlay text-foreground shadow-overlay outline-none hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-foreground [&_svg]:size-[18px]"
                >
                  {a.icon}
                </button>
              </motion.div>
            ))
          : null}
      </AnimatePresence>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_28px_var(--kn-ring)] outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <PlusIcon size={22} strokeWidth={2.4} className={cn("transition-transform duration-300 ease-kn-spring", open && "rotate-45")} />
      </button>
    </div>
  );
}
