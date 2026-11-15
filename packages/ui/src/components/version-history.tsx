"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type Version = {
  id: string;
  /** e.g. "Today, 14:02". */
  time: string;
  author: string;
  color?: string;
  /** Named versions are pinned and shown bold. */
  label?: string;
  changes?: string;
  current?: boolean;
};

export type VersionHistoryProps = {
  versions: Version[];
  selected?: string;
  onSelect?: (v: Version) => void;
  onRestore?: (v: Version) => void;
  /** Called with two version ids when the user picks two to compare. */
  onCompare?: (a: string, b: string) => void;
  className?: string;
};

/** Document history panel with named versions, restore and two-way compare. */
export function VersionHistory({ versions, selected, onSelect, onRestore, onCompare, className }: VersionHistoryProps) {
  const [compare, setCompare] = React.useState<string[]>([]);
  const [onlyNamed, setOnlyNamed] = React.useState(false);
  const list = onlyNamed ? versions.filter((v) => v.label || v.current) : versions;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">Version history</span>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-muted">
          <input type="checkbox" checked={onlyNamed} onChange={(e) => setOnlyNamed(e.target.checked)} className="accent-[var(--kn-accent)]" />
          Named only
        </label>
      </div>
      <ol className="relative flex flex-col py-2">
        <span className="absolute bottom-4 left-[27px] top-4 w-px bg-border" aria-hidden />
        {list.map((v) => {
          const isSel = selected === v.id;
          const inCompare = compare.includes(v.id);
          return (
            <li key={v.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelect?.(v)}
                className={cn("flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-raised", isSel && "bg-accent-soft/50")}
              >
                <span
                  className={cn("relative z-[1] mt-1 size-[11px] shrink-0 rounded-full ring-4 ring-surface", v.label || v.current ? "bg-accent" : "bg-border-strong")}
                  style={v.color && !v.label && !v.current ? { background: v.color } : undefined}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("text-sm", v.label || v.current ? "font-semibold" : "text-foreground")}>
                    {v.current ? "Current version" : v.label ?? v.time}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-subtle">
                    {v.label || v.current ? <span>{v.time} ·</span> : null}
                    <span className="size-2 rounded-full" style={{ background: v.color ?? "var(--kn-muted)" }} />
                    {v.author}
                  </span>
                  {v.changes ? <span className="truncate text-xs text-muted">{v.changes}</span> : null}
                </span>
              </button>
              <div className={cn("absolute right-3 top-2.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100", (isSel || inCompare) && "opacity-100")}>
                {onCompare && !v.current ? (
                  <button
                    type="button"
                    aria-pressed={inCompare}
                    onClick={() => {
                      const next = inCompare ? compare.filter((x) => x !== v.id) : [...compare, v.id].slice(-2);
                      setCompare(next);
                      if (next.length === 2) onCompare(next[0]!, next[1]!);
                    }}
                    className={cn("h-6 rounded-md border px-2 text-[11px]", inCompare ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-muted hover:text-foreground")}
                  >
                    {inCompare ? "Comparing" : "Compare"}
                  </button>
                ) : null}
                {onRestore && !v.current ? (
                  <button type="button" onClick={() => onRestore(v)} className="h-6 rounded-md bg-accent px-2 text-[11px] font-semibold text-accent-foreground">
                    Restore
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
