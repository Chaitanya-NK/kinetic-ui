"use client";

import { Button, Navbar } from "@kineticui/ui";

export const siteLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Help", href: "/help" },
  { label: "Changelog", href: "/changelog" },
];

/** Shared navbar for the docs pages. Pass `active` and `onNavigate` to drive it without routing. */
export function SiteNav({ active, onNavigate }: { active?: string; onNavigate?: (href: string) => void }) {
  return (
    <Navbar
      hideOnScroll={false}
      logo={
        <span className="flex items-center gap-2 font-display font-semibold">
          <span className="size-6 rounded-md bg-accent" /> Northwind <span className="font-mono text-xs font-normal text-subtle">docs</span>
        </span>
      }
      items={siteLinks.map((l) => ({ ...l, active: active === l.href }))}
      renderLink={
        onNavigate
          ? (item, { className, children }) => (
              <button type="button" className={className} onClick={() => onNavigate(item.href)}>{children}</button>
            )
          : undefined
      }
      actions={<Button size="sm" variant="outline" className="rounded-full">GitHub</Button>}
    />
  );
}
