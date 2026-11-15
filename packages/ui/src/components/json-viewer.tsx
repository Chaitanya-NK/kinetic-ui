"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { ChevronRightIcon } from "@kineticui/icons";

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export type JsonViewerProps = {
  data: unknown;
  /** Levels expanded on first render. */
  defaultDepth?: number;
  /** Root label. */
  name?: string;
  className?: string;
};

function Value({ v }: { v: Json }) {
  if (v === null) return <span className="text-subtle">null</span>;
  if (typeof v === "string") return <span className="text-[#6EE7A0]">&quot;{v}&quot;</span>;
  if (typeof v === "number") return <span className="text-[#F4A86A]">{v}</span>;
  if (typeof v === "boolean") return <span className="text-[#7C8CFF]">{String(v)}</span>;
  return null;
}

function Node({ k, v, depth, defaultDepth, last, path }: { k?: string; v: Json; depth: number; defaultDepth: number; last: boolean; path: string }) {
  const isObj = v !== null && typeof v === "object";
  const [open, setOpen] = React.useState(depth < defaultDepth);
  const comma = last ? "" : ",";
  const key = k !== undefined ? (
    <>
      <span className="text-accent">{/^\d+$/.test(k) ? k : `"${k}"`}</span>
      <span className="text-subtle">: </span>
    </>
  ) : null;

  if (!isObj)
    return (
      <div style={{ paddingLeft: depth * 16 + 16 }} className="group flex">
        {key}
        <Value v={v} />
        <span className="text-subtle">{comma}</span>
        <button type="button" title={`Copy ${path}`} onClick={() => navigator.clipboard?.writeText(path)} className="ml-3 hidden text-[10px] text-subtle hover:text-foreground group-hover:inline">
          copy path
        </button>
      </div>
    );

  const arr = Array.isArray(v);
  const entries = arr ? (v as Json[]).map((x, i) => [String(i), x] as const) : Object.entries(v as Record<string, Json>);
  const [o, c] = arr ? ["[", "]"] : ["{", "}"];
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} style={{ paddingLeft: depth * 16 }} className="flex w-full items-center text-left hover:bg-surface-raised/60">
        <ChevronRightIcon size={12} className={cn("mr-1 shrink-0 text-subtle transition-transform", open && "rotate-90")} />
        {key}
        <span className="text-muted">{o}</span>
        {open ? null : (
          <>
            <span className="mx-1 rounded bg-surface-overlay px-1 text-[10px] text-subtle">{entries.length} {arr ? "items" : "keys"}</span>
            <span className="text-muted">{c}</span>
            <span className="text-subtle">{comma}</span>
          </>
        )}
      </button>
      {open ? (
        <>
          {entries.map(([ck, cv], i) => (
            <Node key={ck} k={ck} v={cv} depth={depth + 1} defaultDepth={defaultDepth} last={i === entries.length - 1} path={arr ? `${path}[${ck}]` : `${path}.${ck}`} />
          ))}
          <div style={{ paddingLeft: depth * 16 + 16 }}>
            <span className="text-muted">{c}</span>
            <span className="text-subtle">{comma}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Collapsible, syntax-coloured JSON tree with copy-path. */
export function JsonViewer({ data, defaultDepth = 2, name = "$", className }: JsonViewerProps) {
  return (
    <div className={cn("overflow-auto rounded-2xl border border-border bg-surface p-4 font-mono text-[12.5px] leading-6", className)}>
      <Node v={data as Json} depth={0} defaultDepth={defaultDepth} last path={name} />
    </div>
  );
}
