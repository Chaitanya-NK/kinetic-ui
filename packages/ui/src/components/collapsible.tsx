"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronDownIcon } from "@kineticui/icons";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; id: string; disabled?: boolean };
const C = React.createContext<Ctx | null>(null);
const use = () => {
  const c = React.useContext(C);
  if (!c) throw new Error("Collapsible parts must be inside <Collapsible>");
  return c;
};

export type CollapsibleProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** A single show/hide section with spring height animation. For several sections, use Accordion. */
export function Collapsible({ open: controlled, defaultOpen = false, onOpenChange, disabled, className, children }: CollapsibleProps) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled ?? inner;
  const setOpen = (v: boolean) => {
    if (disabled) return;
    if (controlled === undefined) setInner(v);
    onOpenChange?.(v);
  };
  const id = React.useId();
  return (
    <C.Provider value={{ open, setOpen, id, disabled }}>
      <div data-state={open ? "open" : "closed"} className={className}>
        {children}
      </div>
    </C.Provider>
  );
}

export type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Show the rotating chevron. */
  chevron?: boolean;
  /** Render your own element instead of a button (it receives the ARIA props). */
  asChild?: boolean;
};

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ chevron = true, asChild, className, children, onClick, ...props }, ref) => {
    const { open, setOpen, id, disabled } = use();
    const aria = {
      "aria-expanded": open,
      "aria-controls": `${id}-content`,
      "data-state": open ? "open" : "closed",
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      },
    };
    if (asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, aria);
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        {...props}
        {...aria}
        className={cn("flex w-full items-center justify-between gap-3 rounded-lg text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50", className)}
      >
        {children}
        {chevron ? (
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 28 }} className="flex text-subtle">
            <ChevronDownIcon size={16} />
          </motion.span>
        ) : null}
      </button>
    );
  },
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

export function CollapsibleContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, id } = use();
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={`${id}-content`}
          key="c"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { type: "spring", stiffness: 380, damping: 36 }, opacity: { duration: 0.18 } }}
          className="overflow-hidden"
        >
          <div className={className}>{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
