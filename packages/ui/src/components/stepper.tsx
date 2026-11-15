import * as React from "react";
import { cn } from "@kineticui/core";
import { CheckIcon } from "@kineticui/icons";

export type StepperProps = {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
};

/** Horizontal progress through numbered steps. */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex w-full items-start", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 flex-col gap-2 last:flex-none" aria-current={active ? "step" : undefined}>
            <div className="flex items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-300",
                  done && "bg-accent text-accent-foreground",
                  active && "border-2 border-accent text-foreground shadow-[0_0_0_5px_var(--kn-ring)]",
                  !done && !active && "border-2 border-border-strong text-subtle",
                )}
              >
                {done ? <CheckIcon size={14} strokeWidth={3} /> : i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full bg-accent transition-[width] duration-500 ease-kn-out"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </span>
              ) : null}
            </div>
            <span className={cn("text-xs", active ? "font-medium text-foreground" : "text-subtle")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
