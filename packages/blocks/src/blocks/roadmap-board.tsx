"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button } from "@kineticui/ui";
import { ChevronUpIcon, PlusIcon } from "@kineticui/icons";

type Item = { id: string; title: string; tag: string; votes: number; voted?: boolean; eta?: string; progress?: number };
type Col = { id: string; title: string; hint: string; color: string; items: Item[] };

const initial: Col[] = [
  { id: "planned", title: "Planned", hint: "Next up", color: "var(--kn-info)", items: [
    { id: "a", title: "Figma kit synced with code", tag: "Design", votes: 412, eta: "Q1" },
    { id: "b", title: "Vue port", tag: "Frameworks", votes: 388, eta: "Q2" },
    { id: "c", title: "Charts: candlestick & radar", tag: "Data", votes: 156, eta: "Q1" },
  ] },
  { id: "progress", title: "In progress", hint: "Being built", color: "var(--kn-warning)", items: [
    { id: "d", title: "Theme editor", tag: "Theming", votes: 520, progress: 70 },
    { id: "e", title: "Date range presets", tag: "Forms", votes: 203, progress: 35 },
  ] },
  { id: "shipped", title: "Shipped", hint: "Recently released", color: "var(--kn-success)", items: [
    { id: "f", title: "Passkey login", tag: "Auth", votes: 301 },
    { id: "g", title: "Upload queue", tag: "Forms", votes: 244 },
    { id: "h", title: "Share sheet", tag: "Social", votes: 190 },
  ] },
];

/** Public roadmap: Planned / In progress / Shipped columns with upvotes that re-sort, progress and ETAs. */
export function RoadmapBoard() {
  const [cols, setCols] = React.useState(initial);
  const vote = (cid: string, id: string) =>
    setCols((cs) => cs.map((c) => (c.id !== cid ? c : { ...c, items: c.items.map((i) => (i.id === id ? { ...i, voted: !i.voted, votes: i.votes + (i.voted ? -1 : 1) } : i)).sort((a, b) => b.votes - a.votes) })));

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-4xl font-semibold tracking-tight">Roadmap</h1><p className="mt-1 text-muted">Vote for what we build next. Most-voted rise to the top.</p></div>
        <Button><PlusIcon size={15} /> Suggest a feature</Button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {cols.map((c) => (
          <div key={c.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/50 p-3">
            <div className="flex items-center gap-2 px-1 pt-1">
              <span className="size-2 rounded-full" style={{ background: c.color }} />
              <span className="font-semibold">{c.title}</span>
              <span className="rounded-md bg-surface-overlay px-1.5 font-mono text-xs text-subtle">{c.items.length}</span>
              <span className="ml-auto text-xs text-subtle">{c.hint}</span>
            </div>
            {c.items.map((i) => (
              <motion.div layout key={i.id} transition={{ type: "spring", stiffness: 400, damping: 34 }} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                <motion.button whileTap={{ scale: 0.85 }} type="button" aria-pressed={!!i.voted} onClick={() => vote(c.id, i.id)} className={`flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold ${i.voted ? "border-accent bg-accent-soft text-accent" : "border-border hover:border-border-strong"}`}>
                  <span className="sr-only">{`Upvote ${i.title}, `}</span>
                  <ChevronUpIcon size={15} aria-hidden /> {i.votes}
                </motion.button>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="text-sm font-medium leading-snug">{i.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge size="sm">{i.tag}</Badge>
                    {i.eta ? <span className="font-mono text-[10px] text-subtle">ETA {i.eta}</span> : null}
                  </div>
                  {i.progress !== undefined ? (
                    <div className="h-1 overflow-hidden rounded-full bg-surface-overlay">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${i.progress}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-warning" />
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
