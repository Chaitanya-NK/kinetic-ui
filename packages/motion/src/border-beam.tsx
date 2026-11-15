"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type BorderBeamProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Seconds for one full orbit. */
  duration?: number;
  /** Beam colour. Defaults to the accent token. */
  color?: string;
  /** Border thickness in px. */
  thickness?: number;
};

/** Wraps content in a card with a beam of light orbiting its edge. */
export function BorderBeam({
  className,
  duration = 4,
  color = "var(--kn-accent)",
  thickness = 2,
  children,
  style,
  ...props
}: BorderBeamProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-border", className)}
      style={{ padding: thickness, ...style }}
      {...props}
    >
      <span
        aria-hidden
        data-kn-motion
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-kn-beam"
        style={
          {
            "--kn-beam-duration": `${duration}s`,
            background: `conic-gradient(from 0deg, transparent 0 70%, ${color} 80%, transparent 90%)`,
          } as React.CSSProperties
        }
      />
      <div className="relative h-full rounded-[calc(1rem-2px)] bg-surface">{children}</div>
    </div>
  );
}
