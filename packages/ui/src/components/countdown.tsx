"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";

export type CountdownProps = {
  /** Target date/time. */
  to: Date | string | number;
  onComplete?: () => void;
  /** Hide the days unit when it's zero. */
  compact?: boolean;
  labels?: { days?: string; hours?: string; minutes?: string; seconds?: string };
  className?: string;
};

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-[1.1em] overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={value} initial={{ y: "-100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="inline-block">
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Live countdown with flip-style digits for launches and sales. */
export function Countdown({ to, onComplete, compact, labels, className }: CountdownProps) {
  const target = React.useMemo(() => new Date(to).getTime(), [to]);
  const mounted = useMounted();
  const [t, setT] = React.useState(() => diff(target));
  const fired = React.useRef(false);

  React.useEffect(() => {
    const tick = () => {
      const d = diff(target);
      setT(d);
      if (d.done && !fired.current) {
        fired.current = true;
        onComplete?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, onComplete]);

  const units = [
    { key: "days", v: t.days, label: labels?.days ?? "days" },
    { key: "hours", v: t.hours, label: labels?.hours ?? "hours" },
    { key: "minutes", v: t.minutes, label: labels?.minutes ?? "min" },
    { key: "seconds", v: t.seconds, label: labels?.seconds ?? "sec" },
  ].filter((u) => !(compact && u.key === "days" && u.v === 0));

  return (
    <div role="timer" aria-live="off" className={cn("flex items-start gap-2", className)}>
      {units.map((u, i) => {
        const text = mounted ? String(u.v).padStart(2, "0") : "--";
        return (
          <React.Fragment key={u.key}>
            {i > 0 ? <span className="pt-3 font-display text-3xl font-semibold text-subtle">:</span> : null}
            <div className="flex flex-col items-center gap-1.5">
              <span className="flex min-w-16 justify-center rounded-xl border border-border bg-surface-raised px-3 py-2.5 font-display text-4xl font-semibold tabular-nums tracking-tight">
                {text.split("").map((c, j) => (
                  <Digit key={j} value={c} />
                ))}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">{u.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
