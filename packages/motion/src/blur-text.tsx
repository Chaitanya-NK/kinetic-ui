"use client";

import * as React from "react";
import { motion, useInView, type Variants } from "motion/react";
import { cn } from "@kineticui/core";

export type BlurTextProps = {
  text: string;
  /** Animate per word or per letter. */
  by?: "word" | "letter";
  /** Seconds between each piece. */
  stagger?: number;
  delay?: number;
  direction?: "up" | "down";
  /** Play only once when scrolled into view. */
  once?: boolean;
  as?: React.ElementType;
  className?: string;
};

/** Text that resolves from a blur, word by word or letter by letter, when it enters the viewport. */
export function BlurText({ text, by = "word", stagger = 0.08, delay = 0, direction = "up", once = true, as: Tag = "p", className }: BlurTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px" });
  const pieces = by === "word" ? text.split(/(\s+)/) : Array.from(text);
  const v: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: direction === "up" ? 14 : -14 },
    show: (i: number) => ({ opacity: 1, filter: "blur(0px)", y: 0, transition: { delay: delay + i * stagger, duration: 0.55, ease: [0.22, 1, 0.36, 1] } }),
  };
  let k = 0;
  return (
    <Tag ref={ref} aria-label={text} className={cn("flex flex-wrap", className)}>
      {pieces.map((p, i) =>
        /^\s+$/.test(p) ? (
          <span key={i} aria-hidden>&nbsp;</span>
        ) : (
          <motion.span key={i} aria-hidden custom={k++} variants={v} initial="hidden" animate={inView ? "show" : "hidden"} className="inline-block will-change-[filter,transform]">
            {p === " " ? " " : p}
          </motion.span>
        ),
      )}
    </Tag>
  );
}
