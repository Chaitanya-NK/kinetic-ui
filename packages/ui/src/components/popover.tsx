"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { arrow?: boolean }
>(({ className, sideOffset = 8, align = "start", arrow = false, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        "z-50 w-72 rounded-xl border border-border-strong bg-surface-raised p-4 text-sm text-foreground shadow-overlay focus:outline-none",
        "origin-[var(--radix-popover-content-transform-origin)] data-[state=open]:animate-[kn-pop_0.18s_var(--ease-kn-out)]",
        className,
      )}
      {...props}
    >
      {children}
      {arrow ? <PopoverPrimitive.Arrow className="fill-surface-raised" width={12} height={6} /> : null}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
