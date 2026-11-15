"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, id, ...props }, ref) => {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const control = (
    <SwitchPrimitive.Root
      ref={ref}
      id={inputId}
      className={cn(
        "inline-flex h-7 w-[46px] shrink-0 cursor-pointer items-center rounded-full bg-border p-[3px] transition-colors duration-200",
        "data-[state=checked]:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[22px] rounded-full bg-muted shadow-sm transition-transform duration-300 ease-kn-spring data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-accent-foreground" />
    </SwitchPrimitive.Root>
  );
  if (!label) return control;
  return (
    <div className="flex items-center justify-between gap-6">
      <label htmlFor={inputId} className="flex cursor-pointer flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="text-xs text-subtle">{description}</span> : null}
      </label>
      {control}
    </div>
  );
});
Switch.displayName = "Switch";
