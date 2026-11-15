"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@kineticui/core";

export type SwipeAction = {
  label: string;
  icon?: React.ReactNode;
  /** Background colour. */
  color: string;
  onAction: () => void;
};

export type SwipeActionsProps = {
  children: React.ReactNode;
  /** Revealed when swiping right. */
  left?: SwipeAction[];
  /** Revealed when swiping left. */
  right?: SwipeAction[];
  /** Swiping past this fraction of the width triggers the outermost action. */
  fullSwipe?: number;
  className?: string;
};

const ACTION_W = 76;

/** iOS-style swipeable row: reveal actions on either side, full-swipe to trigger. */
export function SwipeActions({ children, left = [], right = [], fullSwipe = 0.55, className }: SwipeActionsProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [width, setWidth] = React.useState(360);
  const [armed, setArmed] = React.useState<"left" | "right" | null>(null);
  React.useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);

  const leftW = left.length * ACTION_W;
  const rightW = right.length * ACTION_W;
  const leftOpacity = useTransform(x, [0, 24], [0, 1]);
  const rightOpacity = useTransform(x, [-24, 0], [1, 0]);

  const settle = (to: number) => animate(x, to, { type: "spring", stiffness: 500, damping: 40 });
  const fire = (a: SwipeAction) => {
    a.onAction();
    void settle(0);
  };

  const panel = (actions: SwipeAction[], side: "left" | "right") => (
    <motion.div style={{ opacity: side === "left" ? leftOpacity : rightOpacity }} className={cn("absolute inset-y-0 flex", side === "left" ? "left-0" : "right-0 flex-row-reverse")}>
      {actions.map((a, i) => {
        const outer = i === actions.length - 1;
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => fire(a)}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white transition-[width] duration-200 [&_svg]:size-5"
            style={{ background: a.color, width: outer && armed === side ? width : ACTION_W }}
          >
            {a.icon}
            {a.label}
          </button>
        );
      })}
    </motion.div>
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-2xl bg-surface-raised", className)}>
      {left.length ? panel(left, "left") : null}
      {right.length ? panel(right, "right") : null}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: right.length ? -width : 0, right: left.length ? width : 0 }}
        dragElastic={0.08}
        style={{ x }}
        onDrag={() => {
          const v = x.get();
          setArmed(v > width * fullSwipe ? "left" : v < -width * fullSwipe ? "right" : null);
        }}
        onDragEnd={(_, info) => {
          const v = x.get() + info.velocity.x * 0.1;
          setArmed(null);
          if (left.length && v > width * fullSwipe) return fire(left.at(-1)!);
          if (right.length && v < -width * fullSwipe) return fire(right.at(-1)!);
          if (v > leftW / 2 && left.length) return void settle(leftW);
          if (v < -rightW / 2 && right.length) return void settle(-rightW);
          void settle(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && right.length) void settle(-rightW);
          if (e.key === "ArrowRight" && left.length) void settle(leftW);
          if (e.key === "Escape") void settle(0);
        }}
        tabIndex={0}
        aria-label="Swipe for actions, or use arrow keys"
        className="relative z-[1] cursor-grab touch-pan-y bg-surface outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
