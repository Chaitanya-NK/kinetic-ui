"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

type Op = { type: "same" | "add" | "del"; text: string; a?: number; b?: number };

/** Line diff using longest-common-subsequence. Fine for files up to a few thousand lines. */
export function diffLines(before: string, after: string): Op[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i]![j] = a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
  const out: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) out.push({ type: "same", text: a[i]!, a: ++i, b: ++j });
    else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) out.push({ type: "del", text: a[i]!, a: ++i });
    else out.push({ type: "add", text: b[j]!, b: ++j });
  }
  while (i < n) out.push({ type: "del", text: a[i]!, a: ++i });
  while (j < m) out.push({ type: "add", text: b[j]!, b: ++j });
  return out;
}

export type DiffViewerProps = {
  before: string;
  after: string;
  filename?: string;
  /** unified: one column. split: side by side. */
  view?: "unified" | "split";
  className?: string;
};

const rowTone = { same: "", add: "bg-success-soft", del: "bg-danger-soft" };
const sign = { same: " ", add: "+", del: "−" };

/** Code diff with unified and split views and +/- stats. */
export function DiffViewer({ before, after, filename, view: initialView = "unified", className }: DiffViewerProps) {
  const ops = React.useMemo(() => diffLines(before, after), [before, after]);
  const [view, setView] = React.useState(initialView);
  const adds = ops.filter((o) => o.type === "add").length;
  const dels = ops.filter((o) => o.type === "del").length;

  const split = React.useMemo(() => {
    const rows: [Op | null, Op | null][] = [];
    for (let k = 0; k < ops.length; ) {
      if (ops[k]!.type === "same") {
        rows.push([ops[k]!, ops[k]!]);
        k++;
        continue;
      }
      const dl: Op[] = [];
      const ad: Op[] = [];
      while (k < ops.length && ops[k]!.type === "del") dl.push(ops[k++]!);
      while (k < ops.length && ops[k]!.type === "add") ad.push(ops[k++]!);
      for (let r = 0; r < Math.max(dl.length, ad.length); r++) rows.push([dl[r] ?? null, ad[r] ?? null]);
    }
    return rows;
  }, [ops]);

  const cell = (o: Op | null, side: "a" | "b") => (
    <>
      <td className="w-10 select-none border-r border-border px-2 text-right text-subtle">{o ? o[side] : ""}</td>
      <td className={cn("whitespace-pre px-3", o && o.type !== "same" && rowTone[o.type], !o && "bg-surface-raised/40")}>
        {o ? (
          <>
            <span className="mr-2 select-none text-subtle">{sign[o.type]}</span>
            {o.text}
          </>
        ) : null}
      </td>
    </>
  );

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm">
        {filename ? <span className="font-mono text-xs text-foreground">{filename}</span> : null}
        <span className="font-mono text-xs text-success">+{adds}</span>
        <span className="font-mono text-xs text-danger">−{dels}</span>
        <div className="ml-auto flex rounded-lg bg-surface-raised p-0.5 text-xs">
          {(["unified", "split"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn("rounded-md px-2.5 py-1 capitalize", view === v ? "bg-surface-overlay text-foreground" : "text-subtle")}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12.5px] leading-6">
          <tbody>
            {view === "unified"
              ? ops.map((o, k) => (
                  <tr key={k} className={rowTone[o.type]}>
                    <td className="w-10 select-none px-2 text-right text-subtle">{o.a ?? ""}</td>
                    <td className="w-10 select-none border-r border-border px-2 text-right text-subtle">{o.b ?? ""}</td>
                    <td className="whitespace-pre px-3">
                      <span className={cn("mr-2 select-none", o.type === "add" ? "text-success" : o.type === "del" ? "text-danger" : "text-subtle")}>{sign[o.type]}</span>
                      {o.text}
                    </td>
                  </tr>
                ))
              : split.map(([l, r], k) => (
                  <tr key={k}>
                    {cell(l, "a")}
                    {cell(r, "b")}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
