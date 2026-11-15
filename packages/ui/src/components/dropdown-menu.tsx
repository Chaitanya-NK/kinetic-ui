"use client";

import * as React from "react";
import { DropdownMenu as MenuPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronRightIcon } from "@kineticui/icons";

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuSub = MenuPrimitive.Sub;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

const panel =
  "z-50 min-w-48 rounded-xl border border-border-strong bg-surface-raised p-1.5 text-sm text-foreground shadow-overlay origin-[var(--radix-dropdown-menu-content-transform-origin)] data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]";
const item =
  "relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none transition-colors data-[highlighted]:bg-surface-overlay data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted";

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn(panel, className)} {...props} />
  </MenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> & { shortcut?: string; destructive?: boolean }
>(({ className, shortcut, destructive, children, ...props }, ref) => (
  <MenuPrimitive.Item
    ref={ref}
    className={cn(item, destructive && "text-danger [&_svg]:text-danger", className)}
    {...props}
  >
    {children}
    {shortcut ? <span className="ml-auto font-mono text-[11px] text-subtle">{shortcut}</span> : null}
  </MenuPrimitive.Item>
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <MenuPrimitive.CheckboxItem ref={ref} className={cn(item, "pl-8", className)} {...props}>
    <span className="absolute left-2.5 flex size-4 items-center justify-center rounded-[5px] border border-border-strong data-[state=checked]:border-accent">
      <MenuPrimitive.ItemIndicator className="flex size-4 items-center justify-center rounded-[5px] bg-accent">
        <CheckIcon size={11} strokeWidth={3} className="!size-3 !text-accent-foreground" />
      </MenuPrimitive.ItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenuPrimitive.RadioItem ref={ref} className={cn(item, "pr-8", className)} {...props}>
    {children}
    <MenuPrimitive.ItemIndicator className="absolute right-3 size-2 rounded-full bg-accent" />
  </MenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle", className)} {...props} />;
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <MenuPrimitive.Separator className={cn("mx-1 my-1.5 h-px bg-border", className)} />;
}

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <MenuPrimitive.SubTrigger ref={ref} className={cn(item, "data-[state=open]:bg-surface-overlay", className)} {...props}>
    {children}
    <ChevronRightIcon className="ml-auto" />
  </MenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.SubContent ref={ref} className={cn(panel, className)} {...props} />
  </MenuPrimitive.Portal>
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
