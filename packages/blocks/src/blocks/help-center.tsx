"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Accordion, AccordionItem, Button } from "@kineticui/ui";
import { BookIcon, ChatIcon, CardIcon, SearchIcon, ShieldIcon, UserIcon, BoltIcon } from "@kineticui/icons";

const cats = [
  { icon: BoltIcon, title: "Getting started", count: 12 },
  { icon: UserIcon, title: "Account & team", count: 9 },
  { icon: CardIcon, title: "Billing", count: 14 },
  { icon: ShieldIcon, title: "Security", count: 7 },
  { icon: BookIcon, title: "Guides", count: 23 },
  { icon: ChatIcon, title: "Integrations", count: 11 },
];
const articles = ["How do I install the CLI?", "Change the accent colour", "Invite teammates to a workspace", "Update my billing details", "Enable two-factor authentication", "Use Kinetic UI with Remix", "Cancel my subscription", "Export invoices as PDF"];
const faqs = [
  ["Can I use Kinetic UI in commercial projects?", "Yes. The components are MIT licensed. Pro blocks are licensed per team and can ship in unlimited projects."],
  ["Do I need Tailwind?", "Yes, Tailwind CSS v4. The tokens are plain CSS variables, so you can still theme without touching Tailwind config."],
  ["How do updates work with copied components?", "Run `kinetic diff` to see upstream changes and pick what to merge. Packages update like any npm dependency."],
];

/** Help center: hero search with live suggestions, category grid, popular articles, FAQ and contact CTA. */
export function HelpCenter() {
  const [q, setQ] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const hits = q ? articles.filter((a) => a.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <section className="flex flex-col">
      <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_at_top,var(--kn-accent-soft),transparent_70%)] px-6 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight">How can we help?</h1>
          <div className="relative w-full">
            <div className={`flex h-14 items-center gap-3 rounded-2xl border bg-surface px-5 transition-shadow ${focus ? "border-accent shadow-[0_0_0_4px_var(--kn-accent-soft)]" : "border-border-strong"}`}>
              <SearchIcon size={18} className="text-subtle" />
              <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder="Search articles, e.g. billing" aria-label="Search help articles" className="flex-1 bg-transparent outline-none placeholder:text-subtle" />
            </div>
            <AnimatePresence>
              {focus && q ? (
                <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border-strong bg-surface-raised p-1.5 text-left shadow-overlay">
                  {hits.length ? hits.map((h) => (
                    <li key={h}><a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-overlay"><BookIcon size={14} className="text-subtle" />{h}</a></li>
                  )) : <li className="px-3 py-4 text-sm text-subtle">No articles for &ldquo;{q}&rdquo;. Try contacting support.</li>}
                </motion.ul>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-subtle">Popular: {["install", "billing", "two-factor"].map((t) => <button key={t} type="button" onClick={() => setQ(t)} className="rounded-full border border-border px-2.5 py-0.5 hover:text-foreground">{t}</button>)}</div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-14">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {cats.map((c, i) => (
            <motion.a key={c.title} href="#" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 hover:border-accent/50">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><c.icon size={18} /></span>
              <span className="font-semibold">{c.title}</span>
              <span className="text-xs text-subtle">{c.count} articles</span>
            </motion.a>
          ))}
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">Popular articles</h2>
            {articles.slice(0, 5).map((a) => <a key={a} href="#" className="border-b border-border py-2.5 text-sm text-muted hover:text-foreground">{a}</a>)}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold">FAQ</h2>
            <Accordion type="single" collapsible>
              {faqs.map(([qq, a]) => <AccordionItem key={qq} value={qq!} title={qq}><p className="text-sm text-muted">{a}</p></AccordionItem>)}
            </Accordion>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-8 text-center">
          <span className="font-semibold">Still stuck?</span>
          <span className="text-sm text-muted">Our team usually replies within 2 hours.</span>
          <Button><ChatIcon size={15} /> Contact support</Button>
        </div>
      </div>
    </section>
  );
}
