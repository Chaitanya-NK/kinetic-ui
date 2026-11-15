"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { Kbd, useStreamedText } from "@kineticui/ui";
import { ArrowRightIcon, CodeIcon, EditIcon, FileIcon, SearchIcon, SparkleIcon, UsersIcon } from "@kineticui/icons";

type Action = { id: string; label: string; hint?: string; icon: React.ReactNode; group: string };
const actions: Action[] = [
  { id: "new-doc", label: "New document", icon: <EditIcon />, group: "Create", hint: "N" },
  { id: "invite", label: "Invite teammate", icon: <UsersIcon />, group: "Create" },
  { id: "roadmap", label: "Q4 roadmap.md", icon: <FileIcon />, group: "Recent" },
  { id: "table", label: "data-table.tsx", icon: <CodeIcon />, group: "Recent" },
  { id: "pricing", label: "Pricing page copy", icon: <FileIcon />, group: "Recent" },
];
const answer = "Kinetic ships two ways: install `@kineticui/ui` from npm, or run `npx @kineticui/cli add <name>` to copy the source. Both come from the same files, so you can mix them freely.";

function Answer({ q }: { q: string }) {
  const { text, done } = useStreamedText(answer, { speed: 70 });
  return (
    <div className="flex gap-3 p-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><SparkleIcon size={14} /></span>
      <div className="flex flex-col gap-2 text-sm leading-relaxed">
        <span className="text-xs text-subtle">Answer for “{q}”</span>
        <p>
          {text.split(/(`[^`]+`)/g).map((p, i) => (p.startsWith("`") && p.endsWith("`") ? <code key={i} className="rounded bg-surface-overlay px-1 font-mono text-[12px]">{p.slice(1, -1)}</code> : p))}
          {!done ? <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-accent animate-kn-caret" /> : null}
        </p>
        {done ? <span className="text-xs text-subtle">Sources: Docs › Installation</span> : null}
      </div>
    </div>
  );
}

/** ⌘K palette that blends commands with an "Ask AI" mode: type a question and get a streamed answer inline. */
export function AiCommandPalette({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [q, setQ] = React.useState("");
  const [asked, setAsked] = React.useState<string | null>(null);
  const [active, setActive] = React.useState(0);
  const filtered = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));
  const rows: ({ type: "ai" } | { type: "action"; a: Action })[] = [...(q ? [{ type: "ai" as const }] : []), ...filtered.map((a) => ({ type: "action" as const, a }))];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  React.useEffect(() => setActive(0), [q]);

  const run = (i: number) => {
    const r = rows[i];
    if (!r) return;
    if (r.type === "ai") setAsked(q);
    else setOpen(false);
  };

  return (
    <section className="flex min-h-[620px] flex-col items-center justify-center gap-4 p-6">
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted hover:text-foreground">
        <SearchIcon size={15} /> Search or ask AI… <span className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
      </button>
      <DialogPrimitive.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setQ(""); setAsked(null); } }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.15s]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-[18%] z-50 w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised shadow-overlay outline-none data-[state=open]:animate-[kn-pop_0.18s_var(--ease-kn-out)]">
            <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
            <div className="flex items-center gap-3 border-b border-border px-4">
              {asked ? <SparkleIcon size={17} className="text-accent" /> : <SearchIcon size={17} className="text-subtle" />}
              <input
                autoFocus
                value={q}
                onChange={(e) => { setQ(e.target.value); setAsked(null); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(rows.length - 1, a + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                  if (e.key === "Enter") { e.preventDefault(); run(active); }
                }}
                placeholder="Type a command or ask a question…"
                aria-label="Command"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
              />
              <Kbd>esc</Kbd>
            </div>
            <AnimatePresence mode="wait">
              {asked ? (
                <motion.div key="answer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Answer q={asked} />
                </motion.div>
              ) : (
                <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="listbox" className="max-h-80 overflow-y-auto p-2">
                  {rows.length ? (
                    rows.map((r, i) => {
                      const prev = rows[i - 1];
                      const group = r.type === "ai" ? "AI" : r.a.group;
                      const prevGroup = prev ? (prev.type === "ai" ? "AI" : prev.a.group) : null;
                      return (
                        <React.Fragment key={r.type === "ai" ? "ai" : r.a.id}>
                          {group !== prevGroup ? <li className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{group}</li> : null}
                          <li
                            role="option"
                            aria-selected={active === i}
                            onPointerMove={() => setActive(i)}
                            onClick={() => run(i)}
                            className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm [&_svg]:size-4", active === i ? "bg-surface-overlay" : "")}
                          >
                            {r.type === "ai" ? (
                              <>
                                <span className="flex size-6 items-center justify-center rounded-md bg-accent text-accent-foreground"><SparkleIcon /></span>
                                <span className="flex-1 truncate">Ask AI: <b>{q}</b></span>
                                <ArrowRightIcon className="text-subtle" />
                              </>
                            ) : (
                              <>
                                <span className="text-muted">{r.a.icon}</span>
                                <span className="flex-1">{r.a.label}</span>
                                {r.a.hint ? <Kbd>{r.a.hint}</Kbd> : null}
                              </>
                            )}
                          </li>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <li className="p-8 text-center text-sm text-subtle">No results</li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-subtle">
              <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
              <span className="flex items-center gap-1"><Kbd>↵</Kbd> {rows[active]?.type === "ai" ? "ask" : "open"}</span>
              <span className="ml-auto flex items-center gap-1"><SparkleIcon size={12} className="text-accent" /> Type a question to ask AI</span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </section>
  );
}
