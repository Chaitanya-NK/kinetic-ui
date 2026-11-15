"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@kineticui/core";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-kn-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground font-semibold hover:brightness-105",
        secondary: "bg-foreground text-background font-semibold hover:opacity-90",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-raised",
        ghost: "bg-transparent text-muted hover:bg-surface-raised hover:text-foreground",
        soft: "bg-accent-soft text-accent-soft-foreground hover:brightness-110",
        destructive: "border border-danger/40 bg-danger-soft text-danger hover:bg-danger/15",
        link: "h-auto px-0 text-accent underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        sm: "h-8 rounded-[9px] px-3 text-xs",
        md: "h-11 rounded-xl px-5 text-sm",
        lg: "h-14 rounded-2xl px-7 text-base",
        icon: "size-11 rounded-xl",
        "icon-sm": "size-8 rounded-[9px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render as the child element (e.g. a Next.js <Link>). */
    asChild?: boolean;
    /** Shows a spinner and disables the button. */
    loading?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Spinner size="sm" className="text-current" /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
