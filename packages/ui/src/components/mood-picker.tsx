"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";

export type MoodPickerProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  labels?: [string, string, string, string, string];
  className?: string;
};

const colors = ["#F87171", "#F4A86A", "#F5C451", "#A3E635", "var(--kn-accent)"];
// Mouth curve control-point offset per mood: frown → smile.
const curve = [-5, -2.5, 0, 3, 6];

function Face({ mood, active }: { mood: number; active: boolean }) {
  const c = curve[mood]!;
  return (
    <svg viewBox="0 0 40 40" className="size-full" aria-hidden>
      <circle cx="20" cy="20" r="18" fill={active ? colors[mood] : "var(--kn-surface-overlay)"} style={{ transition: "fill .25s" }} />
      <g fill={active ? "#0b0c0e" : "var(--kn-muted)"}>
        <motion.ellipse cx="14" cy="16" rx="2" ry={2} initial={false} animate={{ ry: active ? (mood === 4 ? 1 : 2.4) : 2 }} />
        <motion.ellipse cx="26" cy="16" rx="2" ry={2} initial={false} animate={{ ry: active ? (mood === 4 ? 1 : 2.4) : 2 }} />
      </g>
      <motion.path
        fill="none"
        stroke={active ? "#0b0c0e" : "var(--kn-muted)"}
        strokeWidth="2.4"
        strokeLinecap="round"
        d={`M12 ${26 - c / 3} Q20 ${26 + c} 28 ${26 - c / 3}`}
        initial={false}
        animate={{ d: `M12 ${26 - c / 3} Q20 ${26 + c} 28 ${26 - c / 3}` }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      />
    </svg>
  );
}

/** Five drawn faces from very unhappy to delighted; the selected face animates and colours in. */
export function MoodPicker({ value, defaultValue, onValueChange, labels = ["Awful", "Bad", "Okay", "Good", "Great"], className }: MoodPickerProps) {
  const [current, setCurrent] = useControllableState<number | undefined>({ value, defaultValue, onChange: (v) => v !== undefined && onValueChange?.(v) });
  const [hover, setHover] = React.useState<number | null>(null);
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div role="radiogroup" aria-label="Mood" className="flex gap-2" onPointerLeave={() => setHover(null)}>
        {labels.map((l, i) => {
          const active = current === i;
          return (
            <motion.button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={l}
              onPointerEnter={() => setHover(i)}
              onClick={() => setCurrent(i)}
              whileTap={{ scale: 0.88 }}
              animate={{ scale: active ? 1.18 : hover === i ? 1.08 : 1, y: active ? -4 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="size-12 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Face mood={i} active={active || hover === i} />
            </motion.button>
          );
        })}
      </div>
      <span className="h-5 text-sm font-medium" aria-live="polite">
        {hover !== null ? labels[hover] : current !== undefined ? labels[current] : <span className="text-subtle">How was your experience?</span>}
      </span>
    </div>
  );
}
