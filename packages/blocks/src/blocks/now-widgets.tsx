"use client";

import * as React from "react";
import { motion } from "motion/react";
import { BookOpenIcon, CodeIcon, CoffeeIcon, HeadphonesIcon, MapPinIcon } from "@kineticui/icons";

const bars = [0.4, 0.8, 0.55, 0.95, 0.6, 0.75, 0.35];

/** "Now" page widgets: currently listening (animated equaliser), reading (progress), building (commit ticker), location and status. */
export function NowWidgets() {
  const [playing, setPlaying] = React.useState(true);
  const [commit, setCommit] = React.useState(0);
  const commits = ["feat: theme editor exports CSS", "fix: share sheet focus trap", "chore: bump motion to 12.4", "feat: upload queue retries"];
  React.useEffect(() => {
    const t = setInterval(() => setCommit((c) => (c + 1) % commits.length), 2600);
    return () => clearInterval(t);
  }, [commits.length]);

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14">
      <div className="flex items-end justify-between gap-4">
        <div><span className="font-mono text-xs uppercase tracking-widest text-accent">/now</span><h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">What I&apos;m up to</h2></div>
        <span className="text-xs text-subtle">Updated Nov 14, 2026</span>
      </div>
      <div className="grid auto-rows-[minmax(150px,auto)] gap-4 md:grid-cols-3">
        <button type="button" onClick={() => setPlaying(!playing)} aria-pressed={playing} className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border border-border bg-surface p-5 text-left md:col-span-2">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
          <span className="relative flex items-center gap-2 text-xs text-subtle"><HeadphonesIcon size={13} /> {playing ? "Listening now" : "Paused"}</span>
          <div className="relative flex items-end gap-4">
            <motion.span animate={{ rotate: playing ? 360 : 0 }} transition={playing ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0.4 }} className="size-16 shrink-0 rounded-full bg-[conic-gradient(#f9a8d4,#a78bfa,#7dd3fc,#f9a8d4)] p-5"><span className="block size-full rounded-full bg-surface" /></motion.span>
            <div className="flex flex-1 flex-col"><span className="text-lg font-semibold">Midnight Drive</span><span className="text-sm text-muted">Neon Coast · Afterglow</span></div>
            <div className="flex h-10 items-end gap-1" aria-hidden>
              {bars.map((b, i) => <motion.span key={i} className="w-1.5 rounded-full bg-[#f9a8d4]" animate={playing ? { height: [`${b * 40}%`, "100%", `${b * 60}%`, `${b * 40}%`] } : { height: "15%" }} transition={playing ? { duration: 0.9 + i * 0.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }} />)}
            </div>
          </div>
        </button>
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-surface p-5">
          <span className="flex items-center gap-2 text-xs text-subtle"><BookOpenIcon size={13} /> Reading</span>
          <div><div className="font-semibold leading-snug">The Design of Everyday Things</div><div className="text-sm text-muted">Don Norman</div></div>
          <div className="flex flex-col gap-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay"><motion.div initial={{ width: 0 }} whileInView={{ width: "64%" }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="h-full bg-accent" /></div>
            <span className="font-mono text-[10px] text-subtle">p. 236 of 368 · 64%</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-surface p-5 md:col-span-2">
          <span className="flex items-center gap-2 text-xs text-subtle"><CodeIcon size={13} /> Building</span>
          <div className="flex flex-col gap-1"><span className="text-lg font-semibold">Kinetic UI theme editor</span><span className="text-sm text-muted">Live token playground that exports CSS variables.</span></div>
          <div className="flex h-8 items-center gap-2 overflow-hidden rounded-lg bg-background px-3 font-mono text-xs">
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            <motion.span key={commit} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="truncate text-muted">{commits[commit]}</motion.span>
            <span className="ml-auto shrink-0 text-subtle">main</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border bg-surface p-5">
          <span className="flex items-center gap-2 text-xs text-subtle"><MapPinIcon size={13} /> Based in</span>
          <div><div className="font-semibold">Bengaluru, India</div><div className="text-sm text-muted">UTC+5:30 · 24°C</div></div>
          <span className="flex items-center gap-2 text-xs"><CoffeeIcon size={13} className="text-accent" /> Open to coffee chats</span>
        </div>
      </div>
    </section>
  );
}
