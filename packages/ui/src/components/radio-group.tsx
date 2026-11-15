"use client";

import * as React from "react";
import { RadioGroup as RadioPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioPrimitive.Root ref={ref} className={cn("grid gap-2", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export type RadioProps = React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
};

export const Radio = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Item>, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex items-start gap-3">
        <RadioPrimitive.Item
          ref={ref}
          id={inputId}
          className={cn(
            "mt-0.5 size-5 shrink-0 rounded-full border-[1.5px] border-border-strong transition-[border-width,border-color] duration-200 ease-kn-spring",
            "data-[state=checked]:border-[6px] data-[state=checked]:border-accent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {label ? (
          <label htmlFor={inputId} className="flex cursor-pointer flex-col gap-0.5">
            <span className="text-sm text-foreground">{label}</span>
            {description ? <span className="text-xs text-subtle">{description}</span> : null}
          </label>
        ) : null}
      </div>
    );
  },
);
Radio.displayName = "Radio";

export type RadioCardProps = React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra content, e.g. a price, on the right. */
  aside?: React.ReactNode;
};

/** A whole card that acts as a radio option. */
export const RadioCard = React.forwardRef<React.ElementRef<typeof RadioPrimitive.Item>, RadioCardProps>(
  ({ className, title, description, aside, ...props }, ref) => (
    <RadioPrimitive.Item
      ref={ref}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors duration-150",
        "hover:border-border-strong data-[state=checked]:border-accent data-[state=checked]:bg-accent-soft/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      <span className="mt-0.5 size-5 shrink-0 rounded-full border-[1.5px] border-border-strong transition-all duration-200 ease-kn-spring group-data-[state=checked]:border-[6px] group-data-[state=checked]:border-accent" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {description ? <span className="text-xs text-subtle">{description}</span> : null}
      </span>
      {aside ? <span className="text-sm font-semibold text-foreground">{aside}</span> : null}
    </RadioPrimitive.Item>
  ),
);
RadioCard.displayName = "RadioCard";
