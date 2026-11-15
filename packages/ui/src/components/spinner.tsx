import * as React from "react";
import { cn } from "@kineticui/core";

const sizes = { sm: "size-3.5 border-2", md: "size-6 border-[3px]", lg: "size-9 border-[3px]" };

export type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: keyof typeof sizes;
  /** Accessible label read by screen readers. */
  label?: string;
};

/** A ring spinner. Inherits colour from `currentColor` for the active arc. */
export function Spinner({ size = "md", label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      data-kn-motion
      className={cn(
        "inline-block animate-kn-spin rounded-full border-current/25 border-t-current text-accent",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

/** Three bouncing dots — good for "typing…" states. */
export function DotsLoader({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex items-center gap-1", className)}>
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          data-kn-motion
          className="size-1.5 animate-kn-pulse rounded-full bg-current"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}
