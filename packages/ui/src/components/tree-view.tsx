"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronRightIcon, FileIcon, FolderIcon } from "@kineticui/icons";

export type TreeNode = { id: string; label: string; icon?: React.ReactNode; children?: TreeNode[]; meta?: React.ReactNode };

export type TreeViewProps = {
  data: TreeNode[];
  selected?: string;
  onSelect?: (node: TreeNode) => void;
  defaultExpanded?: string[];
  className?: string;
};

/** File-tree style hierarchy with keyboard navigation (arrows, Home/End, Enter). */
export function TreeView({ data, selected, onSelect, defaultExpanded = [], className }: TreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpanded));
  const [focus, setFocus] = React.useState<string | undefined>(selected ?? data[0]?.id);
  const ref = React.useRef<HTMLUListElement>(null);

  const flat: { node: TreeNode; depth: number; parent?: string }[] = [];
  const walk = (nodes: TreeNode[], depth: number, parent?: string) =>
    nodes.forEach((n) => {
      flat.push({ node: n, depth, parent });
      if (n.children && expanded.has(n.id)) walk(n.children, depth + 1, n.id);
    });
  walk(data, 0);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const focusId = (id?: string) => {
    if (!id) return;
    setFocus(id);
    requestAnimationFrame(() => (ref.current?.querySelector(`[data-id="${CSS.escape(id)}"]`) as HTMLElement | null)?.focus());
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = flat.findIndex((f) => f.node.id === focus);
    const cur = flat[i];
    if (!cur) return;
    const hasKids = !!cur.node.children?.length;
    const map: Record<string, () => void> = {
      ArrowDown: () => focusId(flat[i + 1]?.node.id),
      ArrowUp: () => focusId(flat[i - 1]?.node.id),
      Home: () => focusId(flat[0]?.node.id),
      End: () => focusId(flat.at(-1)?.node.id),
      ArrowRight: () => (hasKids && !expanded.has(cur.node.id) ? toggle(cur.node.id) : hasKids ? focusId(flat[i + 1]?.node.id) : undefined),
      ArrowLeft: () => (hasKids && expanded.has(cur.node.id) ? toggle(cur.node.id) : focusId(cur.parent)),
      Enter: () => (hasKids ? toggle(cur.node.id) : onSelect?.(cur.node)),
      " ": () => (hasKids ? toggle(cur.node.id) : onSelect?.(cur.node)),
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]!();
    }
  };

  const render = (nodes: TreeNode[], depth: number): React.ReactNode =>
    nodes.map((n) => {
      const kids = !!n.children?.length;
      const open = expanded.has(n.id);
      return (
        <li key={n.id} role="treeitem" aria-expanded={kids ? open : undefined} aria-selected={selected === n.id} className="outline-none">
          <div
            data-id={n.id}
            tabIndex={focus === n.id ? 0 : -1}
            onFocus={() => setFocus(n.id)}
            onClick={() => (kids ? toggle(n.id) : onSelect?.(n))}
            style={{ paddingLeft: 8 + depth * 16 }}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent",
              selected === n.id ? "bg-accent-soft text-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground",
            )}
          >
            <ChevronRightIcon size={13} className={cn("shrink-0 transition-transform duration-200", open && "rotate-90", !kids && "invisible")} />
            <span className={cn("shrink-0 [&_svg]:size-4", kids ? "text-accent" : "text-subtle")}>{n.icon ?? (kids ? <FolderIcon /> : <FileIcon />)}</span>
            <span className="flex-1 truncate">{n.label}</span>
            {n.meta ? <span className="font-mono text-[10px] text-subtle">{n.meta}</span> : null}
          </div>
          <AnimatePresence initial={false}>
            {kids && open ? (
              <motion.ul role="group" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                {render(n.children!, depth + 1)}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </li>
      );
    });

  return (
    <ul ref={ref} role="tree" onKeyDown={onKey} className={cn("flex flex-col", className)}>
      {render(data, 0)}
    </ul>
  );
}
