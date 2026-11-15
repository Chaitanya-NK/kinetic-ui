"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRightIcon, XIcon } from "@kineticui/icons";

type Work = { id: string; title: string; client: string; kind: string; year: string; a: string; b: string; tall?: boolean; summary: string };
const work: Work[] = [
  { id: "w1", title: "Orbit Banking", client: "Orbit", kind: "Product", year: "2026", a: "#C6F432", b: "#0ea5e9", tall: true, summary: "A mobile bank built around motion: every balance change animates from where the money came from." },
  { id: "w2", title: "Field Notes", client: "Field", kind: "Brand", year: "2026", a: "#f9a8d4", b: "#a78bfa", summary: "Identity and type system for a research journal." },
  { id: "w3", title: "Pulse Dashboard", client: "Pulse Health", kind: "Product", year: "2025", a: "#34d399", b: "#0b0c0e", summary: "Real-time patient monitoring with calm, glanceable charts." },
  { id: "w4", title: "Tempo", client: "Tempo Records", kind: "Web", year: "2025", a: "#fcd34d", b: "#f97316", tall: true, summary: "An audio-reactive site for an independent record label." },
  { id: "w5", title: "Atlas Maps", client: "Atlas", kind: "Product", year: "2024", a: "#7dd3fc", b: "#1e3a8a", summary: "Offline-first trail maps with a 3D terrain view." },
  { id: "w6", title: "Kiln", client: "Kiln Ceramics", kind: "Brand", year: "2024", a: "#fb923c", b: "#78350f", summary: "Packaging and e-commerce for a ceramics studio." },
  { id: "w7", title: "Nightshift", client: "Nightshift", kind: "Web", year: "2024", a: "#a78bfa", b: "#111827", summary: "Launch site for a focus app, with scroll-driven scenes." },
];
const kinds = ["All", "Product", "Brand", "Web"];

/** Portfolio gallery: filterable masonry grid; cards expand into a shared-layout detail view. */
export function PortfolioGallery() {
  const [kind, setKind] = React.useState("All");
  const [open, setOpen] = React.useState<Work | null>(null);
  const list = work.filter((w) => kind === "All" || w.kind === kind);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-semibold tracking-tight">Selected work<span className="text-accent">.</span></h1>
        <div className="flex gap-4 text-sm">
          {kinds.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={`relative pb-1 ${kind === k ? "text-foreground" : "text-subtle hover:text-foreground"}`}>
              {k} <sup className="font-mono text-[10px] text-subtle">{k === "All" ? work.length : work.filter((w) => w.kind === k).length}</sup>
              {kind === k ? <motion.span layoutId="kn-pf-ul" className="absolute inset-x-0 -bottom-px h-px bg-accent" /> : null}
            </button>
          ))}
        </div>
      </div>
      <motion.div layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        <AnimatePresence mode="popLayout">
          {list.map((w) => (
            <motion.button
              layout
              layoutId={`kn-pf-${w.id}`}
              key={w.id}
              type="button"
              onClick={() => setOpen(w)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`group relative block w-full break-inside-avoid overflow-hidden rounded-2xl text-left ${w.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
              style={{ background: `linear-gradient(135deg, ${w.a}, ${w.b})` }}
            >
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
              <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-5 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <span className="text-white"><span className="block text-lg font-semibold">{w.title}</span><span className="text-sm text-white/70">{w.kind} · {w.year}</span></span>
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-black"><ArrowUpRightIcon size={16} /></span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {open ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
            <motion.div layoutId={`kn-pf-${open.id}`} role="dialog" aria-label={open.title} className="fixed inset-4 z-50 m-auto flex h-fit max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-3xl bg-surface-raised">
              <div className="aspect-[16/8]" style={{ background: `linear-gradient(135deg, ${open.a}, ${open.b})` }} />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} className="flex flex-col gap-4 p-7">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="font-display text-3xl font-semibold">{open.title}</h2><span className="text-sm text-subtle">{open.client} · {open.kind} · {open.year}</span></div>
                  <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="flex size-9 items-center justify-center rounded-full bg-surface-overlay"><XIcon size={16} /></button>
                </div>
                <p className="text-muted">{open.summary}</p>
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  {[["Role", "Design & build"], ["Timeline", "12 weeks"], ["Result", "+38% retention"]].map(([k, v]) => <div key={k} className="rounded-xl bg-surface p-3"><div className="text-subtle">{k}</div><div className="mt-1 text-foreground">{v}</div></div>)}
                </div>
              </motion.div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
