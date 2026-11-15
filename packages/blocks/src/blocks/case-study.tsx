"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { AreaChart, Badge } from "@kineticui/ui";
import { QuoteIcon } from "@kineticui/icons";

const growth = [
  { m: "Jan", before: 42, after: 42 }, { m: "Feb", before: 44, after: 48 }, { m: "Mar", before: 43, after: 55 },
  { m: "Apr", before: 45, after: 61 }, { m: "May", before: 46, after: 66 }, { m: "Jun", before: 47, after: 72 },
];

/** Case study: parallax hero, at-a-glance facts, challenge/solution/result sections, metric chart and a pull quote. */
export function CaseStudy() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <article className="flex flex-col">
      <div ref={ref} className="relative flex min-h-[460px] items-end overflow-hidden px-6 pb-12 pt-24">
        <motion.div style={{ y, scale }} className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#C6F432,transparent_45%),radial-gradient(circle_at_80%_20%,#0ea5e9,transparent_40%),linear-gradient(var(--kn-surface),var(--kn-background))]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-4">
          <div className="flex gap-2"><Badge variant="solid">Case study</Badge><Badge>Fintech</Badge></div>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight">How Orbit lifted retention 38% by making money move</h1>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-10 text-[17px] leading-8 text-muted">
          {[
            ["The challenge", "Orbit's app felt static. Users didn't trust balance updates because numbers changed without explanation, and support tickets about \"missing money\" were the top category."],
            ["The approach", "We rebuilt every money movement as a physical animation: transfers fly between accounts, balances roll digit by digit, and pending items pulse until settled. All on Kinetic UI springs, with reduced-motion fallbacks."],
          ].map(([h, t], i) => (
            <motion.section key={h} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col gap-3">
              <span className="font-mono text-xs text-accent">0{i + 1}</span>
              <h2 className="font-display text-2xl font-semibold text-foreground">{h}</h2>
              <p>{t}</p>
            </motion.section>
          ))}
          <figure className="relative rounded-3xl border border-border bg-surface p-8">
            <QuoteIcon size={28} className="text-accent" />
            <blockquote className="mt-3 font-display text-2xl leading-snug text-foreground">Support tickets about balances dropped by two-thirds in the first month. People finally understood where their money went.</blockquote>
            <figcaption className="mt-4 text-sm text-subtle">Priya Raman, Head of Product at Orbit</figcaption>
          </figure>
          <section className="flex flex-col gap-4">
            <span className="font-mono text-xs text-accent">03</span>
            <h2 className="font-display text-2xl font-semibold text-foreground">The result</h2>
            <p>Thirty-day retention climbed steadily after launch while the control group stayed flat.</p>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <AreaChart data={growth} index="m" series={[{ key: "after", name: "With motion", color: "var(--kn-accent)" }, { key: "before", name: "Control", color: "var(--kn-muted)" }]} height={220} format={(v) => `${v}%`} showLegend />
            </div>
          </section>
        </div>
        <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-8">
          {[["Client", "Orbit"], ["Industry", "Fintech"], ["Timeline", "12 weeks"], ["Services", "Product design, Motion, Engineering"]].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 text-sm"><span className="text-xs text-subtle">{k}</span><span>{v}</span></div>
          ))}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-5">
            {[["+38%", "Retention"], ["-64%", "Tickets"], ["4.8", "App rating"], ["2.1x", "Referrals"]].map(([n, l]) => (
              <div key={l}><div className="font-display text-2xl font-semibold text-accent">{n}</div><div className="text-xs text-subtle">{l}</div></div>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}
