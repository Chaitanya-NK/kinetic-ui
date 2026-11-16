"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, MinusIcon, SearchIcon, XIcon } from "@kineticui/icons";

export type TreeSelectNode = { id: string; label: string; icon?: React.ReactNode; children?: TreeSelectNode[] };

export type TreeSelectProps = {
  data: TreeSelectNode[];
  /** Selected leaf ids (multiple) – parents are derived. */
  value: string[];
  onValueChange: (ids: string[]) => void;
  /** Allow choosing several leaves with tri-state parent checkboxes. */
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Max chips shown in the trigger before "+N". */
  maxChips?: number;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

const leaves = (n: TreeSelectNode): string[] => (n.children?.length ? n.children.flatMap(leaves) : [n.id]);

/** Hierarchical picker in a popover: search, expand, tri-state parent checks, chips in the trigger. */
export function TreeSelect({
  data,
  value,
  onValueChange,
  multiple = true,
  placeholder = "Select…",
  searchPlaceholder = "Search",
  maxChips = 3,
  className,
  disabled,
  "aria-label": label,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(data.map((d) => d.id)));
  const [focus, setFocus] = React.useState(0);
  const selected = React.useMemo(() => new Set(value), [value]);
  const byId = React.useMemo(() => {
    const m = new Map<string, TreeSelectNode>();
    const walk = (n: TreeSelectNode) => (m.set(n.id, n), n.children?.forEach(walk));
    data.forEach(walk);
    return m;
  }, [data]);

  // Filter: keep nodes that match or have matching descendants.
  const q = query.trim().toLowerCase();
  const filter = React.useCallback(
    (nodes: TreeSelectNode[]): TreeSelectNode[] =>
      nodes.flatMap((n) => {
        if (!q) return [n];
        if (n.label.toLowerCase().includes(q)) return [n];
        const kids = n.children ? filter(n.children) : [];
        return kids.length ? [{ ...n, children: kids }] : [];
      }),
    [q],
  );
  const visible = React.useMemo(() => filter(data), [data, filter]);
  const flat: { node: TreeSelectNode; depth: number }[] = [];
  const walk = (nodes: TreeSelectNode[], depth: number) => {
    for (const n of nodes) {
      flat.push({ node: n, depth });
      if (n.children?.length && (q || expanded.has(n.id))) walk(n.children, depth + 1);
    }
  };
  walk(visible, 0);

  const state = (n: TreeSelectNode): "on" | "off" | "mixed" => {
    const ls = leaves(byId.get(n.id) ?? n);
    const c = ls.filter((l) => selected.has(l)).length;
    return c === 0 ? "off" : c === ls.length ? "on" : "mixed";
  };

  const toggle = (n: TreeSelectNode) => {
    const full = byId.get(n.id) ?? n;
    if (!multiple) {
      if (full.children?.length) return toggleExpand(n.id);
      onValueChange([n.id]);
      setOpen(false);
      return;
    }
    const ls = leaves(full);
    const s = new Set(selected);
    if (state(full) === "on") ls.forEach((l) => s.delete(l));
    else ls.forEach((l) => s.add(l));
    onValueChange([...s]);
  };
  const toggleExpand = (id: string) =>
    setExpanded((e) => {
      const n = new Set(e);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const onKey = (e: React.KeyboardEvent) => {
    const cur = flat[focus];
    if (e.key === "ArrowDown") (e.preventDefault(), setFocus((f) => Math.min(flat.length - 1, f + 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setFocus((f) => Math.max(0, f - 1)));
    else if (e.key === "ArrowRight" && cur?.node.children?.length && !expanded.has(cur.node.id)) (e.preventDefault(), toggleExpand(cur.node.id));
    else if (e.key === "ArrowLeft" && cur?.node.children?.length && expanded.has(cur.node.id)) (e.preventDefault(), toggleExpand(cur.node.id));
    else if (e.key === "Enter" && cur) (e.preventDefault(), toggle(cur.node));
  };
  React.useEffect(() => setFocus(0), [q]);

  const chips = value.map((id) => byId.get(id)).filter(Boolean) as TreeSelectNode[];
  const listId = React.useId();

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => (setOpen(o), o || setQuery(""))}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex min-h-11 w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-left text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--kn-ring)] disabled:opacity-50 data-[state=open]:border-accent",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {chips.length === 0 ? <span className="text-subtle">{placeholder}</span> : null}
            <AnimatePresence initial={false}>
              {(multiple ? chips.slice(0, maxChips) : chips).map((c) => (
                <motion.span
                  key={c.id}
                  layout
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className={cn("flex items-center gap-1 rounded-md text-xs", multiple ? "bg-accent-soft py-1 pl-2 pr-1 text-foreground" : "text-sm text-foreground")}
                >
                  {c.label}
                  {multiple ? (
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remove ${c.label}`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onValueChange(value.filter((v) => v !== c.id));
                      }}
                      className="flex size-4 items-center justify-center rounded text-subtle hover:bg-accent hover:text-accent-foreground"
                    >
                      <XIcon size={10} strokeWidth={3} />
                    </span>
                  ) : null}
                </motion.span>
              ))}
            </AnimatePresence>
            {multiple && chips.length > maxChips ? <span className="rounded-md bg-surface-overlay px-2 py-1 font-mono text-[11px] text-muted">+{chips.length - maxChips}</span> : null}
          </span>
          <ChevronDownIcon size={16} className="shrink-0 text-subtle" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).querySelector("input")?.focus();
          }}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-64 origin-[var(--radix-popover-content-transform-origin)] overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]"
        >
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon size={14} className="text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={flat[focus] ? `${listId}-${flat[focus]!.node.id}` : undefined}
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
            />
            {multiple && value.length ? (
              <button type="button" onClick={() => onValueChange([])} className="text-xs text-subtle hover:text-foreground">
                Clear
              </button>
            ) : null}
          </div>
          <div id={listId} role="tree" aria-multiselectable={multiple} className="max-h-72 overflow-auto p-1.5 [scrollbar-width:thin]">
            {flat.length === 0 ? <div className="px-3 py-6 text-center text-sm text-subtle">No matches</div> : null}
            {flat.map(({ node, depth }, i) => {
              const hasKids = !!node.children?.length;
              const st = state(node);
              const isOpen = q ? true : expanded.has(node.id);
              return (
                <div
                  key={node.id}
                  id={`${listId}-${node.id}`}
                  role="treeitem"
                  aria-level={depth + 1}
                  aria-expanded={hasKids ? isOpen : undefined}
                  aria-selected={st === "on"}
                  aria-checked={multiple ? (st === "mixed" ? "mixed" : st === "on") : undefined}
                  onMouseEnter={() => setFocus(i)}
                  onClick={() => toggle(node)}
                  style={{ paddingLeft: 8 + depth * 18 }}
                  className={cn("flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-2 text-sm transition-colors", focus === i && "bg-surface-overlay")}
                >
                  <span
                    onClick={(e) => {
                      if (!hasKids) return;
                      e.stopPropagation();
                      toggleExpand(node.id);
                    }}
                    className={cn("flex size-5 shrink-0 items-center justify-center rounded text-subtle", hasKids && "hover:bg-border")}
                  >
                    {hasKids ? (
                      <motion.span animate={{ rotate: isOpen ? 90 : 0 }} className="flex">
                        <ChevronRightIcon size={13} />
                      </motion.span>
                    ) : null}
                  </span>
                  {multiple ? (
                    <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors", st === "off" ? "border-border-strong" : "border-accent bg-accent text-accent-foreground")}>
                      {st === "on" ? <CheckIcon size={11} strokeWidth={3.5} /> : st === "mixed" ? <MinusIcon size={11} strokeWidth={3.5} /> : null}
                    </span>
                  ) : null}
                  {node.icon ? <span className="flex text-muted [&_svg]:size-4">{node.icon}</span> : null}
                  <span className={cn("flex-1 truncate", hasKids && "font-medium")}>{highlight(node.label, q)}</span>
                  {hasKids ? <span className="font-mono text-[10px] text-subtle">{leaves(byId.get(node.id) ?? node).length}</span> : !multiple && st === "on" ? <CheckIcon size={14} className="text-accent" /> : null}
                </div>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-accent/30 text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
