"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  /** Visual weight of the joined buttons. */
  variant?: "outline" | "solid";
};

/**
 * Joins buttons, inputs and menus into one control with shared borders and rounded ends.
 * Children keep their own behaviour; only the edges change.
 */
export function ButtonGroup({ orientation = "horizontal", variant = "outline", className, ...props }: ButtonGroupProps) {
  const h = orientation === "horizontal";
  return (
    <div
      role="group"
      data-orientation={orientation}
      className={cn(
        "inline-flex isolate",
        h ? "flex-row" : "flex-col",
        "[&>*]:rounded-none [&>*]:shadow-none [&>*:focus-visible]:z-10 [&>*:hover]:z-[5]",
        h
          ? "[&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl [&>*:not(:first-child)]:-ml-px"
          : "[&>*:first-child]:rounded-t-xl [&>*:last-child]:rounded-b-xl [&>*:not(:first-child)]:-mt-px",
        variant === "solid" && (h ? "[&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-l-black/15" : "[&>*:not(:first-child)]:mt-0 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-t-black/15"),
        className,
      )}
      {...props}
    />
  );
}

/** A plain text or icon cell inside a ButtonGroup, e.g. a prefix like "https://". */
export function ButtonGroupText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex h-11 items-center gap-2 border border-border bg-surface-raised px-3 text-sm text-muted [&_svg]:size-4", className)} {...props} />;
}
