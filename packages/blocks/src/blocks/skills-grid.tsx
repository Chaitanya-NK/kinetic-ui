"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

type Skill = { name: string; level: number; years: number; group: string; note: string };
const skills: Skill[] = [
  { name: "TypeScript", level: 95, years: 7, group: "Engineering", note: "Strict mode, generics-heavy APIs, library authoring." },
  { name: "React", level: 95, years: 7, group: "Engineering", note: "Server components, Suspense, concurrent rendering." },
  { name: "Motion", level: 92, years: 5, group: "Design", note: "Springs, layout animations, gesture-driven UI." },
  { name: "CSS & Tailwind", level: 90, years: 8, group: "Engineering", note: "Container queries, cascade layers, design tokens." },
  { name: "Figma", level: 85, years: 6, group: "Design", note: "Auto layout, variables, prototyping." },
  { name: "Accessibility", level: 82, years: 5, group: "Design", note: "WCAG 2.2, screen reader testing, focus management." },
  { name: "Node.js", level: 75, years: 5, group: "Engineering", note: "CLIs, build tooling, edge functions." },
  { name: "Swift", level: 55, years: 2, group: "Engineering", note: "SwiftUI prototypes and widgets." },
  { name: "Public speaking", level: 70, years: 3, group: "Other", note: "Conference talks and workshops." },
];
const groups = ["All", "Engineering", "Design", "Other"];

/** Skills grid: grouped tiles with animated level rings, filter tabs and a detail popover on hover or focus. */
export function SkillsGrid() {
  const [g, setG] = React.useState("All");
  const [hover, setHover] = React.useState<string | null>(null);
  const list = skills.filter((s) => g === "All" || s.group === g);

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><span className="font-mono text-xs uppercase tracking-widest text-accent">Toolkit</span><h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Skills</h2></div>
        <div className="flex gap-1 rounded-full border border-border p-1">
          {groups.map((x) => (
            <button key={x} type="button" onClick={() => setG(x)} className="relative h-8 rounded-full px-3 text-sm">
              {g === x ? <motion.span layoutId="kn-skill-tab" className="absolute inset-0 rounded-full bg-accent" /> : null}
              <span className={`relative ${g === x ? "font-medium text-accent-foreground" : "text-muted"}`}>{x}</span>
            </button>
          ))}
        </div>
      </div>
      <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s, i) => {
            const r = 22;
            const c = 2 * Math.PI * r;
            return (
              <motion.div
                layout
                key={s.name}
                tabIndex={0}
                onMouseEnter={() => setHover(s.name)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.name)}
                onBlur={() => setHover(null)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                className="relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 outline-none hover:border-accent/50 focus-visible:border-accent"
              >
                <svg viewBox="0 0 56 56" className="size-14 shrink-0 -rotate-90">
                  <circle cx="28" cy="28" r={r} fill="none" stroke="var(--kn-surface-overlay)" strokeWidth="5" />
                  <motion.circle cx="28" cy="28" r={r} fill="none" stroke="var(--kn-accent)" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - s.level / 100) }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.04 }} />
                </svg>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{s.name}</span>
                  <span className="font-mono text-xs text-subtle">{s.level}% · {s.years} yrs</span>
                </div>
                <AnimatePresence>
                  {hover === s.name ? (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="pointer-events-none absolute inset-x-2 bottom-full z-10 mb-2 rounded-xl border border-border-strong bg-surface-raised p-3 text-xs text-muted shadow-overlay">{s.note}</motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
