"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

/** A group of pressable buttons. type="single" behaves like radios, type="multiple" like checkboxes. */
export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("inline-flex items-center gap-1 rounded-xl border border-border bg-background p-1", className)}
    {...props}
  />
));
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & { variant?: "neutral" | "accent" }
>(({ className, variant = "neutral", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-subtle transition-colors hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40 [&_svg]:size-4",
      variant === "accent"
        ? "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
        : "data-[state=on]:bg-surface-overlay data-[state=on]:text-foreground",
      className,
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = "ToggleGroupItem";
