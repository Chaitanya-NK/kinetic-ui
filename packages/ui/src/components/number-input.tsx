"use client";

import * as React from "react";
import { cn, useControllableState } from "@kineticui/core";
import { MinusIcon, PlusIcon } from "@kineticui/icons";

export type NumberInputProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  "aria-label"?: string;
};

/** −/+ stepper with keyboard arrows and min/max clamping. */
export function NumberInput({
  value,
  defaultValue = 0,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className,
  ...rest
}: NumberInputProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const btn =
    "flex size-11 items-center justify-center transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground";
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-border bg-background", className)}>
      <button type="button" aria-label="Decrease" disabled={current <= min} onClick={() => setCurrent(clamp(current - step))} className={cn(btn, "rounded-l-xl text-muted hover:text-foreground")}>
        <MinusIcon size={16} />
      </button>
      <input
        role="spinbutton"
        aria-label={rest["aria-label"] ?? "Value"}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuenow={current}
        inputMode="numeric"
        value={current}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) setCurrent(clamp(n));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setCurrent(clamp(current + step));
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setCurrent(clamp(current - step));
          }
        }}
        className="w-12 bg-transparent text-center font-mono text-lg font-semibold text-foreground outline-none"
      />
      <button type="button" aria-label="Increase" disabled={current >= max} onClick={() => setCurrent(clamp(current + step))} className={cn(btn, "rounded-r-xl text-accent")}>
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
