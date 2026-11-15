"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ProgressRing } from "@kineticui/ui";
import { CheckIcon } from "@kineticui/icons";

type Habit = { id: string; name: string; color: string; done: boolean[] };
const days = ["M", "T", "W", "T", "F", "S", "S"];

const initial: Habit[] = [
  { id: "1", name: "Run 5 km", color: "#C6F432", done: [true, false, true, true, false, false, false] },
  { id: "2", name: "Read 20 pages", color: "#7C8CFF", done: [true, true, true, true, true, false, false] },
  { id: "3", name: "No phone after 10pm", color: "#F4A86A", done: [false, true, true, false, true, false, false] },
  { id: "4", name: "Meditate", color: "#F0A3D0", done: [true, true, false, true, true, false, false] },
];

const streak = (d: boolean[], upTo: number) => {
  let s = 0;
  for (let i = upTo; i >= 0 && d[i]; i--) s++;
  return s;
};

/** Weekly habit grid: tap to check off days, per-habit streaks and an overall completion ring. */
export function HabitTracker({ today = 4 }: { today?: number }) {
  const [habits, setHabits] = React.useState(initial);
  const possible = habits.length * (today + 1);
  const done = habits.reduce((a, h) => a + h.done.slice(0, today + 1).filter(Boolean).length, 0);

  return (
    <section className="flex min-h-[520px] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <ProgressRing value={(done / possible) * 100} size={64} />
          <div>
            <h2 className="font-display text-xl font-semibold">This week</h2>
            <p className="text-sm text-muted">{done} of {possible} check-ins so far</p>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_repeat(7,36px)_48px] items-center gap-y-3 text-sm">
          <span />
          {days.map((d, i) => (
            <span key={i} className={cn("text-center font-mono text-[11px]", i === today ? "text-accent" : "text-subtle")}>{d}</span>
          ))}
          <span className="text-center font-mono text-[10px] text-subtle">STREAK</span>
          {habits.map((h) => (
            <React.Fragment key={h.id}>
              <span className="flex items-center gap-2 truncate pr-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: h.color }} />
                {h.name}
              </span>
              {h.done.map((on, i) => (
                <span key={i} className="flex justify-center">
                  <motion.button
                    type="button"
                    disabled={i > today}
                    aria-pressed={on}
                    aria-label={`${h.name}, day ${i + 1}`}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setHabits((hs) => hs.map((x) => (x.id === h.id ? { ...x, done: x.done.map((v, j) => (j === i ? !v : v)) } : x)))}
                    className={cn("flex size-7 items-center justify-center rounded-lg transition-colors disabled:opacity-25", on ? "text-[#0b0c0e]" : "bg-surface-raised hover:bg-surface-overlay", i === today && !on && "ring-1 ring-accent/60")}
                    style={on ? { background: h.color } : undefined}
                  >
                    {on ? <CheckIcon size={14} strokeWidth={3} /> : null}
                  </motion.button>
                </span>
              ))}
              <span className="text-center font-mono text-sm font-semibold">{streak(h.done, today)}d</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
