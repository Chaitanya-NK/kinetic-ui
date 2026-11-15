"use client";

import * as React from "react";
import { HoverCard as HoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type HoverCardProps = {
  /** The element you hover, usually a link or avatar. */
  children: React.ReactElement;
  content: React.ReactNode;
  /** Milliseconds of hover before opening (intent delay). */
  openDelay?: number;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

/** Rich preview card shown on hover or keyboard focus. */
export function HoverCard({ children, content, openDelay = 300, side = "bottom", className }: HoverCardProps) {
  return (
    <HoverPrimitive.Root openDelay={openDelay} closeDelay={120}>
      <HoverPrimitive.Trigger asChild>{children}</HoverPrimitive.Trigger>
      <HoverPrimitive.Portal>
        <HoverPrimitive.Content
          side={side}
          sideOffset={8}
          className={cn(
            "z-50 w-72 rounded-2xl border border-border-strong bg-surface-raised p-4 text-sm text-foreground shadow-overlay data-[state=open]:animate-[kn-pop_0.18s_var(--ease-kn-out)]",
            className,
          )}
        >
          {content}
        </HoverPrimitive.Content>
      </HoverPrimitive.Portal>
    </HoverPrimitive.Root>
  );
}
