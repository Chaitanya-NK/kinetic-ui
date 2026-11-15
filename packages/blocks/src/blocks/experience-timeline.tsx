"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Badge } from "@kineticui/ui";
import { BriefcaseIcon, GraduationCapIcon, TrophyIcon } from "@kineticui/icons";

const entries = [
  { kind: "work", title: "Senior Design Engineer", org: "Kinetic", period: "2024 — Now", text: "Motion system, registry and docs for a library used by 48k developers.", tags: ["React", "Motion", "Design systems"] },
  { kind: "award", title: "Speaker, React India", org: "Goa", period: "2025", text: "Talk: \"Springs, not durations\" — on interruptible UI.", tags: ["Talk"] },
  { kind: "work", title: "Frontend Engineer", org: "Orbit", period: "2021 — 2024", text: "Animated money movement redesign that lifted 30-day retention 38%.", tags: ["React Native", "Fintech"] },
  { kind: "work", title: "UI Developer", org: "Field Studio", period: "2019 — 2021", text: "Marketing sites and prototypes for 20+ clients; two Awwwards SOTD.", tags: ["WebGL", "Agency"] },
  { kind: "edu", title: "B.Des, Interaction Design", org: "NID Bengaluru", period: "2015 — 2019", text: "Thesis on haptics and motion as feedback in touch interfaces.", tags: ["Design"] },
] as const;
const icons = { work: BriefcaseIcon, award: TrophyIcon, edu: GraduationCapIcon };

/** Alternating vertical timeline whose spine fills as you scroll, with entries sliding in from each side. */
export function ExperienceTimeline() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="text-center"><span className="font-mono text-xs uppercase tracking-widest text-accent">Journey</span><h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Experience</h2></div>
      <div ref={ref} className="relative">
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />
        <motion.div style={{ scaleY: fill }} className="absolute bottom-0 left-5 top-0 w-0.5 origin-top bg-accent md:left-1/2 md:-translate-x-1/2" />
        <ol className="flex flex-col gap-10">
          {entries.map((e, i) => {
            const I = icons[e.kind];
            const left = i % 2 === 0;
            return (
              <li key={e.title} className="relative grid items-center md:grid-cols-2 md:gap-12">
                <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: "-40% 0px" }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="absolute left-5 top-4 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-background bg-accent text-accent-foreground md:left-1/2">
                  <I size={16} />
                </motion.span>
                <motion.div initial={{ opacity: 0, x: left ? -40 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20% 0px" }} transition={{ type: "spring", stiffness: 140, damping: 20 }} className={`ml-14 flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 md:ml-0 ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}>
                  <span className="font-mono text-xs text-accent">{e.period}</span>
                  <span className="text-lg font-semibold">{e.title}</span>
                  <span className="text-sm text-subtle">{e.org}</span>
                  <p className="text-sm text-muted">{e.text}</p>
                  <div className={`flex flex-wrap gap-1.5 ${left ? "md:justify-end" : ""}`}>{e.tags.map((t) => <Badge key={t} size="sm">{t}</Badge>)}</div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
