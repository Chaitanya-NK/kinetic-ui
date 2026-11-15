"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";

const STAR = "M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z";

export type RatingProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  size?: number;
  readOnly?: boolean;
  /** Labels shown for each value, e.g. ["Poor", …, "Loved it"]. */
  labels?: string[];
  className?: string;
  "aria-label"?: string;
};

/** Star rating with hover preview, keyboard support and a little pop. */
export function Rating({
  value,
  defaultValue = 0,
  onValueChange,
  max = 5,
  size = 32,
  readOnly,
  labels,
  className,
  ...rest
}: RatingProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [hover, setHover] = React.useState(0);
  const shown = hover || current;
  const name = React.useId();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="radiogroup"
        aria-label={rest["aria-label"] ?? "Rating"}
        className="flex gap-1"
        onPointerLeave={() => setHover(0)}
      >
        {Array.from({ length: max }, (_, i) => {
          const n = i + 1;
          const on = n <= shown;
          return (
            <label key={n} className={cn("relative", readOnly ? "cursor-default" : "cursor-pointer")} onPointerEnter={() => !readOnly && setHover(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={current === n}
                disabled={readOnly}
                onChange={() => setCurrent(n)}
                aria-label={labels?.[i] ?? `${n} star${n > 1 ? "s" : ""}`}
                className="peer sr-only"
              />
              <motion.svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                aria-hidden
                animate={{ scale: current === n ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-foreground"
              >
                <path d={STAR} fill={on ? "var(--kn-accent)" : "none"} stroke={on ? "var(--kn-accent)" : "var(--kn-border-strong)"} strokeWidth="1.5" strokeLinejoin="round" />
              </motion.svg>
            </label>
          );
        })}
      </div>
      {labels && shown ? <span className="text-sm font-medium text-foreground">{labels[shown - 1]}</span> : null}
    </div>
  );
}
