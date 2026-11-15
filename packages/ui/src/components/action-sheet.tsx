"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type ActionSheetAction = {
  label: string;
  icon?: React.ReactNode;
  description?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export type ActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
};

/** Mobile bottom sheet of actions. Drag down or tap outside to dismiss. */
export function ActionSheet({ open, onOpenChange, title, description, actions, cancelLabel = "Cancel" }: ActionSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]" />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount aria-describedby={description ? undefined : undefined}>
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 90 || info.velocity.y > 500) onOpenChange(false);
                }}
                className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col gap-2 p-3 pb-[max(env(safe-area-inset-bottom),12px)] outline-none"
              >
                <div className="overflow-hidden rounded-[22px] border border-border-strong bg-surface-raised">
                  <div className="flex justify-center pt-2.5">
                    <span className="h-1 w-10 rounded-full bg-border-strong" />
                  </div>
                  {title || description ? (
                    <div className="flex flex-col items-center gap-1 border-b border-border px-6 pb-3 pt-2 text-center">
                      {title ? <DialogPrimitive.Title className="text-sm font-semibold">{title}</DialogPrimitive.Title> : <DialogPrimitive.Title className="sr-only">Actions</DialogPrimitive.Title>}
                      {description ? <DialogPrimitive.Description className="text-xs text-subtle">{description}</DialogPrimitive.Description> : null}
                    </div>
                  ) : (
                    <DialogPrimitive.Title className="sr-only">Actions</DialogPrimitive.Title>
                  )}
                  <div className="flex flex-col py-1">
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        disabled={a.disabled}
                        onClick={() => {
                          a.onSelect();
                          onOpenChange(false);
                        }}
                        className={cn(
                          "flex items-center gap-3.5 px-5 py-3.5 text-left text-[15px] outline-none transition-colors hover:bg-surface-overlay focus-visible:bg-surface-overlay disabled:opacity-40 [&_svg]:size-5",
                          a.destructive ? "text-danger" : "text-foreground [&_svg]:text-muted",
                        )}
                      >
                        {a.icon}
                        <span className="flex flex-col">
                          {a.label}
                          {a.description ? <span className="text-xs text-subtle">{a.description}</span> : null}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <DialogPrimitive.Close className="h-14 rounded-[22px] border border-border-strong bg-surface-raised text-[15px] font-semibold outline-none hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-foreground">
                  {cancelLabel}
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
