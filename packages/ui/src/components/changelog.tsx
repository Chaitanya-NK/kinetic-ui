import * as React from "react";
import { cn } from "@kineticui/core";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  summary?: React.ReactNode;
  /** Visual, e.g. a screenshot. */
  media?: React.ReactNode;
  changes?: { type: "new" | "improved" | "fixed" | "removed"; text: React.ReactNode }[];
};

const typeStyle = {
  new: "bg-accent text-accent-foreground",
  improved: "bg-info-soft text-info",
  fixed: "bg-warning-soft text-warning",
  removed: "bg-danger-soft text-danger",
};

/** Release notes with sticky dates, version tags, media and typed change lists. */
export function Changelog({ entries, className }: { entries: ChangelogEntry[]; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {entries.map((e, i) => (
        <article key={e.version} className="grid gap-4 border-b border-border py-8 first:pt-0 last:border-0 md:grid-cols-[160px_1fr]">
          <div className="flex items-center gap-2 md:sticky md:top-20 md:flex-col md:items-start md:self-start">
            <time className="text-sm text-muted">{e.date}</time>
            <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[11px]", i === 0 ? "border-accent text-accent" : "border-border-strong text-subtle")}>v{e.version}</span>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-2xl font-semibold tracking-tight">{e.title}</h3>
            {e.summary ? <div className="text-[15px] leading-relaxed text-muted">{e.summary}</div> : null}
            {e.media ? <div className="overflow-hidden rounded-2xl border border-border">{e.media}</div> : null}
            {e.changes?.length ? (
              <ul className="flex flex-col gap-2.5">
                {e.changes.map((c, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <span className={cn("mt-0.5 w-[68px] shrink-0 rounded-md py-0.5 text-center font-mono text-[10px] font-semibold uppercase", typeStyle[c.type])}>{c.type}</span>
                    <span className="text-foreground/90">{c.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
