"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button, CopyButton } from "@kineticui/ui";
import { TextScramble } from "@kineticui/motion";
import { ArrowRightIcon, TerminalIcon } from "@kineticui/icons";

const script = [
  { cmd: "npx create-orbit@latest my-api", out: ["✔ Scaffolded 14 files", "✔ Installed dependencies in 3.1s"] },
  { cmd: "orbit deploy --prod", out: ["▲ Building edge functions…", "✔ 6 routes · 41 KB", "✔ Live at https://my-api.orbit.run"] },
];

function Terminal() {
  const [lines, setLines] = React.useState<{ text: string; kind: "cmd" | "out" }[]>([]);
  const [typing, setTyping] = React.useState("");
  React.useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (!cancelled) {
        setLines([]);
        for (const step of script) {
          for (let i = 1; i <= step.cmd.length && !cancelled; i++) {
            setTyping(step.cmd.slice(0, i));
            await sleep(38);
          }
          await sleep(300);
          setTyping("");
          setLines((l) => [...l, { text: step.cmd, kind: "cmd" }]);
          for (const o of step.out) {
            await sleep(420);
            if (cancelled) return;
            setLines((l) => [...l, { text: o, kind: "out" }]);
          }
          await sleep(600);
        }
        await sleep(2600);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c0e] font-mono text-[13px] leading-6 text-[#E8E8E3] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-white/40">~/projects — zsh</span>
      </div>
      <div className="h-64 p-4">
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={l.kind === "cmd" ? "" : l.text.startsWith("✔") ? "text-[#6EE7A0]" : "text-white/60"}>
            {l.kind === "cmd" ? <><span className="text-accent">❯ </span>{l.text}</> : l.text}
          </motion.div>
        ))}
        <div>
          <span className="text-accent">❯ </span>
          {typing}
          <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent animate-kn-caret" />
        </div>
      </div>
    </div>
  );
}

/** Developer hero: scrambled headline and install command beside an auto-typing terminal. */
export function HeroTerminal({
  title = "Deploy APIs to the edge in one command",
  description = "Orbit turns any TypeScript function into a global endpoint with auth, logs and preview URLs built in.",
  command = "npx create-orbit@latest",
}: {
  title?: string;
  description?: string;
  command?: string;
}) {
  return (
    <section className="mx-auto grid min-h-[680px] max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-6">
        <span className="flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
          <TerminalIcon size={13} className="text-accent" />
          <TextScramble text="v3.0 · EDGE RUNTIME" duration={1200} className="text-xs" />
        </span>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">{title}</h1>
        <p className="text-lg leading-relaxed text-muted">{description}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Read the docs <ArrowRightIcon size={16} /></Button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-4 pr-1.5 font-mono text-sm">
            <span className="text-muted">{command}</span>
            <CopyButton value={command} />
          </div>
        </div>
      </div>
      <Terminal />
    </section>
  );
}
