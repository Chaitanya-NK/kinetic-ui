"use client";

import * as React from "react";
import { HoverCard as HoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

export type Source = { id: string | number; title: string; url: string; snippet?: string; favicon?: string };

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function Favicon({ source, className }: { source: Source; className?: string }) {
  const h = host(source.url);
  return source.favicon ? (
    <img src={source.favicon} alt="" className={cn("size-4 rounded-sm", className)} />
  ) : (
    <span className={cn("flex size-4 items-center justify-center rounded-sm bg-surface-overlay font-mono text-[9px] font-bold uppercase text-muted", className)}>{h[0]}</span>
  );
}

/** Inline numbered citation that previews its source on hover. */
export function Citation({ source, index }: { source: Source; index: number }) {
  return (
    <HoverPrimitive.Root openDelay={150} closeDelay={100}>
      <HoverPrimitive.Trigger asChild>
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="mx-0.5 inline-flex h-[18px] min-w-[18px] -translate-y-0.5 items-center justify-center rounded-md bg-surface-overlay px-1 align-middle font-mono text-[10px] font-semibold text-muted no-underline transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {index}
        </a>
      </HoverPrimitive.Trigger>
      <HoverPrimitive.Portal>
        <HoverPrimitive.Content side="top" sideOffset={6} className="z-50 w-72 rounded-xl border border-border-strong bg-surface-raised p-3 text-sm shadow-overlay data-[state=open]:animate-[kn-pop_0.15s_var(--ease-kn-out)]">
          <div className="flex items-center gap-2 text-xs text-subtle">
            <Favicon source={source} />
            {host(source.url)}
          </div>
          <div className="mt-1.5 font-medium leading-snug text-foreground">{source.title}</div>
          {source.snippet ? <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted">{source.snippet}</p> : null}
        </HoverPrimitive.Content>
      </HoverPrimitive.Portal>
    </HoverPrimitive.Root>
  );
}

/** Row of source chips shown under an answer. Collapses extras into "+N". */
export function Sources({ sources, max = 4, className }: { sources: Source[]; max?: number; className?: string }) {
  const [all, setAll] = React.useState(false);
  const shown = all ? sources : sources.slice(0, max);
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((s, i) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="flex w-44 flex-col gap-1.5 rounded-xl border border-border bg-surface p-2.5 text-xs transition-colors hover:border-border-strong hover:bg-surface-raised"
        >
          <span className="line-clamp-2 font-medium leading-snug text-foreground">{s.title}</span>
          <span className="mt-auto flex items-center gap-1.5 text-subtle">
            <Favicon source={s} />
            <span className="truncate">{host(s.url)}</span>
            <span className="ml-auto font-mono">{i + 1}</span>
          </span>
        </a>
      ))}
      {!all && sources.length > max ? (
        <button type="button" onClick={() => setAll(true)} className="flex w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-xs text-muted hover:text-foreground">
          <span className="flex -space-x-1">
            {sources.slice(max, max + 3).map((s) => (
              <Favicon key={s.id} source={s} className="ring-2 ring-background" />
            ))}
          </span>
          +{sources.length - max} more
        </button>
      ) : null}
    </div>
  );
}
