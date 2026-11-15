"use client";

import * as React from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Avatar } from "@kineticui/ui";
import { ArrowLeftIcon, ArrowRightIcon, QuoteIcon } from "@kineticui/icons";

const quotes = [
  { name: "Priya Raman", role: "Head of Product, Orbit", relation: "Managed Maya", color: "#7dd3fc", text: "Maya turns vague product ideas into prototypes you can feel within a day. The retention win at Orbit started with one of her weekend experiments." },
  { name: "Lena Ortiz", role: "Design Engineer, Kinetic", relation: "Worked together", color: "#f9a8d4", text: "The most generous reviewer I've worked with. Every comment comes with a why, a fix and usually a CodeSandbox." },
  { name: "Arjun Mehta", role: "Staff Engineer, Kinetic", relation: "Reported to Maya", color: "#fcd34d", text: "She protects focus time, unblocks fast and somehow still ships more than anyone on the team." },
  { name: "Tom Becker", role: "Founder, Field Studio", relation: "Client", color: "#a78bfa", text: "Two Site of the Day awards in a year. Maya cares about the last 5% that most people skip." },
];

/** Recommendations from colleagues: swipeable stacked cards with keyboard arrows, relation labels and progress dots. */
export function PeerTestimonials() {
  const [[i, dir], set] = React.useState<[number, number]>([0, 0]);
  const go = (d: number) => set(([x]) => [(x + d + quotes.length) % quotes.length, d]);
  const q = quotes[i]!;
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
  };

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-16" onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}>
      <div className="text-center"><span className="font-mono text-xs uppercase tracking-widest text-accent">Kind words</span><h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">What people say</h2></div>
      <div className="relative h-[300px] w-full max-w-xl">
        {[2, 1].map((o) => (
          <div key={o} className="absolute inset-x-0 top-0 h-full rounded-3xl border border-border bg-surface" style={{ transform: `translateY(${o * 14}px) scale(${1 - o * 0.05})`, opacity: 1 - o * 0.35 }} />
        ))}
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.figure
            key={i}
            custom={dir}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            initial={{ x: dir * 300, opacity: 0, rotate: dir * 6 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: dir * -300, opacity: 0, rotate: dir * -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="absolute inset-0 flex cursor-grab flex-col gap-5 rounded-3xl border border-border-strong bg-surface-raised p-7 shadow-overlay active:cursor-grabbing"
          >
            <QuoteIcon size={26} className="text-accent" />
            <blockquote className="flex-1 text-lg leading-relaxed">{q.text}</blockquote>
            <figcaption className="flex items-center gap-3">
              <Avatar alt={q.name} color={q.color} />
              <div className="flex-1"><div className="font-semibold">{q.name}</div><div className="text-xs text-subtle">{q.role}</div></div>
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted">{q.relation}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Previous" onClick={() => go(-1)} className="flex size-10 items-center justify-center rounded-full border border-border hover:bg-surface-raised"><ArrowLeftIcon size={16} /></button>
        <div className="flex gap-1.5">
          {quotes.map((_, k) => <button key={k} type="button" aria-label={`Go to ${k + 1}`} onClick={() => set([k, k > i ? 1 : -1])} className="h-2 rounded-full bg-surface-overlay"><motion.span animate={{ width: k === i ? 24 : 8, background: k === i ? "var(--kn-accent)" : "var(--kn-border-strong)" }} className="block h-2 rounded-full" /></button>)}
        </div>
        <button type="button" aria-label="Next" onClick={() => go(1)} className="flex size-10 items-center justify-center rounded-full border border-border hover:bg-surface-raised"><ArrowRightIcon size={16} /></button>
      </div>
    </section>
  );
}
