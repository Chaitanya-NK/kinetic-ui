"use client";

import * as React from "react";
import { Menubar as MenubarPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronRightIcon } from "@kineticui/icons";

const panel =
  "z-50 min-w-52 rounded-xl border border-border-strong bg-surface-raised p-1.5 text-sm text-foreground shadow-overlay origin-[var(--radix-menubar-content-transform-origin)] data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]";
const item =
  "relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 outline-none transition-colors data-[highlighted]:bg-surface-overlay data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted";

/** Desktop-style application menu bar (File, Edit, View…). Arrow keys move between menus. */
export const Menubar = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Root ref={ref} className={cn("inline-flex h-10 items-center gap-0.5 rounded-xl border border-border bg-surface p-1", className)} {...props} />
  ),
);
Menubar.displayName = "Menubar";

export const MenubarMenu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

export const MenubarTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-8 select-none items-center rounded-lg px-3 text-sm font-medium text-muted outline-none transition-colors hover:text-foreground focus-visible:bg-surface-overlay data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  ),
);
MenubarTrigger.displayName = "MenubarTrigger";

export const MenubarContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Content>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>>(
  ({ className, align = "start", sideOffset = 8, ...props }, ref) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn(panel, className)} {...props} />
    </MenubarPrimitive.Portal>
  ),
);
MenubarContent.displayName = "MenubarContent";

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & { shortcut?: string; destructive?: boolean }
>(({ className, shortcut, destructive, children, ...props }, ref) => (
  <MenubarPrimitive.Item ref={ref} className={cn(item, destructive && "text-danger [&_svg]:text-danger", className)} {...props}>
    {children}
    {shortcut ? <span className="ml-auto pl-6 font-mono text-[11px] text-subtle">{shortcut}</span> : null}
  </MenubarPrimitive.Item>
));
MenubarItem.displayName = "MenubarItem";

export const MenubarCheckboxItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>>(
  ({ className, children, ...props }, ref) => (
    <MenubarPrimitive.CheckboxItem ref={ref} className={cn(item, "pl-8", className)} {...props}>
      <span className="absolute left-2.5 flex size-4 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon size={13} strokeWidth={3} className="!text-accent" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  ),
);
MenubarCheckboxItem.displayName = "MenubarCheckboxItem";

export const MenubarRadioItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>>(
  ({ className, children, ...props }, ref) => (
    <MenubarPrimitive.RadioItem ref={ref} className={cn(item, "pl-8", className)} {...props}>
      <span className="absolute left-3 flex size-2 items-center justify-center">
        <MenubarPrimitive.ItemIndicator className="size-2 rounded-full bg-accent" />
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  ),
);
MenubarRadioItem.displayName = "MenubarRadioItem";

export function MenubarLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle", className)} {...props} />;
}

export function MenubarSeparator({ className }: { className?: string }) {
  return <MenubarPrimitive.Separator className={cn("mx-1 my-1.5 h-px bg-border", className)} />;
}

export const MenubarSubTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger>>(
  ({ className, children, ...props }, ref) => (
    <MenubarPrimitive.SubTrigger ref={ref} className={cn(item, "data-[state=open]:bg-surface-overlay", className)} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenubarPrimitive.SubTrigger>
  ),
);
MenubarSubTrigger.displayName = "MenubarSubTrigger";

export const MenubarSubContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>>(
  ({ className, ...props }, ref) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent ref={ref} className={cn(panel, className)} {...props} />
    </MenubarPrimitive.Portal>
  ),
);
MenubarSubContent.displayName = "MenubarSubContent";
