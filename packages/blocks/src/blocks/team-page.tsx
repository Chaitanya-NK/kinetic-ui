"use client";

import * as React from "react";
import { motion } from "motion/react";
import { SocialIcon } from "@kineticui/ui";

const people = [
  { name: "Maya Kapoor", role: "Founder & CEO", color: "#C6F432", bio: "Previously design systems at a large fintech. Obsessed with details." , city: "Bengaluru" },
  { name: "Lena Ortiz", role: "Design Engineer", color: "#f9a8d4", bio: "Motion, type and the space between them.", city: "Lisbon" },
  { name: "Arjun Mehta", role: "Staff Engineer", color: "#7dd3fc", bio: "Registry, CLI and build tooling.", city: "Pune" },
  { name: "Sam Okafor", role: "Developer Advocate", color: "#fcd34d", bio: "Talks, docs and too many demos.", city: "Lagos" },
  { name: "Noor Haddad", role: "Product Designer", color: "#a78bfa", bio: "Blocks, templates and onboarding.", city: "Amman" },
  { name: "Kenji Sato", role: "Accessibility Lead", color: "#34d399", bio: "Makes sure everything works with a keyboard.", city: "Osaka" },
  { name: "Ines Moreau", role: "Engineering Manager", color: "#fb923c", bio: "Keeps the team shipping and sane.", city: "Lyon" },
  { name: "Theo Brandt", role: "Support Engineer", color: "#f87171", bio: "First responder for every bug report.", city: "Berlin" },
];
const initials = (n: string) => n.split(" ").map((p) => p[0]).join("");

/** Team grid: cards tilt toward the cursor and flip to show a bio and social links. */
export function TeamPage() {
  const [flipped, setFlipped] = React.useState<string | null>(null);
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-col gap-3 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">Team</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight">The people behind the pixels</h1>
        <p className="mx-auto max-w-lg text-muted">Eight people in eight cities. Click a card to say hello.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" style={{ perspective: 1000 }}>
        {people.map((p, i) => (
          <motion.button
            key={p.name}
            type="button"
            aria-label={`${p.name}, ${p.role}`}
            onClick={() => setFlipped(flipped === p.name ? null : p.name)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="relative aspect-[3/4] text-left"
          >
            <motion.div animate={{ rotateY: flipped === p.name ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="relative size-full" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-2xl border border-border bg-surface p-4" style={{ backfaceVisibility: "hidden" }}>
                <div className="absolute inset-0 opacity-90" style={{ background: `radial-gradient(circle at 50% 35%, ${p.color}, transparent 60%)` }} />
                <span className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 font-display text-6xl font-bold text-[#0b0c0e]/80">{initials(p.name)}</span>
                <div className="relative rounded-xl bg-background/70 p-3 backdrop-blur">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted">{p.role}</div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col gap-3 rounded-2xl border border-accent/40 bg-surface-raised p-5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                <span className="font-semibold">{p.name}</span>
                <span className="font-mono text-xs text-accent">{p.city}</span>
                <p className="flex-1 text-sm text-muted">{p.bio}</p>
                <div className="flex gap-2 text-muted">
                  {(["x", "linkedin", "github"] as const).map((n) => <span key={n} className="flex size-8 items-center justify-center rounded-lg bg-surface-overlay"><SocialIcon network={n} size={14} /></span>)}
                </div>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
