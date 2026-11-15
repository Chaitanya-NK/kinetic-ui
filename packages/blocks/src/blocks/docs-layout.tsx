"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, CodeBlock, SearchInput } from "@kineticui/ui";
import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, EditIcon, ThumbsDownIcon, ThumbsUpIcon } from "@kineticui/icons";

const nav = [
  { group: "Getting started", items: ["Introduction", "Installation", "Theming", "CLI"] },
  { group: "Guides", items: ["Server components", "Forms", "Animations", "Dark mode"] },
  { group: "API", items: ["Button", "Dialog", "Toast", "Tabs"] },
];

/** Documentation layout: grouped sidebar with active indicator, breadcrumbs, callout, code, feedback and prev/next. */
export function DocsLayout() {
  const [active, setActive] = React.useState("Installation");
  const [q, setQ] = React.useState("");
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  const flat = nav.flatMap((g) => g.items);
  const i = flat.indexOf(active);

  return (
    <div className="mx-auto grid min-h-[760px] max-w-6xl md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_200px]">
      <aside className="hidden flex-col gap-6 border-r border-border p-5 md:flex">
        <SearchInput value={q} onValueChange={setQ} placeholder="Search docs" />
        {nav.map((g) => {
          const items = g.items.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
          return items.length ? (
            <div key={g.group} className="flex flex-col gap-1">
              <span className="mb-1 font-mono text-[10px] uppercase tracking-widest text-subtle">{g.group}</span>
              {items.map((it) => (
                <button key={it} type="button" onClick={() => setActive(it)} className="relative flex h-8 items-center rounded-lg px-3 text-left text-sm">
                  {active === it ? <motion.span layoutId="kn-docs-nav" className="absolute inset-0 rounded-lg bg-surface-raised" /> : null}
                  {active === it ? <motion.span layoutId="kn-docs-bar" className="absolute left-0 top-1.5 h-5 w-0.5 rounded-full bg-accent" /> : null}
                  <span className={`relative ${active === it ? "font-medium text-foreground" : "text-muted hover:text-foreground"}`}>{it}</span>
                </button>
              ))}
            </div>
          ) : null;
        })}
      </aside>
      <motion.main key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 flex-col gap-6 px-6 py-10 md:px-10">
        <nav className="flex items-center gap-1 text-xs text-subtle">Docs <ChevronRightIcon size={12} /> {nav.find((g) => g.items.includes(active))?.group} <ChevronRightIcon size={12} /> <span className="text-foreground">{active}</span></nav>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{active}</h1>
          <p className="text-lg text-muted">Add Kinetic UI to a Next.js, Vite or Remix project in under a minute.</p>
        </div>
        <h2 id="dl-cli" className="font-display text-xl font-semibold">Using the CLI</h2>
        <p className="text-muted">The CLI copies component source into your project, installs dependencies and wires up tokens.</p>
        <CodeBlock files={[{ name: "npm", language: "bash", code: "npx @kineticui/cli init\nnpx @kineticui/cli add button dialog toast" }, { name: "pnpm", language: "bash", code: "pnpm dlx @kineticui/cli init\npnpm dlx @kineticui/cli add button dialog toast" }]} />
        <div className="flex gap-3 rounded-xl border border-info/30 bg-info-soft p-4 text-sm">
          <Badge variant="info" size="sm">Note</Badge>
          <p className="text-muted">Prefer packages? Install <code className="rounded bg-surface-raised px-1 font-mono text-xs text-foreground">@kineticui/ui</code> and import components directly. Both stay in sync.</p>
        </div>
        <h2 id="dl-tokens" className="font-display text-xl font-semibold">Add the tokens</h2>
        <CodeBlock files={[{ name: "globals.css", language: "css", code: '@import "tailwindcss";\n@import "@kineticui/core/styles.css";' }]} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
          <div className="flex items-center gap-2 text-muted">
            Was this page helpful?
            {(["up", "down"] as const).map((v) => (
              <motion.button key={v} whileTap={{ scale: 0.85 }} type="button" aria-label={v === "up" ? "Yes" : "No"} onClick={() => setVote(v)} className={`flex size-8 items-center justify-center rounded-lg border ${vote === v ? "border-accent bg-accent-soft text-accent" : "border-border"}`}>
                {v === "up" ? <ThumbsUpIcon size={14} /> : <ThumbsDownIcon size={14} />}
              </motion.button>
            ))}
            {vote ? <span className="text-xs text-accent">Thanks!</span> : null}
          </div>
          <a href="#" className="flex items-center gap-1.5 text-subtle hover:text-foreground"><EditIcon size={13} /> Edit on GitHub</a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {i > 0 ? (
            <button type="button" onClick={() => setActive(flat[i - 1]!)} className="group flex flex-col items-start gap-1 rounded-xl border border-border p-4 text-left hover:border-accent">
              <span className="flex items-center gap-1 text-xs text-subtle"><ArrowLeftIcon size={12} /> Previous</span><span className="font-medium">{flat[i - 1]}</span>
            </button>
          ) : <span />}
          {i < flat.length - 1 ? (
            <button type="button" onClick={() => setActive(flat[i + 1]!)} className="group flex flex-col items-end gap-1 rounded-xl border border-border p-4 text-right hover:border-accent">
              <span className="flex items-center gap-1 text-xs text-subtle">Next <ArrowRightIcon size={12} /></span><span className="font-medium">{flat[i + 1]}</span>
            </button>
          ) : null}
        </div>
      </motion.main>
      <aside className="hidden flex-col gap-2 p-6 pt-12 text-sm lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">On this page</span>
        <a href="#dl-cli" className="text-muted hover:text-foreground">Using the CLI</a>
        <a href="#dl-tokens" className="text-muted hover:text-foreground">Add the tokens</a>
      </aside>
    </div>
  );
}
