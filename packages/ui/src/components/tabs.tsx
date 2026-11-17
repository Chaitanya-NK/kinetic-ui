"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";

type TabsContextValue = { value: string; id: string; variant: "underline" | "pill" };
const TabsContext = React.createContext<TabsContextValue | null>(null);

export type TabsProps = Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "value" | "defaultValue" | "onValueChange"> & {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  /** underline: sliding underline. pill: sliding pill (segmented control). */
  variant?: "underline" | "pill";
};

/** Tabs whose indicator glides between triggers. */
export function Tabs({ value, defaultValue, onValueChange, variant = "underline", className, ...props }: TabsProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const id = React.useId();
  return (
    <TabsContext.Provider value={{ value: current, id, variant }}>
      <TabsPrimitive.Root value={current} onValueChange={setCurrent} className={cn("flex flex-col gap-4", className)} {...props} />
    </TabsContext.Provider>
  );
}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex",
        ctx?.variant === "pill"
          ? "gap-0 rounded-xl border border-border bg-background p-1"
          : "gap-1 border-b border-border",
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext);
  const active = ctx?.value === value;
  const pill = ctx?.variant === "pill";
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        "relative px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        pill ? "flex-1 rounded-lg py-2" : "pb-2.5 pt-2",
        active ? "text-foreground" : "text-subtle hover:text-muted",
        className,
      )}
      {...props}
    >
      {active ? (
        <motion.span
          layoutId={`kn-tab-${ctx?.id}`}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className={cn(
            "absolute",
            pill ? "inset-0 rounded-lg bg-surface-overlay shadow-sm" : "inset-x-0 -bottom-px h-0.5 rounded-full bg-accent",
          )}
        />
      ) : null}
      <span className="relative">{children}</span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("focus-visible:outline-none", className)} {...props} />
));
TabsContent.displayName = "TabsContent";

export type SegmentedControlProps = {
  /** `ariaLabel` names icon-only segments. */
  options: { value: string; label: React.ReactNode; ariaLabel?: string }[];
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  className?: string;
  "aria-label"?: string;
};

/** A compact pill switcher for 2–5 options. */
export function SegmentedControl({ options, value, defaultValue, onValueChange, className, ...rest }: SegmentedControlProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const id = React.useId();
  return (
    <div role="radiogroup" aria-label={rest["aria-label"]} className={cn("inline-flex rounded-xl border border-border bg-background p-1", className)}>
      {options.map((o) => {
        const active = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.ariaLabel}
            onClick={() => setCurrent(o.value)}
            className={cn(
              "relative flex-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
              active ? "text-foreground" : "text-subtle hover:text-muted",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`kn-seg-${id}`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-surface-overlay shadow-sm"
              />
            ) : null}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
