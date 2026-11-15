"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type TocHeading = { id: string; label: string; level?: 2 | 3 };

export type TableOfContentsProps = {
  headings: TocHeading[];
  title?: string;
  /** Distance from the top (px) at which a heading counts as current. */
  offset?: number;
  className?: string;
};

/** "On this page" list that highlights the section you're reading. */
export function TableOfContents({ headings, title = "On this page", offset = 120, className }: TableOfContentsProps) {
  const [active, setActive] = React.useState(headings[0]?.id);

  React.useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const onScroll = () => {
      let current = els[0]!.id;
      for (const el of els) if (el.getBoundingClientRect().top - offset <= 0) current = el.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings, offset]);

  return (
    <nav aria-label={title} className={cn("flex flex-col text-sm", className)}>
      <span className="pb-3 font-mono text-[10px] uppercase tracking-wider text-subtle">{title}</span>
      <ul className="flex flex-col border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 transition-colors",
                h.level === 3 ? "pl-7" : "pl-4",
                active === h.id ? "border-accent font-medium text-foreground" : "border-transparent text-muted hover:text-foreground",
              )}
            >
              {h.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
