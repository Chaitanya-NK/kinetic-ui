"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, SearchInput } from "@kineticui/ui";
import { ArrowRightIcon, ChevronDownIcon, GlobeIcon, MapPinIcon } from "@kineticui/icons";

type Job = { title: string; team: string; location: string; type: string; salary: string; about: string };
const jobs: Job[] = [
  { title: "Senior Design Engineer", team: "Design", location: "Remote · EU", type: "Full-time", salary: "€90–120k", about: "Own the motion system and build components that set the bar for the industry." },
  { title: "Staff Frontend Engineer", team: "Engineering", location: "Bengaluru", type: "Full-time", salary: "₹60–80L", about: "Lead the registry and CLI, and shape how thousands of teams install UI." },
  { title: "Developer Advocate", team: "Growth", location: "Remote · US", type: "Full-time", salary: "$140–170k", about: "Write, speak and build demos that show what Kinetic UI makes possible." },
  { title: "Product Designer", team: "Design", location: "Lisbon", type: "Full-time", salary: "€70–90k", about: "Design blocks and templates used by startups and enterprises alike." },
  { title: "Support Engineer", team: "Engineering", location: "Remote", type: "Contract", salary: "$60–80/h", about: "Help customers ship faster and turn their feedback into fixes." },
];
const perks = [
  ["Remote-first", "Work from anywhere within ±4h of a teammate."],
  ["Learning budget", "$2,000 a year for books, courses and conferences."],
  ["Health", "Full cover for you and your family."],
  ["Time off", "30 days plus local holidays, and we check you take them."],
];

/** Careers page: mission header, perks, filterable job list with expandable rows and apply CTA. */
export function CareersPage() {
  const [team, setTeam] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string | null>(null);
  const teams = ["All", ...new Set(jobs.map((j) => j.team))];
  const list = jobs.filter((j) => (team === "All" || j.team === team) && `${j.title} ${j.location}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <div className="flex flex-col items-center gap-5 text-center">
        <Badge variant="soft" dot="pulse">We&apos;re hiring · {jobs.length} open roles</Badge>
        <h1 className="max-w-2xl font-display text-5xl font-semibold leading-tight tracking-tight">Build the interfaces people <span className="text-accent">feel</span></h1>
        <p className="max-w-xl text-lg text-muted">We&apos;re a small, remote-first team making UI that moves. Join us.</p>
        <div className="flex gap-6 pt-2 font-mono text-sm">
          {[["24", "people"], ["11", "countries"], ["4.9", "Glassdoor"]].map(([n, l]) => <span key={l}><b className="text-2xl text-foreground">{n}</b> <span className="text-subtle">{l}</span></span>)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map(([t, d], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft font-mono text-xs text-accent">0{i + 1}</span>
            <span className="font-semibold">{t}</span>
            <span className="text-sm text-muted">{d}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Open roles</h2>
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => <Button key={t} size="sm" variant={team === t ? "primary" : "secondary"} onClick={() => setTeam(t)}>{t}</Button>)}
            <SearchInput value={q} onValueChange={setQ} placeholder="Search roles" className="w-48" shortcut={null} />
          </div>
        </div>
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
          <AnimatePresence initial={false}>
            {list.map((j) => (
              <motion.li key={j.title} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface">
                <button type="button" aria-expanded={open === j.title} onClick={() => setOpen(open === j.title ? null : j.title)} className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 p-5 text-left hover:bg-surface-raised">
                  <span className="min-w-56 flex-1 font-semibold">{j.title}</span>
                  <span className="text-sm text-muted">{j.team}</span>
                  <span className="flex items-center gap-1 text-sm text-muted">{j.location.startsWith("Remote") ? <GlobeIcon size={13} /> : <MapPinIcon size={13} />}{j.location}</span>
                  <Badge size="sm">{j.type}</Badge>
                  <motion.span animate={{ rotate: open === j.title ? 180 : 0 }}><ChevronDownIcon size={16} className="text-subtle" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === j.title ? (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-5">
                        <div className="flex max-w-lg flex-col gap-2 text-sm text-muted"><p>{j.about}</p><span className="font-mono text-xs text-subtle">Compensation: {j.salary} + equity</span></div>
                        <Button size="sm">Apply <ArrowRightIcon size={14} /></Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {!list.length ? <p className="text-center text-sm text-subtle">No roles match. Send us an open application at jobs@kinetic.dev.</p> : null}
      </div>
    </section>
  );
}
