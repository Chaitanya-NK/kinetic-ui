"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { useTheme } from "@kineticui/core/theme";
import { MoonIcon, SunIcon } from "@kineticui/icons";

export type ThemeSwitchProps = {
  /** toggle: animated sun/moon switch. segmented: Light / Dark / System. */
  variant?: "toggle" | "segmented";
  className?: string;
};

const modes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

/** Light/dark switch wired to the Kinetic ThemeProvider. */
export function ThemeSwitch({ variant = "toggle", className }: ThemeSwitchProps) {
  const { mode, resolvedMode, setMode } = useTheme();
  const mounted = useMounted();
  const id = React.useId();
  const dark = mounted ? resolvedMode === "dark" : true;

  if (variant === "segmented") {
    return (
      <div role="radiogroup" aria-label="Theme" className={cn("inline-flex rounded-full bg-surface-raised p-1", className)}>
        {modes.map((m) => {
          const active = mounted && mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m.value)}
              className={cn("relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors", active ? "text-foreground" : "text-subtle hover:text-foreground")}
            >
              {active ? <motion.span layoutId={`kn-theme-${id}`} className="absolute inset-0 rounded-full bg-surface-overlay shadow-sm" /> : null}
              <span className="relative">{m.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => setMode(dark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-[60px] items-center rounded-full p-1 outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-foreground",
        dark ? "bg-surface-overlay" : "bg-accent-soft",
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn("flex size-6 items-center justify-center rounded-full shadow-sm", dark ? "ml-auto bg-foreground text-background" : "bg-accent text-accent-foreground")}
      >
        <motion.span key={dark ? "moon" : "sun"} initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }}>
          {dark ? <MoonIcon size={13} /> : <SunIcon size={13} />}
        </motion.span>
      </motion.span>
    </button>
  );
}
