"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const box = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={inputId}
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-border-strong bg-transparent transition-colors duration-150",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-accent-foreground">
        {props.checked === "indeterminate" ? (
          <span className="block h-0.5 w-2.5 rounded-full bg-current" />
        ) : (
          <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
            <path
              d="M2.5 6.2l2.3 2.3 4.7-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="[stroke-dasharray:12] [stroke-dashoffset:0] motion-safe:animate-[kn-draw_0.25s_ease-out]"
            />
          </svg>
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  if (!label) return box;
  return (
    <div className="flex items-start gap-3">
      <div className="pt-0.5">{box}</div>
      <label htmlFor={inputId} className="flex cursor-pointer flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="text-xs leading-relaxed text-subtle">{description}</span> : null}
      </label>
    </div>
  );
});
Checkbox.displayName = "Checkbox";
