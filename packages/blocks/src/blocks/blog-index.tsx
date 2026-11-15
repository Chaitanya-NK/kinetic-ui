"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, SearchInput } from "@kineticui/ui";
import { ArrowRightIcon } from "@kineticui/icons";

type Post = { title: string; excerpt: string; tag: string; author: string; color: string; date: string; read: number; hue: string };

const posts: Post[] = [
  { title: "Designing motion that feels physical", excerpt: "How we tuned every spring so interfaces respond like real objects.", tag: "Engineering", author: "Lena Ortiz", color: "#f9a8d4", date: "Nov 12", read: 8, hue: "#C6F432" },
  { title: "Kinetic UI 1.0 is here", excerpt: "164 components, 78 blocks, a CLI and a registry that works with shadcn.", tag: "Product", author: "Maya Kapoor", color: "#C6F432", date: "Nov 4", read: 4, hue: "#7dd3fc" },
  { title: "Container queries changed how we build cards", excerpt: "Components that adapt to where they are placed, not the window.", tag: "Engineering", author: "Arjun Mehta", color: "#7dd3fc", date: "Oct 28", read: 6, hue: "#fcd34d" },
  { title: "Accessible drag and drop", excerpt: "Keyboard, screen reader and touch support for the Kanban board.", tag: "Accessibility", author: "Sam Okafor", color: "#fcd34d", date: "Oct 19", read: 7, hue: "#f9a8d4" },
  { title: "A dark theme that isn't just inverted", excerpt: "Building a surface ladder so elevation reads in the dark.", tag: "Design", author: "Lena Ortiz", color: "#f9a8d4", date: "Oct 10", read: 5, hue: "#a78bfa" },
  { title: "What we learned shipping a registry", excerpt: "One source of truth for npm packages and copy-paste components.", tag: "Product", author: "Maya Kapoor", color: "#C6F432", date: "Sep 30", read: 9, hue: "#34d399" },
];
const tags = ["All", "Engineering", "Design", "Product", "Accessibility"];

/** Blog index: featured post, tag filters with a sliding pill, search and an animated card grid. */
export function BlogIndex() {
  const [tag, setTag] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [featured, ...rest] = posts;
  const list = rest.filter((p) => (tag === "All" || p.tag === tag) && p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">Blog</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Notes from the team</h1>
      </div>
      <a href="#" className="group grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2">
        <div className="relative min-h-56 overflow-hidden bg-surface-raised">
          <motion.div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 40%, ${featured!.hue}, transparent 55%), radial-gradient(circle at 80% 80%, #7dd3fc, transparent 45%)` }} whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }} />
        </div>
        <div className="flex flex-col justify-center gap-4 p-8">
          <span className="text-xs font-medium text-accent">Featured · {featured!.tag}</span>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">{featured!.title}</h2>
          <p className="text-muted">{featured!.excerpt}</p>
          <div className="flex items-center gap-2 text-sm text-subtle"><Avatar alt={featured!.author} color={featured!.color} size="sm" /> {featured!.author} · {featured!.date} · {featured!.read} min</div>
          <span className="flex items-center gap-1 text-sm font-medium">Read article <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-1" /></span>
        </div>
      </a>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => setTag(t)} className="relative h-8 rounded-full px-3.5 text-sm">
              {tag === t ? <motion.span layoutId="kn-blog-tag" className="absolute inset-0 rounded-full bg-surface-overlay" transition={{ type: "spring", stiffness: 400, damping: 32 }} /> : null}
              <span className={`relative ${tag === t ? "text-foreground" : "text-muted"}`}>{t}</span>
            </button>
          ))}
        </div>
        <SearchInput value={q} onValueChange={setQ} placeholder="Search posts" className="w-full sm:w-64" pill />
      </div>
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <motion.a layout key={p.title} href="#" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-border-strong">
              <div className="aspect-[16/9] overflow-hidden rounded-xl bg-surface-raised">
                <div className="size-full transition-transform duration-500 group-hover:scale-105" style={{ background: `radial-gradient(circle at 70% 30%, ${p.hue}, transparent 60%)` }} />
              </div>
              <div className="flex flex-col gap-2 px-2 pb-2">
                <span className="text-xs text-accent">{p.tag}</span>
                <h3 className="font-semibold leading-snug">{p.title}</h3>
                <p className="text-sm text-muted">{p.excerpt}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-subtle"><Avatar alt={p.author} color={p.color} size="sm" /> {p.author} · {p.date} · {p.read} min</div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length ? <p className="py-10 text-center text-subtle">No posts match.</p> : null}
    </section>
  );
}
