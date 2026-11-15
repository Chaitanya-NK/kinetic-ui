"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type TooltipProps = {
  content: React.ReactNode;
  /** Keyboard shortcut shown on the right, e.g. "⌘ C". */
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  delay?: number;
  children: React.ReactElement;
  className?: string;
};

/** Wrap any focusable element. Includes its own provider, so no setup needed. */
export function Tooltip({ content, shortcut, side = "top", delay = 300, children, className }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className={cn(
              "z-50 flex items-center gap-2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-overlay",
              "origin-[var(--radix-tooltip-content-transform-origin)] data-[state=delayed-open]:animate-[kn-pop_0.15s_ease-out]",
              className,
            )}
          >
            {content}
            {shortcut ? <span className="font-mono text-[11px] opacity-60">{shortcut}</span> : null}
            <TooltipPrimitive.Arrow className="fill-foreground" width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
