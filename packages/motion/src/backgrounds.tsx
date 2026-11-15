import * as React from "react";
import { cn } from "@kineticui/core";

type BgProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Fade the pattern out toward the edges. */
  fade?: boolean;
};

const FADE =
  "[mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]";

/** Slowly drifting grid lines. Place it absolutely behind your content. */
export function GridBackground({ className, fade = true, ...props }: BgProps) {
  return (
    <div
      aria-hidden
      data-kn-motion
      className={cn(
        "pointer-events-none absolute inset-0 animate-kn-grid [background-image:linear-gradient(var(--kn-border)_1px,transparent_1px),linear-gradient(90deg,var(--kn-border)_1px,transparent_1px)] [background-size:40px_40px]",
        fade && FADE,
        className,
      )}
      {...props}
    />
  );
}

/** A field of dots tinted with the accent colour. */
export function DotBackground({ className, fade = true, ...props }: BgProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--kn-accent)_1.2px,transparent_1.4px)] [background-size:18px_18px] opacity-60",
        fade && FADE,
        className,
      )}
      {...props}
    />
  );
}
