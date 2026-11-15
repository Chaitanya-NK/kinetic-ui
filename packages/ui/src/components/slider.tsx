"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  /** Show the value in a bubble above each thumb. */
  showValue?: boolean;
  formatValue?: (value: number) => string;
};

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, showValue, formatValue = String, value, defaultValue, onValueChange, ...props }, ref) => {
    const [internal, setInternal] = React.useState<number[]>(defaultValue ?? [0]);
    const current = value ?? internal;
    return (
      <SliderPrimitive.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(v) => {
          setInternal(v);
          onValueChange?.(v);
        }}
        className={cn("relative flex h-5 w-full touch-none select-none items-center", showValue && "mt-8", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-accent" />
        </SliderPrimitive.Track>
        {current.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="relative block size-5 rounded-full bg-foreground shadow-[0_0_0_5px_var(--kn-ring)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          >
            {showValue ? (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 font-mono text-xs font-semibold text-background">
                {formatValue(v)}
              </span>
            ) : null}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = "Slider";
