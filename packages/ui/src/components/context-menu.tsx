"use client";

import * as React from "react";
import { ContextMenu as CtxPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { ChevronRightIcon } from "@kineticui/icons";

export const ContextMenu = CtxPrimitive.Root;
export const ContextMenuTrigger = CtxPrimitive.Trigger;
export const ContextMenuSub = CtxPrimitive.Sub;

const panel =
  "z-50 min-w-52 rounded-xl border border-border-strong bg-surface-raised p-1.5 text-sm text-foreground shadow-overlay data-[state=open]:animate-[kn-pop_0.14s_var(--ease-kn-out)]";
const item =
  "relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none data-[highlighted]:bg-surface-overlay data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted";

export const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof CtxPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CtxPrimitive.Content>
>(({ className, ...props }, ref) => (
  <CtxPrimitive.Portal>
    <CtxPrimitive.Content ref={ref} className={cn(panel, className)} {...props} />
  </CtxPrimitive.Portal>
));
ContextMenuContent.displayName = "ContextMenuContent";

export const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof CtxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CtxPrimitive.Item> & { shortcut?: string; destructive?: boolean }
>(({ className, shortcut, destructive, children, ...props }, ref) => (
  <CtxPrimitive.Item ref={ref} className={cn(item, destructive && "text-danger [&_svg]:text-danger", className)} {...props}>
    {children}
    {shortcut ? <span className="ml-auto font-mono text-[11px] text-subtle">{shortcut}</span> : null}
  </CtxPrimitive.Item>
));
ContextMenuItem.displayName = "ContextMenuItem";

export function ContextMenuSeparator() {
  return <CtxPrimitive.Separator className="mx-1 my-1.5 h-px bg-border" />;
}

export function ContextMenuLabel({ children }: { children: React.ReactNode }) {
  return <CtxPrimitive.Label className="px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{children}</CtxPrimitive.Label>;
}

export const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof CtxPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof CtxPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <CtxPrimitive.SubTrigger ref={ref} className={cn(item, "data-[state=open]:bg-surface-overlay", className)} {...props}>
    {children}
    <ChevronRightIcon className="ml-auto" />
  </CtxPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof CtxPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof CtxPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <CtxPrimitive.Portal>
    <CtxPrimitive.SubContent ref={ref} className={cn(panel, className)} {...props} />
  </CtxPrimitive.Portal>
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";
