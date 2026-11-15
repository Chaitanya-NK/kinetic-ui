"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Input, Separator } from "@kineticui/ui";
import { ConfettiButton } from "@kineticui/motion";
import { TagIcon, XIcon } from "@kineticui/icons";

const coupons: Record<string, { label: string; off: (s: number) => number }> = {
  KINETIC20: { label: "20% off", off: (s) => s * 0.2 },
  FREESHIP: { label: "Free shipping", off: () => 9 },
  WELCOME10: { label: "$10 off", off: () => 10 },
};

/** Compact order summary with coupon codes (try KINETIC20, FREESHIP, WELCOME10), animated totals and a celebratory pay button. */
export function OrderSummary() {
  const items = [
    { name: "Kinetic Pro (annual)", price: 192 },
    { name: "Extra seat × 2", price: 96 },
  ];
  const [code, setCode] = React.useState("");
  const [applied, setApplied] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const discount = applied.reduce((a, c) => a + coupons[c]!.off(subtotal), 0);
  const total = Math.max(0, subtotal + 9 - discount);

  return (
    <section className="flex min-h-[600px] items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        {items.map((i) => (
          <div key={i.name} className="flex justify-between text-sm">
            <span>{i.name}</span>
            <span className="font-mono">${i.price.toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim().toUpperCase();
            if (!coupons[c]) return setError("Invalid code");
            if (applied.includes(c)) return setError("Already applied");
            setApplied((a) => [...a, c]);
            setCode("");
            setError(null);
          }}
        >
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" leading={<TagIcon size={14} />} invalid={!!error} wrapperClassName="flex-1" aria-label="Discount code" />
          <Button type="submit" variant="secondary">Apply</Button>
        </form>
        {error ? <span className="-mt-2 text-xs text-danger">{error}</span> : null}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {applied.map((c) => (
              <motion.span key={c} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pl-2.5 pr-1.5 font-mono text-xs text-accent">
                {c} · {coupons[c]!.label}
                <button type="button" aria-label={`Remove ${c}`} onClick={() => setApplied((a) => a.filter((x) => x !== c))}><XIcon size={12} /></button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="font-mono">${subtotal.toFixed(2)}</dd></div>
          <div className="flex justify-between text-muted"><dt>Shipping</dt><dd className="font-mono">$9.00</dd></div>
          <AnimatePresence>
            {discount ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-success">
                <dt>Discounts</dt><dd className="font-mono">−${discount.toFixed(2)}</dd>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Separator className="my-1" />
          <div className="flex items-baseline justify-between"><dt className="font-semibold">Total</dt>
            <motion.dd key={total} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-2xl font-semibold tabular-nums">${total.toFixed(2)}</motion.dd>
          </div>
        </dl>
        <ConfettiButton className="h-11 rounded-xl bg-accent text-sm font-semibold text-accent-foreground">Pay ${total.toFixed(2)}</ConfettiButton>
      </div>
    </section>
  );
}
