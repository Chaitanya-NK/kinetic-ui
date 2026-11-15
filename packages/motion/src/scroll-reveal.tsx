"use client";

import * as React from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@kineticui/core";

export type ScrollRevealProps = {
  children: React.ReactNode;
  /** Seconds to wait before revealing. Use for staggering siblings. */
  delay?: number;
  /** Distance in px to travel up while fading in. */
  y?: number;
  className?: string;
};

/** Fades and lifts content into place the first time it scrolls into view. */
export function ScrollReveal({ children, delay = 0, y = 18, className }: ScrollRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduced ? 0.12 : 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
