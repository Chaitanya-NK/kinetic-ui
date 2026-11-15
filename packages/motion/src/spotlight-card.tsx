"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Glow colour. Defaults to the accent token. */
  glowColor?: string;
  /** Glow radius in px. */
  size?: number;
};

/** A card whose soft glow follows the pointer. */
export function SpotlightCard({
  className,
  glowColor = "var(--kn-ring)",
  size = 260,
  children,
  onPointerMove,
  style,
  ...props
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: -999, y: -999 });

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        onPointerMove?.(e);
      }}
      onPointerLeave={() => setPos({ x: -999, y: -999 })}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-6",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${glowColor}, transparent 70%)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
