import * as React from "react";
import { cn } from "@kineticui/core";

export type ShinyTextProps = React.HTMLAttributes<HTMLSpanElement>;

/** A soft light sweep across text. */
export function ShinyText({ className, children, ...props }: ShinyTextProps) {
  return (
    <span
      data-kn-motion
      className={cn(
        "animate-kn-shine bg-[linear-gradient(110deg,var(--kn-subtle)_35%,var(--kn-foreground)_50%,var(--kn-subtle)_65%)] bg-[length:200%_100%] bg-clip-text text-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
