"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { XIcon } from "@kineticui/icons";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-xl", xl: "max-w-3xl" };

export type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: keyof typeof sizes;
  /** Hide the × button in the corner. */
  hideClose?: boolean;
};

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = "md", hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.2s_ease-out] data-[state=closed]:animate-[kn-fade_0.15s_ease-in_reverse]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[20px] border border-border-strong bg-surface-raised p-6 text-foreground shadow-overlay",
        "data-[state=open]:animate-[kn-dialog-in_0.25s_var(--ease-kn-spring)] data-[state=closed]:animate-[kn-dialog-out_0.15s_ease-in]",
        "focus:outline-none",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
      {hideClose ? null : (
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg bg-surface-overlay text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <XIcon size={15} />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-xl font-semibold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm leading-relaxed text-muted", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

/** A slide-in panel from the right (or left). Built on Dialog. */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "right" | "left" | "bottom" }
>(({ className, children, side = "right", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-[kn-fade_0.2s_ease-out]" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-4 border-border-strong bg-surface-raised p-6 text-foreground shadow-overlay focus:outline-none",
        side === "right" && "inset-y-0 right-0 w-[min(400px,90vw)] border-l data-[state=open]:animate-[kn-slide-left_0.3s_var(--ease-kn-out)]",
        side === "left" && "inset-y-0 left-0 w-[min(400px,90vw)] border-r data-[state=open]:animate-[kn-slide-right_0.3s_var(--ease-kn-out)]",
        side === "bottom" && "inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl border-t data-[state=open]:animate-[kn-slide-up_0.3s_var(--ease-kn-out)]",
        className,
      )}
      {...props}
    >
      {side === "bottom" ? <span aria-hidden className="mx-auto -mt-2 h-1 w-10 rounded-full bg-border-strong" /> : null}
      {children}
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-overlay hover:text-foreground"
      >
        <XIcon size={15} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";
