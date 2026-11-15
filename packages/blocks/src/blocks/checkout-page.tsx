"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, CardInput, Checkbox, Field, Input, PhoneInput, RadioCard, RadioGroup, Separator, Stepper, toast } from "@kineticui/ui";
import { LockIcon, TagIcon } from "@kineticui/icons";

const items = [
  { id: "1", name: "Kinetic Pro", detail: "Annual · 5 seats", price: 1200, color: "#C6F432" },
  { id: "2", name: "Priority support", detail: "Add-on", price: 240, color: "#7C8CFF" },
];

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Checkout: contact, shipping speed and card payment on the left; order summary with coupon on the right. */
export function CheckoutPage() {
  const [shipping, setShipping] = React.useState("standard");
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [paid, setPaid] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  const ship = shipping === "express" ? 25 : 0;
  const tax = Math.round((subtotal - discount) * 0.18 * 100) / 100;
  const total = subtotal - discount + ship + tax;

  return (
    <div className="mx-auto grid min-h-[820px] max-w-6xl gap-10 p-6 md:p-10 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-8">
        <Stepper steps={["Cart", "Details", "Payment", "Done"]} current={paid ? 3 : 2} />
        <AnimatePresence mode="wait">
          {paid ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15 }} />
                </svg>
              </span>
              <h2 className="font-display text-2xl font-semibold">Payment confirmed</h2>
              <p className="text-sm text-muted">A receipt for {usd(total)} is on its way to your inbox.</p>
              <Button variant="secondary" onClick={() => setPaid(false)}>Back to checkout</Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8"
              onSubmit={(e) => {
                e.preventDefault();
                setBusy(true);
                setTimeout(() => {
                  setBusy(false);
                  setPaid(true);
                }, 1100);
              }}
            >
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" htmlFor="kn-co-email">
                    <Input id="kn-co-email" type="email" defaultValue="maya@acme.io" autoComplete="email" />
                  </Field>
                  <Field label="Phone">
                    <PhoneInput defaultCountry="IN" />
                  </Field>
                </div>
              </section>
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-lg font-semibold">Delivery</h2>
                <RadioGroup value={shipping} onValueChange={setShipping} className="grid gap-2 sm:grid-cols-2">
                  <RadioCard value="standard" title="Standard" description="Activation within 24h" aside={<span className="font-mono text-sm">Free</span>} />
                  <RadioCard value="express" title="Express" description="Instant + onboarding call" aside={<span className="font-mono text-sm">$25</span>} />
                </RadioGroup>
              </section>
              <section className="flex flex-col gap-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  Payment <LockIcon size={14} className="text-subtle" />
                </h2>
                <CardInput />
                <Checkbox label="Billing address is the same as my company address" defaultChecked />
              </section>
              <Button type="submit" size="lg" loading={busy} className="lg:hidden">
                Pay {usd(total)}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <aside className="flex h-fit flex-col gap-5 rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-6">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-4">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              <span className="size-12 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, ${i.color}, var(--kn-surface-raised))` }} />
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{i.name}</span>
                <span className="text-xs text-subtle">{i.detail}</span>
              </div>
              <span className="font-mono text-sm">{usd(i.price)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (coupon.trim().toUpperCase() === "KINETIC20") {
              setDiscount(Math.round(subtotal * 0.2));
              setCouponError(null);
              toast({ title: "Coupon applied: 20% off", tone: "success" });
            } else setCouponError("That code isn't valid. Try KINETIC20.");
          }}
        >
          <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" leading={<TagIcon size={14} />} invalid={!!couponError} wrapperClassName="flex-1" aria-label="Coupon code" />
          <Button type="submit" variant="secondary">Apply</Button>
        </form>
        {couponError ? <p className="-mt-3 text-xs text-danger">{couponError}</p> : null}
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-muted"><dt>Subtotal</dt><dd className="font-mono">{usd(subtotal)}</dd></div>
          {discount ? <div className="flex justify-between text-success"><dt>Discount</dt><dd className="font-mono">−{usd(discount)}</dd></div> : null}
          <div className="flex justify-between text-muted"><dt>Delivery</dt><dd className="font-mono">{ship ? usd(ship) : "Free"}</dd></div>
          <div className="flex justify-between text-muted"><dt>GST (18%)</dt><dd className="font-mono">{usd(tax)}</dd></div>
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="font-mono">{usd(total)}</dd></div>
        </dl>
        <Button size="lg" loading={busy} disabled={paid} className="hidden lg:inline-flex" onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); setPaid(true); }, 1100); }}>
          Pay {usd(total)}
        </Button>
        <p className="text-center text-xs text-subtle">Secured with 256-bit encryption. Cancel anytime.</p>
      </aside>
    </div>
  );
}
