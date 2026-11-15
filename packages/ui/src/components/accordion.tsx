"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { PlusIcon } from "@kineticui/icons";

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
));
Accordion.displayName = "Accordion";

export type AccordionItemProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  title: React.ReactNode;
};

export const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, AccordionItemProps>(
  ({ className, title, children, ...props }, ref) => (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("overflow-hidden rounded-xl border border-border bg-background", className)}
      {...props}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground">
          {title}
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-overlay text-muted transition-[transform,background-color,color] duration-300 ease-kn-spring group-data-[state=open]:rotate-45 group-data-[state=open]:bg-accent group-data-[state=open]:text-accent-foreground">
            <PlusIcon size={14} strokeWidth={2.5} />
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden text-sm leading-relaxed text-muted data-[state=closed]:animate-[kn-accordion-up_0.2s_ease-out] data-[state=open]:animate-[kn-accordion-down_0.25s_var(--ease-kn-out)]">
        <div className="px-4 pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ),
);
AccordionItem.displayName = "AccordionItem";
