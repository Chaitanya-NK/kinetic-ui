"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { SearchInput } from "@kineticui/ui";
import { ArrowRightIcon } from "@kineticui/icons";

export type BrowserItem = { name: string; title: string; description: string; category: string; thumb: string | null };
export type BrowserCategory = { id: string; label: string; count: number };

const STAGE_W = 720;

/** Live demo in an isolated iframe, mounted only while the card is hovered (so global shortcuts never clash). */
function LivePreview({ slug }: { slug: string }) {
  const box = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.5);
  const [ready, setReady] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e!.contentRect.width / STAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="absolute inset-0">
      <motion.iframe
        src={`/demo/${slug}`}
        title=""
        tabIndex={-1}
        onLoad={() => setReady(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        className="absolute left-0 top-0 origin-top-left border-0"
        style={{ width: STAGE_W, height: STAGE_W / 1.6, transform: `scale(${scale})` }}
      />
    </div>
  );
}

function Card({ item, index }: { item: BrowserItem; index: number }) {
  const [live, setLive] = React.useState(false);
  const timer = React.useRef<number>(undefined);
  const canHover = React.useRef(false);
  React.useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: Math.min(index, 12) * 0.02, type: "spring", stiffness: 260, damping: 26 }}>
      <Link
        href={`/components/${item.name}`}
        onPointerEnter={() => {
          if (!canHover.current) return;
          timer.current = window.setTimeout(() => setLive(true), 350);
        }}
        onPointerLeave={() => {
          window.clearTimeout(timer.current);
          setLive(false);
        }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_20px_40px_-20px_rgba(198,244,50,0.25)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-background" aria-hidden>
          {item.thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumb} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-2xl text-subtle">{item.title}</div>
          )}
          {live ? <LivePreview slug={item.name} /> : null}
          <span className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 font-mono text-[10px] text-subtle opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            {live ? "live" : "hover"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <span className="flex items-center justify-between font-medium">
            {item.title}
            <ArrowRightIcon size={14} className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </span>
          <span className="line-clamp-2 text-sm leading-relaxed text-muted">{item.description}</span>
        </div>
      </Link>
    </motion.div>
  );
}

/** Searchable, filterable grid of every component with thumbnails and live hover previews. */
export function ComponentsBrowser({ items, categories }: { items: BrowserItem[]; categories: BrowserCategory[] }) {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");

  // Deep links like /components#forms select that category.
  React.useEffect(() => {
    const apply = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (categories.some((c) => c.id === h)) setCat(h);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [categories]);

  const query = q.trim().toLowerCase();
  const list = items.filter((i) => (cat === "all" || i.category === cat) && (!query || `${i.title} ${i.name} ${i.description}`.toLowerCase().includes(query)));
  const grouped = cat === "all" && !query
    ? categories.map((c) => ({ ...c, items: list.filter((i) => i.category === c.id) })).filter((g) => g.items.length)
    : [{ id: "results", label: "", count: list.length, items: list }];

  const choose = (id: string) => {
    setCat(id);
    history.replaceState(null, "", id === "all" ? location.pathname : `#${id}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-16 z-20 -mx-4 flex flex-col gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <SearchInput value={q} onValueChange={setQ} placeholder={`Search ${items.length} components`} meta={query ? `${list.length} found` : undefined} />
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {[{ id: "all", label: "All", count: items.length }, ...categories].map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => choose(c.id)} className="relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm">
              {cat === c.id ? <motion.span layoutId="kn-cat-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : <span className="absolute inset-0 rounded-full border border-border" />}
              <span className={`relative ${cat === c.id ? "font-medium text-accent-foreground" : "text-muted"}`}>{c.label}</span>
              <span className={`relative font-mono text-[10px] ${cat === c.id ? "text-accent-foreground/70" : "text-subtle"}`}>{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {grouped.map((g) => (
        <section key={g.id} id={g.id === "results" ? undefined : `cat-${g.id}`} className="flex scroll-mt-40 flex-col gap-4">
          {g.label ? (
            <h2 className="flex items-baseline gap-2 font-display text-2xl font-semibold tracking-tight">
              {g.label} <span className="font-mono text-xs font-normal text-subtle">{g.items.length}</span>
            </h2>
          ) : null}
          <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {g.items.map((item, i) => <Card key={item.name} item={item} index={i} />)}
            </AnimatePresence>
          </motion.div>
        </section>
      ))}
      {!list.length ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border-strong py-16 text-center">
          <span className="font-medium">Nothing matches &ldquo;{q}&rdquo;</span>
          <button type="button" onClick={() => { setQ(""); choose("all"); }} className="text-sm text-accent">Clear search</button>
        </div>
      ) : null}
    </div>
  );
}
