"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, EmptyState, NumberInput, Progress, Separator, toast } from "@kineticui/ui";
import { CartIcon, TrashIcon, BoltIcon } from "@kineticui/icons";

type Line = { id: string; name: string; variant: string; price: number; qty: number; color: string };
const initial: Line[] = [
  { id: "1", name: "Stride Runner", variant: "Lime · EU 42", price: 149, qty: 1, color: "#C6F432" },
  { id: "2", name: "Merino Crew Socks", variant: "Charcoal · M", price: 18, qty: 3, color: "#7C8CFF" },
  { id: "3", name: "Trail Cap", variant: "Sand · One size", price: 32, qty: 1, color: "#F4A86A" },
];
const FREE_SHIP = 250;
const usd = (n: number) => `$${n.toFixed(2)}`;

/** Shopping cart: quantity steppers, remove with undo, free-shipping progress and a sticky summary. */
export function CartScreen() {
  const [lines, setLines] = React.useState(initial);
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const remaining = Math.max(0, FREE_SHIP - subtotal);

  const remove = (l: Line) => {
    setLines((ls) => ls.filter((x) => x.id !== l.id));
    toast({ title: `Removed ${l.name}`, action: { label: "Undo", onClick: () => setLines((ls) => [...ls, l]) } });
  };

  return (
    <section className="mx-auto grid min-h-[720px] max-w-5xl gap-8 p-6 md:p-10 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Your cart <span className="text-subtle">({lines.reduce((a, l) => a + l.qty, 0)})</span>
        </h1>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 flex items-center gap-2 text-sm">
            <BoltIcon size={14} className="text-accent" />
            {remaining ? <>You&apos;re <b>{usd(remaining)}</b> away from free shipping</> : <b>You&apos;ve unlocked free shipping!</b>}
          </p>
          <Progress value={Math.min(100, (subtotal / FREE_SHIP) * 100)} size="sm" />
        </div>
        {lines.length ? (
          <ul className="flex flex-col">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li layout key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30, height: 0 }} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
                  <span className="size-20 shrink-0 rounded-2xl" style={{ background: `linear-gradient(140deg, ${l.color}, var(--kn-surface-raised) 80%)` }} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-medium">{l.name}</span>
                    <span className="text-sm text-subtle">{l.variant}</span>
                    <span className="font-mono text-sm">{usd(l.price)}</span>
                  </div>
                  <NumberInput value={l.qty} min={1} max={9} onValueChange={(v) => setLines((ls) => ls.map((x) => (x.id === l.id ? { ...x, qty: v } : x)))} />
                  <span className="hidden w-20 text-right font-mono font-semibold sm:block">{usd(l.price * l.qty)}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${l.name}`} onClick={() => remove(l)}>
                    <TrashIcon size={15} />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <EmptyState icon={<CartIcon />} title="Your cart is empty" description="Find something you love." actions={<Button onClick={() => setLines(initial)}>Restore demo items</Button>} />
        )}
      </div>
      <aside className="flex h-fit flex-col gap-4 rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-semibold">Summary</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="font-mono">{usd(subtotal)}</dd></div>
          <div className="flex justify-between text-muted"><dt>Shipping</dt><dd className="font-mono">{remaining ? usd(9.99) : "Free"}</dd></div>
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="font-mono">{usd(subtotal + (remaining ? 9.99 : 0))}</dd></div>
        </dl>
        <Button size="lg" disabled={!lines.length}>Checkout</Button>
        <p className="text-center text-xs text-subtle">Free returns within 30 days</p>
      </aside>
    </section>
  );
}
