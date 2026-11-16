"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type GradientTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  colors?: string[];
  /** Seconds per sweep. 0 for a static gradient. */
  speed?: number;
  /** Render as another tag, e.g. "h1". */
  as?: React.ElementType;
};

/** Text filled with a flowing gradient. */
export function GradientText({ colors = ["var(--kn-accent)", "#7dd3fc", "#c4b5fd", "var(--kn-accent)"], speed = 6, as: Tag = "span", className, style, ...props }: GradientTextProps) {
  return (
    <Tag
      data-kn-motion
      className={cn("inline-block bg-clip-text text-transparent [-webkit-background-clip:text]", speed && "animate-[kn-gradient-x_var(--kn-gt)_ease-in-out_infinite_alternate]", className)}
      style={{ backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`, backgroundSize: "300% 100%", "--kn-gt": `${speed}s`, ...style } as React.CSSProperties}
      {...props}
    />
  );
}
