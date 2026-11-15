"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type MobileMenuProps = {
  links: { label: string; href: string; active?: boolean }[];
  /** Buttons at the bottom of the menu. */
  actions?: React.ReactNode;
  /** Shown top-left inside the open menu. */
  logo?: React.ReactNode;
  className?: string;
};

/** Hamburger that morphs into ✕ and opens a full-screen menu with staggered links. */
export function MobileMenu({ links, actions, logo, className }: MobileMenuProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn("relative flex size-10 items-center justify-center rounded-xl bg-surface-overlay outline-none focus-visible:ring-2 focus-visible:ring-foreground", className)}
      >
        <span className="relative block h-3.5 w-5">
          <span className={cn("absolute left-0 top-0 h-0.5 w-5 rounded-full bg-foreground transition-transform duration-300", open && "translate-y-[6px] rotate-45")} />
          <span className={cn("absolute left-0 top-[6px] h-0.5 w-5 rounded-full bg-foreground transition-opacity duration-200", open && "opacity-0")} />
          <span className={cn("absolute left-0 top-3 h-0.5 w-5 rounded-full bg-foreground transition-transform duration-300", open && "-translate-y-[6px] -rotate-45")} />
        </span>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-background p-6 pt-5 data-[state=open]:animate-[kn-fade_0.2s_ease-out]">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="flex h-10 items-center justify-between">
            <span className="font-display text-lg font-semibold">{logo}</span>
            <DialogPrimitive.Close aria-label="Close menu" className="flex size-10 items-center justify-center rounded-xl bg-surface-overlay text-lg">✕</DialogPrimitive.Close>
          </div>
          <nav aria-label="Mobile" className="mt-10 flex flex-col gap-1">
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 300, damping: 26 }}
                aria-current={l.active ? "page" : undefined}
                className={cn("font-display text-4xl font-semibold tracking-tight", l.active ? "text-foreground" : "text-subtle hover:text-foreground")}
              >
                {l.label}
              </motion.a>
            ))}
          </nav>
          {actions ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-auto flex flex-col gap-2">
              {actions}
            </motion.div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
