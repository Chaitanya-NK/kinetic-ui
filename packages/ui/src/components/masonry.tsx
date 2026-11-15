"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type MasonryProps = {
  children: React.ReactNode[];
  /** Columns by breakpoint: [base, sm, lg]. */
  columns?: [number, number, number];
  gap?: number;
  className?: string;
};

/** Pinterest-style grid that keeps reading order left-to-right and fades items in as they enter view. */
export function Masonry({ children, columns = [1, 2, 3], gap = 12, className }: MasonryProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [cols, setCols] = React.useState(columns[2]);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e!.contentRect.width;
      setCols(w >= 900 ? columns[2] : w >= 520 ? columns[1] : columns[0]);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns]);

  // Distribute round-robin so items read in order across the top row.
  const lanes: React.ReactNode[][] = Array.from({ length: cols }, () => []);
  React.Children.toArray(children).forEach((child, i) => lanes[i % cols]!.push(child));

  return (
    <div ref={ref} className={cn("flex items-start", className)} style={{ gap }}>
      {lanes.map((lane, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col" style={{ gap }}>
          {lane.map((child, j) => (
            <motion.div key={j} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}>
              {child}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
