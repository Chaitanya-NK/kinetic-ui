"use client";

import * as React from "react";
import { animate, useInView } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type NumberTickerProps = {
  value: number;
  /** Seconds to animate. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
};

/** Counts up to `value` when scrolled into view, and re-animates on change. */
export function NumberTicker({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-US",
  className,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const from = React.useRef(0);

  const format = React.useCallback(
    (n: number) =>
      prefix +
      n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
      suffix,
    [prefix, suffix, decimals, locale],
  );

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduced) {
      node.textContent = format(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [value, inView, duration, reduced, format]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(0)}
    </span>
  );
}
