"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type AnimatedBeamProps = {
  /** The positioned element both nodes live in. The beam is drawn in its coordinate space. */
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  /** Bend of the path in px. Positive arcs up, negative arcs down. */
  curvature?: number;
  /** Seconds for one pass of light. */
  duration?: number;
  delay?: number;
  /** Send the light from `to` back to `from`. */
  reverse?: boolean;
  /** Nudge the end points, e.g. to start at an edge instead of the centre. */
  startOffset?: { x?: number; y?: number };
  endOffset?: { x?: number; y?: number };
  pathColor?: string;
  pathOpacity?: number;
  pathWidth?: number;
  /** Colours of the travelling light. */
  gradientStart?: string;
  gradientStop?: string;
  className?: string;
};

/** A curved line between two elements with light travelling along it. Use several to show data flowing between logos or services. */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 4,
  delay = 0,
  reverse = false,
  startOffset,
  endOffset,
  pathColor = "var(--kn-border-strong)",
  pathOpacity = 0.6,
  pathWidth = 2,
  gradientStart = "var(--kn-accent)",
  gradientStop = "#7dd3fc",
  className,
}: AnimatedBeamProps) {
  const id = React.useId().replace(/:/g, "");
  const [geo, setGeo] = React.useState({ d: "", w: 0, h: 0 });

  React.useEffect(() => {
    const c = containerRef.current, a = fromRef.current, b = toRef.current;
    if (!c || !a || !b) return;
    const update = () => {
      const cr = c.getBoundingClientRect(), ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      const x1 = ar.left - cr.left + ar.width / 2 + (startOffset?.x ?? 0);
      const y1 = ar.top - cr.top + ar.height / 2 + (startOffset?.y ?? 0);
      const x2 = br.left - cr.left + br.width / 2 + (endOffset?.x ?? 0);
      const y2 = br.top - cr.top + br.height / 2 + (endOffset?.y ?? 0);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - curvature;
      setGeo({ d: `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`, w: cr.width, h: cr.height });
    };
    update();
    const ro = new ResizeObserver(update);
    [c, a, b].forEach((el) => ro.observe(el));
    window.addEventListener("resize", update);
    return () => (ro.disconnect(), window.removeEventListener("resize", update));
  }, [containerRef, fromRef, toRef, curvature, startOffset?.x, startOffset?.y, endOffset?.x, endOffset?.y]);

  // The gradient window slides from one end of the bounding box to the other.
  const from = reverse ? ["110%", "130%"] : ["-30%", "-10%"];
  const to = reverse ? ["-30%", "-10%"] : ["110%", "130%"];

  return (
    <svg aria-hidden data-kn-motion width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} fill="none" className={cn("pointer-events-none absolute left-0 top-0", className)}>
      <path d={geo.d} stroke={pathColor} strokeOpacity={pathOpacity} strokeWidth={pathWidth} strokeLinecap="round" />
      <path d={geo.d} stroke={`url(#${id})`} strokeWidth={pathWidth} strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: from[0], x2: from[1], y1: "0%", y2: "0%" }}
          animate={{ x1: [from[0], to[0]], x2: [from[1], to[1]] }}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop stopColor={gradientStart} stopOpacity="0" />
          <stop stopColor={gradientStart} />
          <stop offset="32.5%" stopColor={gradientStop} />
          <stop offset="100%" stopColor={gradientStop} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

/** Round node to pair with AnimatedBeam: a bordered circle that holds a logo or icon. */
export const BeamNode = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg"; glow?: boolean }>(
  ({ size = "md", glow, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex items-center justify-center rounded-full border border-border-strong bg-surface-raised text-foreground shadow-[0_0_24px_-12px_rgba(0,0,0,0.8)] [&_svg]:size-1/2",
        size === "sm" ? "size-10" : size === "lg" ? "size-20" : "size-14",
        glow && "border-accent shadow-[0_0_40px_-6px_var(--kn-accent)]",
        className,
      )}
      {...props}
    />
  ),
);
BeamNode.displayName = "BeamNode";
