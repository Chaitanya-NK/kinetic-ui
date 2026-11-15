"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type TiltCardProps = {
  children: React.ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  className?: string;
};

/** 3D tilt that follows the pointer. */
export function TiltCard({ children, max = 12, className }: TiltCardProps) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });

  return (
    <div style={{ perspective: 900 }} className="inline-block">
      <motion.div
        className={cn("rounded-2xl border border-border bg-surface-raised shadow-overlay", className)}
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
