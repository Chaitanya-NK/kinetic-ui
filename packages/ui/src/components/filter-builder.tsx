"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { PlusIcon, XIcon } from "@kineticui/icons";

export type FilterField =
  | { key: string; label: string; type: "text" }
  | { key: string; label: string; type: "number" }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "date" };

export type FilterRule = { id: string; field: string; op: string; value: string };
export type FilterGroup = { join: "and" | "or"; rules: FilterRule[] };

const OPS: Record<FilterField["type"], { value: string; label: string }[]> = {
  text: [{ value: "contains", label: "contains" }, { value: "is", label: "is" }, { value: "not", label: "is not" }, { value: "starts", label: "starts with" }, { value: "empty", label: "is empty" }],
  number: [{ value: "eq", label: "=" }, { value: "gt", label: ">" }, { value: "lt", label: "<" }, { value: "gte", label: "≥" }, { value: "lte", label: "≤" }],
  select: [{ value: "is", label: "is" }, { value: "not", label: "is not" }],
  date: [{ value: "before", label: "is before" }, { value: "after", label: "is after" }, { value: "on", label: "is on" }],
};

/** Evaluates a filter group against a record. Use it client-side or mirror the rules on your server. */
export function applyFilters<T extends Record<string, unknown>>(rows: T[], g: FilterGroup, fields: FilterField[]): T[] {
  const test = (row: T, r: FilterRule) => {
    const f = fields.find((x) => x.key === r.field);
    const raw = row[r.field];
    if (!f) return true;
    if (r.op === "empty") return raw == null || raw === "";
    if (r.value === "") return true;
    if (f.type === "number") {
      const a = Number(raw);
      const b = Number(r.value);
      return { eq: a === b, gt: a > b, lt: a < b, gte: a >= b, lte: a <= b }[r.op as "eq"] ?? true;
    }
    if (f.type === "date") {
      const a = new Date(String(raw)).getTime();
      const b = new Date(r.value).getTime();
      return r.op === "before" ? a < b : r.op === "after" ? a > b : new Date(a).toDateString() === new Date(b).toDateString();
    }
    const s = String(raw ?? "").toLowerCase();
    const v = r.value.toLowerCase();
    return { contains: s.includes(v), is: s === v, not: s !== v, starts: s.startsWith(v) }[r.op as "is"] ?? true;
  };
  if (!g.rules.length) return rows;
  return rows.filter((row) => (g.join === "and" ? g.rules.every((r) => test(row, r)) : g.rules.some((r) => test(row, r))));
}

export type FilterBuilderProps = {
  fields: FilterField[];
  value: FilterGroup;
  onChange: (g: FilterGroup) => void;
  className?: string;
};

const sel = "h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-accent";

/** Notion-style filter builder: field / operator / value rows joined by AND / OR, with summary chips. */
export function FilterBuilder({ fields, value, onChange, className }: FilterBuilderProps) {
  const [open, setOpen] = React.useState(true);
  const set = (rules: FilterRule[]) => onChange({ ...value, rules });
  const add = () => {
    const f = fields[0]!;
    set([...value.rules, { id: Math.random().toString(36).slice(2, 8), field: f.key, op: OPS[f.type][0]!.value, value: "" }]);
    setOpen(true);
  };
  const label = (r: FilterRule) => {
    const f = fields.find((x) => x.key === r.field);
    const op = f ? OPS[f.type].find((o) => o.value === r.op)?.label : r.op;
    const v = f?.type === "select" ? f.options.find((o) => o.value === r.value)?.label : r.value;
    return `${f?.label ?? r.field} ${op}${r.op === "empty" ? "" : ` ${v || "…"}`}`;
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence initial={false}>
          {value.rules.map((r, i) => (
            <motion.span key={r.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-1">
              {i ? <span className="font-mono text-[10px] uppercase text-subtle">{value.join}</span> : null}
              <span className="flex items-center gap-1.5 rounded-full border border-accent/50 bg-accent-soft py-1 pl-3 pr-1.5 text-xs">
                <button type="button" onClick={() => setOpen(true)}>{label(r)}</button>
                <button type="button" aria-label="Remove filter" onClick={() => set(value.rules.filter((x) => x.id !== r.id))} className="rounded-full p-0.5 hover:bg-background/40"><XIcon size={11} /></button>
              </span>
            </motion.span>
          ))}
        </AnimatePresence>
        <button type="button" onClick={add} className="flex h-7 items-center gap-1 rounded-full border border-dashed border-border-strong px-3 text-xs text-muted hover:text-foreground">
          <PlusIcon size={12} /> Add filter
        </button>
        {value.rules.length ? (
          <>
            <button type="button" onClick={() => setOpen(!open)} className="text-xs text-subtle hover:text-foreground">{open ? "Hide editor" : "Edit"}</button>
            <button type="button" onClick={() => set([])} className="text-xs text-subtle hover:text-danger">Clear</button>
          </>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {open && value.rules.length ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
              {value.rules.map((r, i) => {
                const f = fields.find((x) => x.key === r.field) ?? fields[0]!;
                return (
                  <motion.div key={r.id} layout className="flex flex-wrap items-center gap-2">
                    <span className="w-14 text-right text-xs text-subtle">
                      {i === 0 ? "Where" : i === 1 ? (
                        <select value={value.join} onChange={(e) => onChange({ ...value, join: e.target.value as "and" | "or" })} aria-label="Join" className="rounded-md bg-surface-raised px-1 py-0.5 text-xs uppercase outline-none">
                          <option value="and">and</option>
                          <option value="or">or</option>
                        </select>
                      ) : value.join}
                    </span>
                    <select className={sel} aria-label="Field" value={r.field} onChange={(e) => { const nf = fields.find((x) => x.key === e.target.value)!; set(value.rules.map((x) => (x.id === r.id ? { ...x, field: nf.key, op: OPS[nf.type][0]!.value, value: "" } : x))); }}>
                      {fields.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                    </select>
                    <select className={sel} aria-label="Operator" value={r.op} onChange={(e) => set(value.rules.map((x) => (x.id === r.id ? { ...x, op: e.target.value } : x)))}>
                      {OPS[f.type].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {r.op === "empty" ? null : f.type === "select" ? (
                      <select className={cn(sel, "min-w-32")} aria-label="Value" value={r.value} onChange={(e) => set(value.rules.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))}>
                        <option value="">Choose…</option>
                        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input className={cn(sel, "w-40 px-3")} aria-label="Value" type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={r.value} placeholder="Value" onChange={(e) => set(value.rules.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))} />
                    )}
                    <button type="button" aria-label="Remove rule" onClick={() => set(value.rules.filter((x) => x.id !== r.id))} className="ml-auto flex size-8 items-center justify-center rounded-lg text-subtle hover:bg-surface-raised hover:text-danger"><XIcon size={14} /></button>
                  </motion.div>
                );
              })}
              <button type="button" onClick={add} className="ml-16 flex w-fit items-center gap-1 text-xs text-accent"><PlusIcon size={12} /> Add rule</button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
