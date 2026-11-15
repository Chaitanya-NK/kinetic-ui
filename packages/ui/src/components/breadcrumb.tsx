import * as React from "react";
import { cn } from "@kineticui/core";
import { ChevronRightIcon } from "@kineticui/icons";

export type BreadcrumbItem = { label: React.ReactNode; href?: string };

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  /** "/" or "chevron". */
  separator?: "slash" | "chevron";
  /** Collapse middle items into "…" when there are more than this many. */
  maxItems?: number;
  className?: string;
  /** Custom link renderer, e.g. Next.js Link. */
  renderLink?: (item: BreadcrumbItem, className: string) => React.ReactNode;
};

export function Breadcrumb({ items, separator = "chevron", maxItems = 5, className, renderLink }: BreadcrumbProps) {
  const visible: (BreadcrumbItem | "…")[] =
    items.length > maxItems ? [items[0]!, "…", ...items.slice(-(maxItems - 2))] : items;
  const linkClass = "text-muted transition-colors hover:text-foreground";
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {visible.map((item, i) => {
          const last = i === visible.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {item === "…" ? (
                <span className="text-subtle">…</span>
              ) : last ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : item.href ? (
                renderLink ? (
                  renderLink(item, linkClass)
                ) : (
                  <a href={item.href} className={linkClass}>
                    {item.label}
                  </a>
                )
              ) : (
                <span className="text-muted">{item.label}</span>
              )}
              {!last ? (
                separator === "slash" ? (
                  <span aria-hidden className="text-border-strong">/</span>
                ) : (
                  <ChevronRightIcon aria-hidden size={14} className="text-subtle" />
                )
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
