"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type Activity = {
  id: string;
  actor: { name: string; color?: string; avatar?: string };
  /** e.g. "commented on", "merged", "deployed". */
  verb: string;
  target?: React.ReactNode;
  /** Optional extra block: a quote, diff, image… */
  detail?: React.ReactNode;
  /** Group label, e.g. "Today". */
  group: string;
  time: string;
  type?: string;
  icon?: React.ReactNode;
};

export type ActivityFeedProps = {
  items: Activity[];
  /** Filter chips; values match Activity.type. */
  filters?: { value: string; label: string }[];
  /** Show a "N new" pill when items are prepended. */
  live?: boolean;
  className?: string;
};

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/** Grouped activity stream with type filters, avatars, rich details and animated arrivals. */
export function ActivityFeed({ items, filters, live, className }: ActivityFeedProps) {
  const [filter, setFilter] = React.useState<string | null>(null);
  const [seen, setSeen] = React.useState(() => new Set(items.map((i) => i.id)));
  const fresh = items.filter((i) => !seen.has(i.id)).length;
  const shown = items.filter((i) => !filter || i.type === filter);
  const groups = shown.reduce<Record<string, Activity[]>>((a, it) => ((a[it.group] ??= []).push(it), a), {});

  return (
    <div className={cn("relative flex w-full max-w-xl flex-col gap-4", className)}>
      {filters ? (
        <div className="flex flex-wrap gap-1.5">
          {[{ value: "", label: "All" }, ...filters].map((f) => (
            <button key={f.value} type="button" aria-pressed={(filter ?? "") === f.value} onClick={() => setFilter(f.value || null)} className={cn("h-8 rounded-full px-3 text-xs", (filter ?? "") === f.value ? "bg-accent text-accent-foreground" : "border border-border text-muted hover:text-foreground")}>
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <AnimatePresence>
        {live && fresh > 0 ? (
          <motion.button
            type="button"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            onClick={() => setSeen(new Set(items.map((i) => i.id)))}
            className="sticky top-2 z-10 mx-auto rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-overlay"
          >
            ↑ {fresh} new
          </motion.button>
        ) : null}
      </AnimatePresence>
      {Object.entries(groups).map(([g, list]) => (
        <section key={g} className="flex flex-col">
          <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{g}</h4>
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {list.map((it) => (
                <motion.li
                  layout
                  key={it.id}
                  initial={{ opacity: 0, height: 0, backgroundColor: "var(--kn-accent-soft)" }}
                  animate={{ opacity: 1, height: "auto", backgroundColor: "rgba(0,0,0,0)" }}
                  transition={{ duration: 0.5 }}
                  className="flex gap-3 rounded-xl px-2 py-2.5"
                >
                  <span className="relative">
                    <span className="flex size-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-[#0b0c0e]" style={{ background: it.actor.color ?? "var(--kn-accent)" }}>
                      {it.actor.avatar ? <img src={it.actor.avatar} alt="" className="size-full object-cover" /> : initials(it.actor.name)}
                    </span>
                    {it.icon ? <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-surface-overlay text-muted ring-2 ring-background [&_svg]:size-2.5">{it.icon}</span> : null}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                    <p className="text-sm leading-snug">
                      <b className="font-semibold">{it.actor.name}</b> <span className="text-muted">{it.verb}</span> {it.target ? <span className="font-medium">{it.target}</span> : null}
                      <span className="ml-2 text-xs text-subtle">{it.time}</span>
                    </p>
                    {it.detail ? <div className="rounded-xl border border-border bg-surface p-3 text-sm text-muted">{it.detail}</div> : null}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
