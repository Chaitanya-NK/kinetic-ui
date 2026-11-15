"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, QrCode, Textarea } from "@kineticui/ui";
import { ArrowLeftIcon, CheckIcon, PackageIcon, StoreIcon, TruckIcon } from "@kineticui/icons";

const items = [
  { id: "a", name: "Summit Boot", size: "UK 9", price: 199, hue: "#fb923c" },
  { id: "b", name: "Drift Hoodie", size: "M", price: 89, hue: "#7dd3fc" },
  { id: "c", name: "Pulse Cap", size: "One size", price: 32, hue: "#f9a8d4" },
];
const reasons = ["Too small", "Too big", "Not as described", "Arrived damaged", "Changed my mind"];
const methods = [
  { id: "pickup", label: "Free pickup", hint: "Courier collects tomorrow, 9am–1pm", icon: TruckIcon },
  { id: "dropoff", label: "Drop off", hint: "Any partner store, show the QR code", icon: StoreIcon },
];
const steps = ["Items", "Reason", "Method", "Done"];

/** Multi-step returns flow: pick items, give reasons, choose refund method and return option, then a QR label. */
export function ReturnsFlow() {
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const [picked, setPicked] = React.useState<string[]>(["a"]);
  const [why, setWhy] = React.useState<Record<string, string>>({ a: "Too small" });
  const [refund, setRefund] = React.useState("original");
  const [method, setMethod] = React.useState("pickup");
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const total = items.filter((i) => picked.includes(i.id)).reduce((a, i) => a + i.price, 0) + (refund === "credit" ? 10 : 0);
  const canNext = step === 0 ? picked.length > 0 : step === 1 ? picked.every((id) => why[id]) : true;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <span className={`flex items-center gap-2 text-xs ${i <= step ? "text-foreground" : "text-subtle"}`}>
              <motion.span animate={{ background: i < step ? "var(--kn-accent)" : i === step ? "var(--kn-surface-overlay)" : "transparent" }} className={`flex size-6 items-center justify-center rounded-full border text-[11px] ${i < step ? "border-accent text-accent-foreground" : "border-border-strong"}`}>{i < step ? <CheckIcon size={12} strokeWidth={3} /> : i + 1}</motion.span>
              <span className="hidden sm:inline">{s}</span>
            </span>
            {i < steps.length - 1 ? <span className="relative h-px flex-1 bg-border"><motion.span animate={{ width: i < step ? "100%" : "0%" }} className="absolute inset-y-0 left-0 bg-accent" /></span> : null}
          </React.Fragment>
        ))}
      </div>
      <div className="relative min-h-[380px] overflow-hidden rounded-3xl border border-border bg-surface p-6">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} initial={{ x: dir * 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: dir * -40, opacity: 0 }} transition={{ duration: 0.22 }} className="flex flex-col gap-4">
            {step === 0 ? (
              <>
                <h2 className="font-display text-xl font-semibold">What would you like to return?</h2>
                <p className="-mt-2 text-sm text-muted">Order KN-43911 · Delivered Sep 29</p>
                {items.map((it) => {
                  const on = picked.includes(it.id);
                  return (
                    <button key={it.id} type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== it.id) : [...p, it.id]))} className={`flex items-center gap-4 rounded-2xl border p-3 text-left transition-colors ${on ? "border-accent bg-accent-soft/30" : "border-border hover:border-border-strong"}`}>
                      <span className="size-14 rounded-xl" style={{ background: `radial-gradient(circle at 50% 60%, ${it.hue}, var(--kn-surface-raised) 70%)` }} />
                      <span className="flex flex-1 flex-col"><span className="font-medium">{it.name}</span><span className="text-xs text-subtle">{it.size}</span></span>
                      <span className="font-mono">${it.price}</span>
                      <span className={`flex size-5 items-center justify-center rounded-md border ${on ? "border-accent bg-accent text-accent-foreground" : "border-border-strong"}`}>{on ? <CheckIcon size={12} strokeWidth={3} /> : null}</span>
                    </button>
                  );
                })}
              </>
            ) : step === 1 ? (
              <>
                <h2 className="font-display text-xl font-semibold">Why are you returning?</h2>
                {items.filter((i) => picked.includes(i.id)).map((it) => (
                  <div key={it.id} className="flex flex-col gap-2">
                    <span className="text-sm font-medium">{it.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((r) => <button key={r} type="button" aria-pressed={why[it.id] === r} onClick={() => setWhy((w) => ({ ...w, [it.id]: r }))} className={`h-8 rounded-full border px-3 text-xs ${why[it.id] === r ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-border-strong"}`}>{r}</button>)}
                    </div>
                  </div>
                ))}
                <Textarea placeholder="Anything else we should know? (optional)" rows={2} aria-label="Notes" />
              </>
            ) : step === 2 ? (
              <>
                <h2 className="font-display text-xl font-semibold">Refund and return method</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[["original", "Original payment", "3–5 business days"], ["credit", "Store credit +$10", "Instant, never expires"]].map(([id, l, h]) => (
                    <button key={id} type="button" aria-pressed={refund === id} onClick={() => setRefund(id!)} className={`rounded-2xl border p-3 text-left ${refund === id ? "border-accent bg-accent-soft/30" : "border-border"}`}><div className="text-sm font-medium">{l}</div><div className="text-xs text-subtle">{h}</div></button>
                  ))}
                </div>
                {methods.map((m) => (
                  <button key={m.id} type="button" aria-pressed={method === m.id} onClick={() => setMethod(m.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left ${method === m.id ? "border-accent bg-accent-soft/30" : "border-border"}`}>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-surface-raised"><m.icon size={17} /></span>
                    <span><span className="block text-sm font-medium">{m.label}</span><span className="text-xs text-subtle">{m.hint}</span></span>
                  </button>
                ))}
                <div className="flex justify-between rounded-xl bg-surface-raised p-3 text-sm"><span className="text-muted">Refund total</span><span className="font-mono font-semibold">${total}</span></div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground"><PackageIcon size={24} /></motion.span>
                <h2 className="font-display text-xl font-semibold">Return started</h2>
                <p className="max-w-xs text-sm text-muted">{method === "pickup" ? "A courier will collect your parcel tomorrow between 9am and 1pm." : "Show this code at any partner store. No printing needed."}</p>
                <div className="rounded-2xl bg-white p-3 text-[#0b0c0e]"><QrCode value="https://kinetic.dev/returns/RT-90412" size={132} /></div>
                <span className="font-mono text-xs text-subtle">RT-90412 · ${total} {refund === "credit" ? "store credit" : "refund"}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between">
        {step > 0 && step < 3 ? <Button variant="ghost" onClick={() => go(step - 1)}><ArrowLeftIcon size={15} /> Back</Button> : <span />}
        {step < 3 ? <Button disabled={!canNext} onClick={() => go(step + 1)}>{step === 2 ? "Confirm return" : "Continue"}</Button> : <Button variant="secondary" onClick={() => go(0)}>Start another return</Button>}
      </div>
    </div>
  );
}
