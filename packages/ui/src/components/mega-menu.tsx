"use client";

import * as React from "react";
import { NavigationMenu as NavPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { ChevronDownIcon } from "@kineticui/icons";

export type MegaMenuLink = { title: string; description?: string; href: string; icon?: React.ReactNode };
export type MegaMenuItem = {
  label: string;
  href?: string;
  /** Columns of links shown in the panel. */
  columns?: { heading: string; links: MegaMenuLink[] }[];
  /** Highlight card on the right of the panel. */
  feature?: React.ReactNode;
};

export type MegaMenuProps = { items: MegaMenuItem[]; className?: string };

/** Website navigation with large dropdown panels. Keyboard and screen-reader friendly. */
export function MegaMenu({ items, className }: MegaMenuProps) {
  return (
    <NavPrimitive.Root className={cn("relative z-30 h-fit self-start", className)}>
      <NavPrimitive.List className="flex items-center gap-1">
        {items.map((item) =>
          item.columns ? (
            <NavPrimitive.Item key={item.label}>
              <NavPrimitive.Trigger className="group flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground data-[state=open]:text-foreground">
                {item.label}
                <ChevronDownIcon size={13} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </NavPrimitive.Trigger>
              <NavPrimitive.Content className="absolute left-0 top-0 w-full data-[motion=from-end]:animate-[kn-fade_0.2s] data-[motion=from-start]:animate-[kn-fade_0.2s]">
                <div className="grid gap-6 p-5" style={{ gridTemplateColumns: `repeat(${item.columns.length}, minmax(0,1fr))${item.feature ? " minmax(0,1.1fr)" : ""}` }}>
                  {item.columns.map((col) => (
                    <div key={col.heading} className="flex flex-col gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">{col.heading}</span>
                      {col.links.map((l) => (
                        <NavPrimitive.Link key={l.href} href={l.href} className="flex gap-3 rounded-xl p-2 outline-none transition-colors hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-foreground">
                          {l.icon ? <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent [&_svg]:size-4">{l.icon}</span> : null}
                          <span className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-foreground">{l.title}</span>
                            {l.description ? <span className="text-xs text-subtle">{l.description}</span> : null}
                          </span>
                        </NavPrimitive.Link>
                      ))}
                    </div>
                  ))}
                  {item.feature ? <div>{item.feature}</div> : null}
                </div>
              </NavPrimitive.Content>
            </NavPrimitive.Item>
          ) : (
            <NavPrimitive.Item key={item.label}>
              <NavPrimitive.Link href={item.href} className="flex h-9 items-center rounded-lg px-3 text-sm text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground">
                {item.label}
              </NavPrimitive.Link>
            </NavPrimitive.Item>
          ),
        )}
      </NavPrimitive.List>
      <div className="absolute left-0 top-full flex w-full justify-start pt-2">
        <NavPrimitive.Viewport className="relative h-[var(--radix-navigation-menu-viewport-height)] w-[min(720px,calc(100vw-2rem))] shrink-0 origin-top-left overflow-hidden rounded-2xl border border-border-strong bg-surface-raised shadow-overlay transition-[height] duration-300 data-[state=open]:animate-[kn-pop_0.2s_var(--ease-kn-out)]" />
      </div>
    </NavPrimitive.Root>
  );
}
