import * as React from "react";
import { cn } from "@kineticui/core";

export type TimelineItem = {
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: string;
  icon?: React.ReactNode;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  /** Extra content such as a quote, diff or attachment. */
  content?: React.ReactNode;
};

const tones = {
  default: "bg-surface-overlay text-muted",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

/** Vertical activity timeline with icons, tones and rich content. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col", className)}>
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-4 pb-7 last:pb-0">
          {i < items.length - 1 ? <span className="absolute left-[15px] top-9 bottom-1 w-px bg-border" aria-hidden /> : null}
          <span className={cn("relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background [&_svg]:size-3.5", tones[it.tone ?? "default"])}>
            {it.icon ?? <span className="size-2 rounded-full bg-current" />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-3 text-sm">
              <span className="font-medium text-foreground">{it.title}</span>
              {it.time ? <span className="font-mono text-[11px] text-subtle">{it.time}</span> : null}
            </div>
            {it.description ? <p className="text-sm text-muted">{it.description}</p> : null}
            {it.content ? <div className="mt-2">{it.content}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
