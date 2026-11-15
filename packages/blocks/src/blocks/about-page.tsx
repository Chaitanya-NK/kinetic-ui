"use client";

import * as React from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { AvatarStack, Button } from "@kineticui/ui";
import { ArrowRightIcon } from "@kineticui/icons";

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const v = useMotionValue(0);
  const text = useTransform(v, (x) => `${Math.round(x).toLocaleString("en-US")}${suffix}`);
  React.useEffect(() => {
    if (inView) void animate(v, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
  }, [inView, to, v]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

const story = [
  { year: "2023", title: "A side project", text: "Two friends frustrated by lifeless component libraries start sketching springs in CodePen." },
  { year: "2024", title: "First release", text: "40 components and a tweet that hit the front page of Hacker News." },
  { year: "2025", title: "Going full-time", text: "Seed round from people who build tools we love. Team of six." },
  { year: "2026", title: "Kinetic UI 1.0", text: "164 components, 78 blocks, a CLI and a registry used by thousands of teams." },
];
const values = [["Feel first", "If it doesn't feel right, it isn't done."], ["Own your code", "Copy it, change it, it's yours."], ["Access for all", "Keyboard, screen reader and reduced motion, always."]];

/** About page: mission statement, animated counters, story timeline and values. */
export function AboutPage() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-20 px-6 py-16">
      <div className="flex flex-col gap-6">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">About us</span>
        <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.1] tracking-tight">We believe software should <span className="italic text-accent">move</span> like the real world does.</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <AvatarStack avatars={[{ alt: "Maya Kapoor", color: "#C6F432" }, { alt: "Lena Ortiz", color: "#f9a8d4" }, { alt: "Arjun Mehta", color: "#7dd3fc" }, { alt: "Sam Okafor", color: "#fcd34d" }, { alt: "Noor Haddad", color: "#a78bfa" }]} />
          A team of 24 across 11 countries
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {[[48000, "+", "Developers"], [164, "", "Components"], [3200000, "", "Weekly downloads"], [99, "%", "Lighthouse a11y"]].map(([n, s, l]) => (
          <div key={l as string} className="flex flex-col gap-1 bg-surface p-6">
            <span className="font-display text-3xl font-semibold tracking-tight"><Count to={n as number} suffix={s as string} /></span>
            <span className="text-sm text-subtle">{l}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <h2 className="font-display text-2xl font-semibold">Our story</h2>
        <ol className="relative flex flex-col gap-8 border-l border-border pl-8">
          {story.map((s, i) => (
            <motion.li key={s.year} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.08 }} className="relative flex flex-col gap-1">
              <span className="absolute -left-[37px] top-1 size-3 rounded-full border-2 border-accent bg-background" />
              <span className="font-mono text-xs text-accent">{s.year}</span>
              <span className="font-semibold">{s.title}</span>
              <span className="text-muted">{s.text}</span>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {values.map(([t, d], i) => (
          <motion.div key={t} whileHover={{ y: -4 }} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
            <span className="font-display text-5xl font-bold text-accent/30">0{i + 1}</span>
            <span className="text-lg font-semibold">{t}</span>
            <span className="text-muted">{d}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-accent p-8 text-accent-foreground sm:flex-row sm:items-center">
        <div><div className="font-display text-2xl font-semibold">Want to build with us?</div><div className="opacity-70">We&apos;re hiring designers and engineers.</div></div>
        <Button variant="secondary" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">See open roles <ArrowRightIcon size={15} /></Button>
      </div>
    </section>
  );
}
