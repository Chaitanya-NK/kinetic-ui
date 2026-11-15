"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, toast } from "@kineticui/ui";
import { BellIcon, CartIcon, HeartIcon, ShareIcon, TrendingDownIcon, XIcon } from "@kineticui/icons";

type W = { id: string; name: string; price: number; was?: number; stock: "in" | "low" | "out"; hue: string; added: string };
const seed: W[] = [
  { id: "1", name: "Trail Pack 24L", price: 129, was: 149, stock: "in", hue: "#fcd34d", added: "2 days ago" },
  { id: "2", name: "Summit Boot", price: 199, stock: "low", hue: "#fb923c", added: "1 week ago" },
  { id: "3", name: "Drift Hoodie", price: 89, stock: "out", hue: "#7dd3fc", added: "2 weeks ago" },
  { id: "4", name: "Aero Runner", price: 129, was: 159, stock: "in", hue: "#C6F432", added: "1 month ago" },
];

/** Wishlist: saved items with price-drop and stock badges, move to cart, back-in-stock alerts, remove with undo, share. */
export function Wishlist() {
  const [items, setItems] = React.useState(seed);
  const [alerts, setAlerts] = React.useState<Set<string>>(new Set());
  const [cart, setCart] = React.useState<string[]>([]);
  const total = items.reduce((a, i) => a + (i.stock !== "out" ? i.price : 0), 0);
  const savings = items.reduce((a, i) => a + (i.was ? i.was - i.price : 0), 0);

  const remove = (it: W) => {
    const idx = items.findIndex((x) => x.id === it.id);
    setItems((xs) => xs.filter((x) => x.id !== it.id));
    toast.info(`Removed ${it.name}`, { action: { label: "Undo", onClick: () => setItems((xs) => { const n = [...xs]; n.splice(idx, 0, it); return n; }) } });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-danger-soft text-danger"><HeartIcon size={20} className="fill-current" /></span>
          <div><h1 className="font-display text-2xl font-semibold">Wishlist</h1><p className="text-sm text-muted">{items.length} saved · ${total} available{savings ? <span className="text-success"> · ${savings} in price drops</span> : null}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast.success("Wishlist link copied")}><ShareIcon size={14} /> Share list</Button>
          <Button size="sm" disabled={!items.some((i) => i.stock !== "out" && !cart.includes(i.id))} onClick={() => { setCart(items.filter((i) => i.stock !== "out").map((i) => i.id)); toast.success("Added all available items"); }}><CartIcon size={14} /> Add all to cart</Button>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map((it) => (
            <motion.li key={it.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60, height: 0, marginBottom: -12 }} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-raised">
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 60%, ${it.hue}, transparent 65%)` }} />
                {it.stock === "out" ? <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-[10px] font-semibold uppercase tracking-wider">Sold out</div> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="font-medium">{it.name}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold">${it.price}</span>
                  {it.was ? <><s className="font-mono text-xs text-subtle">${it.was}</s><Badge size="sm" variant="success"><TrendingDownIcon size={11} /> ${it.was - it.price} off</Badge></> : null}
                  {it.stock === "low" ? <Badge size="sm" variant="warning" dot="pulse">Only 2 left</Badge> : null}
                </div>
                <span className="text-xs text-subtle">Added {it.added}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {it.stock === "out" ? (
                  <Button size="sm" variant={alerts.has(it.id) ? "soft" : "secondary"} onClick={() => setAlerts((s) => { const n = new Set(s); if (n.has(it.id)) n.delete(it.id); else n.add(it.id); return n; })}>
                    <BellIcon size={14} /> {alerts.has(it.id) ? "We'll notify you" : "Notify me"}
                  </Button>
                ) : (
                  <Button size="sm" variant={cart.includes(it.id) ? "soft" : "primary"} onClick={() => setCart((c) => (c.includes(it.id) ? c : [...c, it.id]))}>
                    <CartIcon size={14} /> {cart.includes(it.id) ? "In cart" : "Move to cart"}
                  </Button>
                )}
                <button type="button" onClick={() => remove(it)} className="flex items-center gap-1 text-xs text-subtle hover:text-danger"><XIcon size={12} /> Remove</button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!items.length ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border-strong py-16 text-center">
          <HeartIcon size={28} className="text-subtle" />
          <span className="font-semibold">Your wishlist is empty</span>
          <span className="text-sm text-muted">Tap the heart on any product to save it here.</span>
          <Button size="sm" onClick={() => setItems(seed)}>Browse products</Button>
        </div>
      ) : null}
    </div>
  );
}
