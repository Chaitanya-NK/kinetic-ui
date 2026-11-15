"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type MagneticProps = {
  children: React.ReactNode;
  /** 0–1: how far the child leans toward the pointer. */
  strength?: number;
  className?: string;
};

/** Makes its child lean toward the pointer, then spring back. */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
