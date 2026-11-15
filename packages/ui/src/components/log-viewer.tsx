"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { SearchIcon } from "@kineticui/icons";

export type LogLine = { time?: string; level?: "debug" | "info" | "warn" | "error" | "success"; message: string; source?: string };

export type LogViewerProps = {
  lines: LogLine[];
  /** Keep scrolled to the newest line unless the user scrolls up. */
  follow?: boolean;
  height?: number;
  title?: string;
  className?: string;
};

const levelStyle = {
  debug: "text-subtle",
  info: "text-[#7C8CFF]",
  warn: "text-warning",
  error: "text-danger",
  success: "text-success",
};

/** Terminal-style log stream with level filters, search and follow mode. */
export function LogViewer({ lines, follow = true, height = 320, title = "Logs", className }: LogViewerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [levels, setLevels] = React.useState<Set<string>>(new Set(["debug", "info", "warn", "error", "success"]));
  const [pinned, setPinned] = React.useState(follow);

  const shown = lines.filter((l) => levels.has(l.level ?? "info") && (!query || l.message.toLowerCase().includes(query.toLowerCase())));

  React.useEffect(() => {
    if (pinned && ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [shown.length, pinned]);

  const counts = lines.reduce<Record<string, number>>((a, l) => ((a[l.level ?? "info"] = (a[l.level ?? "info"] ?? 0) + 1), a), {});

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-[#0b0c0e] text-[#E8E8E3]", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1.5 pr-2">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="font-mono text-xs text-white/60">{title}</span>
        <div className="ml-auto flex items-center gap-1">
          {(["info", "warn", "error"] as const).map((lv) => (
            <button
              key={lv}
              type="button"
              aria-pressed={levels.has(lv)}
              onClick={() =>
                setLevels((s) => {
                  const n = new Set(s);
                  if (n.has(lv)) n.delete(lv);
                  else n.add(lv);
                  return n;
                })
              }
              className={cn("rounded-md px-2 py-0.5 font-mono text-[11px] transition-opacity", levelStyle[lv], levels.has(lv) ? "bg-white/10" : "opacity-40")}
            >
              {lv} {counts[lv] ?? 0}
            </button>
          ))}
          <label className="ml-1 flex h-7 items-center gap-1.5 rounded-md bg-white/5 px-2">
            <SearchIcon size={12} className="text-white/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter" aria-label="Filter logs" className="w-24 bg-transparent font-mono text-[11px] outline-none placeholder:text-white/30" />
          </label>
        </div>
      </div>
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        style={{ height }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
        }}
        className="overflow-y-auto px-3 py-2 font-mono text-[12px] leading-[22px]"
      >
        {shown.map((l, i) => (
          <div key={i} className="flex gap-3 hover:bg-white/5">
            {l.time ? <span className="shrink-0 text-white/30">{l.time}</span> : null}
            <span className={cn("w-12 shrink-0 uppercase", levelStyle[l.level ?? "info"])}>{l.level ?? "info"}</span>
            {l.source ? <span className="shrink-0 text-white/40">[{l.source}]</span> : null}
            <span className="whitespace-pre-wrap break-all">
              {query
                ? l.message.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i")).map((part, j) =>
                    j % 2 ? <mark key={j} className="rounded-sm bg-accent px-0.5 text-accent-foreground">{part}</mark> : part,
                  )
                : l.message}
            </span>
          </div>
        ))}
        <span className="inline-block h-3.5 w-2 translate-y-0.5 bg-accent animate-kn-caret" />
      </div>
      {!pinned ? (
        <button type="button" onClick={() => setPinned(true)} className="border-t border-white/10 py-1.5 text-center font-mono text-[11px] text-accent hover:bg-white/5">
          ↓ Jump to latest
        </button>
      ) : null}
    </div>
  );
}
