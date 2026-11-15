import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@kineticui/core";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
  {
    variants: {
      variant: {
        solid: "bg-accent text-accent-foreground font-semibold",
        soft: "bg-accent-soft text-accent-soft-foreground",
        outline: "border border-border-strong text-foreground",
        neutral: "bg-surface-overlay text-foreground border border-border",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    /** Show a status dot. `pulse` animates it. */
    dot?: boolean | "pulse";
  };

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot ? (
        <span className="relative flex size-1.5">
          {dot === "pulse" ? (
            <span data-kn-motion className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
          ) : null}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

/** Keyboard key, e.g. <Kbd>⌘</Kbd><Kbd>K</Kbd>. */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border-strong border-b-2 px-1.5 font-mono text-[11px] font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
