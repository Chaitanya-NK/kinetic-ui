"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type OrgNode = { id: string; name: string; title?: string; color?: string; avatar?: string; children?: OrgNode[] };

export type OrgChartProps = {
  data: OrgNode;
  /** Levels expanded initially. */
  defaultDepth?: number;
  onSelect?: (node: OrgNode) => void;
  className?: string;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
const countAll = (n: OrgNode): number => (n.children ?? []).reduce((a, c) => a + 1 + countAll(c), 0);

function Node({ node, depth, defaultDepth, onSelect, selected }: { node: OrgNode; depth: number; defaultDepth: number; onSelect: (n: OrgNode) => void; selected?: string }) {
  const [open, setOpen] = React.useState(depth < defaultDepth);
  const kids = node.children ?? [];
  return (
    <li className="relative flex flex-col items-center px-2 pt-6 before:absolute before:left-0 before:right-0 before:top-0 before:border-t before:border-border-strong first:before:left-1/2 last:before:right-1/2 only:before:hidden [&:not(:only-child)]:after:absolute [&:not(:only-child)]:after:left-1/2 [&:not(:only-child)]:after:top-0 [&:not(:only-child)]:after:h-6 [&:not(:only-child)]:after:border-l [&:not(:only-child)]:after:border-border-strong">
      <motion.button
        layout
        type="button"
        onClick={() => onSelect(node)}
        className={cn("relative z-[1] flex w-36 flex-col items-center gap-1.5 rounded-2xl border bg-surface p-3 text-center transition-colors", selected === node.id ? "border-accent" : "border-border hover:border-border-strong")}
      >
        <span className="flex size-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-[#0b0c0e]" style={{ background: node.color ?? "var(--kn-accent)" }}>
          {node.avatar ? <img src={node.avatar} alt="" className="size-full object-cover" /> : initials(node.name)}
        </span>
        <span className="text-sm font-semibold leading-tight">{node.name}</span>
        {node.title ? <span className="text-xs text-subtle">{node.title}</span> : null}
      </motion.button>
      {kids.length ? (
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `Collapse ${node.name}'s team` : `Expand ${node.name}'s team`}
          onClick={() => setOpen(!open)}
          className="relative z-[1] -mt-2.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-border-strong bg-surface-raised px-1.5 font-mono text-[10px] text-muted hover:text-foreground"
        >
          {open ? "−" : `+${countAll(node)}`}
        </button>
      ) : null}
      <AnimatePresence initial={false}>
        {open && kids.length ? (
          <motion.ul initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative flex pt-4 before:absolute before:left-1/2 before:top-0 before:h-4 before:border-l before:border-border-strong">
            {kids.map((k) => (
              <Node key={k.id} node={k} depth={depth + 1} defaultDepth={defaultDepth} onSelect={onSelect} selected={selected} />
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

/** Collapsible organisation chart with connector lines and team counts. Scroll horizontally on small screens. */
export function OrgChart({ data, defaultDepth = 2, onSelect, className }: OrgChartProps) {
  const [selected, setSelected] = React.useState<string>();
  return (
    <div className={cn("overflow-x-auto pb-4", className)}>
      <ul className="mx-auto flex w-max justify-center [&>li]:before:hidden [&>li]:after:hidden">
        <Node
          node={data}
          depth={0}
          defaultDepth={defaultDepth}
          selected={selected}
          onSelect={(n) => {
            setSelected(n.id);
            onSelect?.(n);
          }}
        />
      </ul>
    </div>
  );
}
