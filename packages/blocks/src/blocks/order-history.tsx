"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge, Button, SearchInput, SegmentedControl } from "@kineticui/ui";
import { ChevronDownIcon, DownloadIcon, RepeatIcon, TruckIcon } from "@kineticui/icons";

type Order = { id: string; date: string; status: "Delivered" | "Shipped" | "Processing" | "Cancelled"; total: number; items: { name: string; qty: number; price: number; hue: string }[]; eta?: string };
const orders: Order[] = [
  { id: "KN-48213", date: "Nov 12, 2026", status: "Shipped", total: 278, eta: "Arrives Thu, Nov 17", items: [{ name: "Aero Runner", qty: 1, price: 129, hue: "#C6F432" }, { name: "Trail Pack 24L", qty: 1, price: 149, hue: "#fcd34d" }] },
  { id: "KN-47120", date: "Nov 3, 2026", status: "Processing", total: 67, items: [{ name: "Pulse Cap", qty: 1, price: 32, hue: "#f9a8d4" }, { name: "Tempo Tee", qty: 1, price: 35, hue: "#34d399" }] },
  { id: "KN-45002", date: "Oct 18, 2026", status: "Delivered", total: 89, items: [{ name: "Drift Hoodie", qty: 1, price: 89, hue: "#7dd3fc" }] },
  { id: "KN-43911", date: "Sep 29, 2026", status: "Delivered", total: 398, items: [{ name: "Summit Boot", qty: 2, price: 199, hue: "#fb923c" }] },
  { id: "KN-42005", date: "Sep 2, 2026", status: "Cancelled", total: 59, items: [{ name: "Orbit Tote", qty: 1, price: 59, hue: "#a78bfa" }] },
];
const v = { Delivered: "success", Shipped: "info", Processing: "warning", Cancelled: "neutral" } as const;

/** Order history: status filter and search, expandable order rows with items, tracking, invoice and buy-again. */
export function OrderHistory() {
  const [filter, setFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<string | null>("KN-48213");
  const list = orders.filter((o) => (filter === "all" || (filter === "open" ? ["Shipped", "Processing"].includes(o.status) : o.status === "Delivered")) && (o.id + o.items.map((i) => i.name).join()).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div><h1 className="font-display text-2xl font-semibold">Orders</h1><p className="text-sm text-muted">Track, return or buy things again.</p></div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl aria-label="Filter" defaultValue="all" value={filter} onValueChange={setFilter} options={[{ value: "all", label: "All" }, { value: "open", label: "In progress" }, { value: "done", label: "Delivered" }]} />
        <SearchInput value={q} onValueChange={setQ} placeholder="Order # or product" className="w-60" shortcut={null} />
      </div>
      <ul className="flex flex-col gap-3">
        {list.map((o) => {
          const isOpen = open === o.id;
          return (
            <motion.li key={o.id} layout className="overflow-hidden rounded-2xl border border-border bg-surface">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 p-4 text-left hover:bg-surface-raised/50">
                <div className="flex -space-x-3">
                  {o.items.map((i) => <span key={i.name} className="size-11 rounded-xl border-2 border-surface" style={{ background: `radial-gradient(circle at 50% 60%, ${i.hue}, var(--kn-surface-raised) 70%)` }} />)}
                </div>
                <div className="flex min-w-32 flex-1 flex-col"><span className="font-mono text-sm">{o.id}</span><span className="text-xs text-subtle">{o.date} · {o.items.reduce((a, i) => a + i.qty, 0)} items</span></div>
                <Badge variant={v[o.status]} size="sm" dot={o.status === "Shipped" ? "pulse" : true}>{o.status}</Badge>
                <span className="w-16 text-right font-mono font-semibold">${o.total}</span>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDownIcon size={16} className="text-subtle" /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="flex flex-col gap-4 border-t border-border p-4">
                      {o.eta ? (
                        <div className="flex items-center gap-3 rounded-xl bg-info-soft p-3 text-sm">
                          <TruckIcon size={16} className="text-info" /><span className="flex-1">{o.eta}</span>
                          <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-background/50 sm:block"><motion.div initial={{ width: 0 }} animate={{ width: "66%" }} transition={{ duration: 1 }} className="h-full bg-info" /></div>
                        </div>
                      ) : null}
                      {o.items.map((i) => (
                        <div key={i.name} className="flex items-center gap-3 text-sm">
                          <span className="size-12 rounded-lg" style={{ background: `radial-gradient(circle at 50% 60%, ${i.hue}, var(--kn-surface-raised) 70%)` }} />
                          <span className="flex-1">{i.name} <span className="text-subtle">× {i.qty}</span></span>
                          <span className="font-mono">${i.price * i.qty}</span>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                        {o.status === "Shipped" ? <Button size="sm"><TruckIcon size={14} /> Track package</Button> : null}
                        {o.status === "Delivered" ? <Button size="sm"><RepeatIcon size={14} /> Buy again</Button> : null}
                        <Button size="sm" variant="secondary"><DownloadIcon size={14} /> Invoice</Button>
                        {o.status === "Delivered" ? <Button size="sm" variant="ghost">Return items</Button> : null}
                        {o.status === "Processing" ? <Button size="sm" variant="ghost" className="text-danger">Cancel order</Button> : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
      {!list.length ? <p className="py-10 text-center text-subtle">No orders found.</p> : null}
    </div>
  );
}
