"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, Checkbox, Select, Slider, toast } from "@kineticui/ui";
import { CartIcon, GridIcon, HeartIcon, ListIcon, StarIcon } from "@kineticui/icons";

type P = { id: string; name: string; cat: string; price: number; was?: number; rating: number; colors: string[]; tag?: string };
const products: P[] = [
  { id: "1", name: "Aero Runner", cat: "Shoes", price: 129, was: 159, rating: 4.7, colors: ["#C6F432", "#111827", "#f9fafb"], tag: "Sale" },
  { id: "2", name: "Drift Hoodie", cat: "Apparel", price: 89, rating: 4.5, colors: ["#7dd3fc", "#1f2937"] },
  { id: "3", name: "Trail Pack 24L", cat: "Bags", price: 149, rating: 4.9, colors: ["#fcd34d", "#374151"], tag: "New" },
  { id: "4", name: "Pulse Cap", cat: "Apparel", price: 32, rating: 4.2, colors: ["#f9a8d4", "#111827", "#C6F432"] },
  { id: "5", name: "Glide Slide", cat: "Shoes", price: 49, rating: 4.1, colors: ["#a78bfa", "#f9fafb"] },
  { id: "6", name: "Orbit Tote", cat: "Bags", price: 59, was: 75, rating: 4.6, colors: ["#fb923c", "#111827"], tag: "Sale" },
  { id: "7", name: "Tempo Tee", cat: "Apparel", price: 35, rating: 4.4, colors: ["#34d399", "#f9fafb", "#111827"] },
  { id: "8", name: "Summit Boot", cat: "Shoes", price: 199, rating: 4.8, colors: ["#78350f", "#111827"], tag: "New" },
];
const cats = ["Shoes", "Apparel", "Bags"];

/** Product listing: category and price filters, sort, grid/list toggle, quick add with fly-to-cart and wishlist. */
export function ProductListing() {
  const [sel, setSel] = React.useState<string[]>([]);
  const [max, setMax] = React.useState([200]);
  const [sort, setSort] = React.useState("featured");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [liked, setLiked] = React.useState<Set<string>>(new Set(["3"]));
  const [cart, setCart] = React.useState(0);
  const [color, setColor] = React.useState<Record<string, number>>({});

  let list = products.filter((p) => (!sel.length || sel.includes(p.cat)) && p.price <= max[0]!);
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 p-6 md:grid-cols-[200px_1fr]">
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">Category</span>
          {cats.map((c) => <Checkbox key={c} label={`${c} (${products.filter((p) => p.cat === c).length})`} checked={sel.includes(c)} onCheckedChange={() => setSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))} />)}
        </div>
        <div className="flex flex-col gap-3">
          <span className="flex justify-between text-sm font-semibold">Max price <span className="font-mono font-normal text-accent">${max[0]}</span></span>
          <Slider aria-label="Max price" min={30} max={200} step={5} value={max} onValueChange={setMax} />
        </div>
        {sel.length || max[0]! < 200 ? <Button variant="ghost" size="sm" onClick={() => { setSel([]); setMax([200]); }}>Clear filters</Button> : null}
      </aside>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">{list.length} products</span>
          <div className="flex items-center gap-2">
            <Select aria-label="Sort" value={sort} onValueChange={setSort} className="w-44" options={[{ value: "featured", label: "Featured" }, { value: "low", label: "Price: low to high" }, { value: "high", label: "Price: high to low" }, { value: "rating", label: "Top rated" }]} />
            <div className="flex rounded-lg border border-border p-0.5">
              {(["grid", "list"] as const).map((v) => <button key={v} type="button" aria-label={`${v} view`} aria-pressed={view === v} onClick={() => setView(v)} className={`flex size-8 items-center justify-center rounded-md ${view === v ? "bg-surface-overlay text-foreground" : "text-subtle"}`}>{v === "grid" ? <GridIcon size={14} /> : <ListIcon size={14} />}</button>)}
            </div>
            <span className="relative flex size-10 items-center justify-center rounded-xl border border-border">
              <CartIcon size={16} />
              <AnimatePresence>{cart ? <motion.span key={cart} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">{cart}</motion.span> : null}</AnimatePresence>
            </span>
          </div>
        </div>
        <motion.div layout className={view === "grid" ? "grid grid-cols-2 gap-4 lg:grid-cols-3" : "flex flex-col gap-3"}>
          <AnimatePresence mode="popLayout">
            {list.map((p) => {
              const c = p.colors[color[p.id] ?? 0]!;
              return (
                <motion.div layout key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`group flex gap-3 rounded-2xl border border-border bg-surface p-3 ${view === "grid" ? "flex-col" : "items-center"}`}>
                  <div className={`relative overflow-hidden rounded-xl bg-surface-raised ${view === "grid" ? "aspect-square" : "size-24 shrink-0"}`}>
                    <motion.div key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style={{ background: `radial-gradient(circle at 50% 60%, ${c}, transparent 65%)` }} />
                    {p.tag ? <Badge size="sm" variant={p.tag === "Sale" ? "danger" : "solid"} className="absolute left-2 top-2">{p.tag}</Badge> : null}
                    <motion.button whileTap={{ scale: 0.8 }} type="button" aria-label={`Wishlist ${p.name}`} aria-pressed={liked.has(p.id)} onClick={() => setLiked((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/70 backdrop-blur">
                      <HeartIcon size={14} className={liked.has(p.id) ? "fill-danger text-danger" : ""} />
                    </motion.button>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2"><span className="font-medium">{p.name}</span><span className="flex items-center gap-0.5 text-xs text-subtle"><StarIcon size={11} className="fill-warning text-warning" />{p.rating}</span></div>
                    <div className="flex gap-1.5">{p.colors.map((cc, i) => <button key={cc} type="button" aria-label={`Colour ${i + 1}`} onClick={() => setColor((s) => ({ ...s, [p.id]: i }))} className={`size-4 rounded-full border border-border-strong ${(color[p.id] ?? 0) === i ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""}`} style={{ background: cc }} />)}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono"><b>${p.price}</b>{p.was ? <s className="ml-1.5 text-xs text-subtle">${p.was}</s> : null}</span>
                      <Button size="sm" variant="secondary" onClick={() => { setCart((n) => n + 1); toast.success(`${p.name} added to cart`); }}>Add</Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {!list.length ? <p className="py-16 text-center text-subtle">Nothing matches those filters.</p> : null}
      </div>
    </div>
  );
}
