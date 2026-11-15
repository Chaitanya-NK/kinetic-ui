"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";

export type TabBarItem = { value: string; label: string; icon: React.ReactNode; badge?: number | boolean };

export type BottomTabBarProps = {
  items: TabBarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Stick to the bottom of the viewport (mobile apps). */
  fixed?: boolean;
  className?: string;
};

/** Mobile bottom navigation with a sliding active pill and badges. */
export function BottomTabBar({ items, value, defaultValue, onValueChange, fixed, className }: BottomTabBarProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue: defaultValue ?? items[0]?.value ?? "", onChange: onValueChange });
  const id = React.useId();
  return (
    <nav
      aria-label="Tabs"
      className={cn(
        "flex items-center justify-around border-t border-border bg-surface/95 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur-xl",
        fixed && "fixed inset-x-0 bottom-0 z-40",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.value === current;
        return (
          <button
            key={it.value}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => setCurrent(it.value)}
            className={cn("flex min-w-14 flex-col items-center gap-1 text-[11px] outline-none transition-colors focus-visible:text-foreground", active ? "text-accent" : "text-subtle")}
          >
            <span className="relative flex h-8 w-14 items-center justify-center [&_svg]:size-5">
              {active ? <motion.span layoutId={`kn-tabbar-${id}`} className="absolute inset-0 rounded-full bg-accent-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} /> : null}
              <span className="relative">{it.icon}</span>
              {it.badge ? (
                <span className="absolute right-2 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-accent-foreground">
                  {typeof it.badge === "number" ? it.badge : ""}
                </span>
              ) : null}
            </span>
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
