"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@kineticui/core";

export type ScrollShowcaseProps = {
  /** Heading area above the screen; it rises and fades as you scroll. */
  title?: React.ReactNode;
  /** The screenshot or live UI. */
  children: React.ReactNode;
  /** Starting tilt in degrees. */
  tilt?: number;
  className?: string;
  frameClassName?: string;
  /** Scrollable ancestor to track instead of the window. */
  container?: React.RefObject<HTMLElement | null>;
};

/** A product screen that starts tilted back and swings flat as it scrolls into view. The hero shot for landing pages. */
export function ScrollShowcase({ title, children, tilt = 24, className, frameClassName, container }: ScrollShowcaseProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const rotateX = useTransform(p, [0, 1], [reduce ? 0 : tilt, 0]);
  const scale = useTransform(p, [0, 1], [reduce ? 1 : 0.88, 1]);
  const y = useTransform(p, [0, 1], [reduce ? 0 : 60, 0]);
  const titleY = useTransform(p, [0, 1], [reduce ? 0 : 40, 0]);
  const titleOpacity = useTransform(p, [0, 0.6], [reduce ? 1 : 0.2, 1]);
  const glow = useTransform(p, [0, 1], [0, 0.55]);

  return (
    <div ref={ref} className={cn("flex w-full flex-col items-center gap-10 [perspective:1200px]", className)}>
      {title ? <motion.div style={{ y: titleY, opacity: titleOpacity }} className="text-center">{title}</motion.div> : null}
      <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }} className="relative w-full">
        <motion.div aria-hidden style={{ opacity: glow }} className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent/40 blur-3xl" />
        <div className={cn("overflow-hidden rounded-[1.6rem] border border-border-strong bg-surface p-2 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)]", frameClassName)}>
          <div className="overflow-hidden rounded-[1.1rem] border border-border bg-background">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
