"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type RotatingWordsProps = {
  words: string[];
  /** Milliseconds each word stays. */
  interval?: number;
  className?: string;
};

/** Swaps words in place with a slide-up transition. */
export function RotatingWords({ words, interval = 2200, className }: RotatingWordsProps) {
  const reduced = useReducedMotion();
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (reduced || words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval, reduced]);

  return (
    // Clip vertically only, so the incoming word slides in without cutting letters horizontally.
    <span className={cn("relative inline-flex align-bottom [clip-path:inset(0_-100vw)]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block whitespace-nowrap text-accent"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
