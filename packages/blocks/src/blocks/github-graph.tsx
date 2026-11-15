"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Heatmap, SegmentedControl } from "@kineticui/ui";
import { GitBranchIcon, GitCommitIcon, GitPullRequestIcon, StarIcon } from "@kineticui/icons";

const END = new Date(2026, 10, 14);
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function makeValues(weeks: number) {
  const r = rng(42);
  const out: Record<string, number> = {};
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(END);
    d.setDate(d.getDate() - i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const v = r();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out[key] = i < 9 ? 2 + Math.round(v * 8) : v < (weekend ? 0.55 : 0.15) ? 0 : Math.round(v * (weekend ? 5 : 14));
  }
  return out;
}
const repos = [
  { name: "kinetic-ui", lang: "TypeScript", color: "#3178c6", stars: 12400, desc: "Motion-first React components." },
  { name: "spring-lab", lang: "TypeScript", color: "#3178c6", stars: 860, desc: "Playground for tuning springs." },
  { name: "swift-widgets", lang: "Swift", color: "#f05138", stars: 312, desc: "SwiftUI widget experiments." },
];

/** GitHub-style profile section: contribution heatmap with range toggle, streak stats and pinned repositories. */
export function GithubGraph() {
  const [weeks, setWeeks] = React.useState("26");
  const values = React.useMemo(() => makeValues(Number(weeks)), [weeks]);
  const days = Object.entries(values).sort(([a], [b]) => (a < b ? 1 : -1));
  const total = days.reduce((a, [, v]) => a + v, 0);
  let streak = 0;
  for (const [, v] of days) { if (v > 0) streak++; else break; }
  let best = 0;
  let run = 0;
  for (const [, v] of days) { run = v > 0 ? run + 1 : 0; best = Math.max(best, run); }

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Open source</h2>
        <SegmentedControl aria-label="Range" defaultValue="26" value={weeks} onValueChange={setWeeks} options={[{ value: "12", label: "3 mo" }, { value: "26", label: "6 mo" }, { value: "52", label: "1 yr" }]} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[[GitCommitIcon, total.toLocaleString("en-US"), "Contributions"], [GitBranchIcon, `${streak} days`, "Current streak"], [StarIcon, `${best} days`, "Longest streak"], [GitPullRequestIcon, "184", "PRs merged"]].map(([I, v, l], i) => {
          const Ic = I as typeof StarIcon;
          return (
            <motion.div key={l as string} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
              <Ic size={15} className="text-accent" />
              <span className="font-display text-xl font-semibold">{v as string}</span>
              <span className="text-xs text-subtle">{l as string}</span>
            </motion.div>
          );
        })}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-5">
        <Heatmap key={weeks} values={values} endDate={END} weeks={Number(weeks)} label={(n) => `${n} contribution${n === 1 ? "" : "s"}`} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {repos.map((r) => (
          <motion.a key={r.name} href="#" whileHover={{ y: -3 }} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 hover:border-border-strong">
            <span className="flex items-center gap-2 font-mono text-sm font-semibold text-accent"><GitBranchIcon size={14} />{r.name}</span>
            <span className="flex-1 text-sm text-muted">{r.desc}</span>
            <span className="flex items-center gap-4 text-xs text-subtle"><span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: r.color }} />{r.lang}</span><span className="flex items-center gap-1"><StarIcon size={12} />{r.stars.toLocaleString("en-US")}</span></span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
