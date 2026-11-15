"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Badge, Button, CopyButton, Timeline } from "@kineticui/ui";
import { CheckIcon, MapPinIcon, ChatIcon } from "@kineticui/icons";

const stages = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"];

/** Order status page: animated route map, stage tracker, ETA, tracking number and event history. */
export function OrderTracking({ stage = 3, orderId = "KN-48213", tracking = "1Z 999 AA1 01 2345 6784" }: { stage?: number; orderId?: string; tracking?: string }) {
  return (
    <section className="mx-auto flex min-h-[860px] max-w-4xl flex-col gap-6 p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs text-subtle">Order {orderId}</span>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Arriving today, 2–4 pm</h1>
        </div>
        <Badge variant="soft" dot="pulse">{stages[stage]}</Badge>
      </div>

      <div className="relative h-56 overflow-hidden rounded-3xl border border-border bg-surface">
        <svg viewBox="0 0 800 220" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <pattern id="kn-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="var(--kn-border)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="220" fill="url(#kn-map-grid)" />
          <path d="M60 170 C 200 170, 220 60, 380 80 S 600 180, 740 60" fill="none" stroke="var(--kn-border-strong)" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
          <motion.path d="M60 170 C 200 170, 220 60, 380 80 S 600 180, 740 60" fill="none" stroke="var(--kn-accent)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: stage / (stages.length - 1) }} transition={{ duration: 1.6, ease: "easeInOut" }} />
        </svg>
        <span className="absolute bottom-8 left-[6%] flex size-8 items-center justify-center rounded-full bg-surface-overlay ring-2 ring-border-strong"><MapPinIcon size={14} /></span>
        <span className="absolute right-[6%] top-[18%] flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_8px_var(--kn-accent-soft)]"><MapPinIcon size={16} /></span>
        <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-2xl border border-border-strong bg-surface-overlay/90 p-3 backdrop-blur">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#F4A86A] text-sm font-bold text-[#0b0c0e]">AR</span>
          <div className="text-sm">
            <div className="font-medium">Arjun · your courier</div>
            <div className="text-xs text-subtle">4 stops away</div>
          </div>
          <Button size="icon-sm" variant="secondary" aria-label="Message courier"><ChatIcon size={14} /></Button>
        </div>
      </div>

      <ol className="grid grid-cols-5 gap-2" aria-label="Progress">
        {stages.map((s, i) => (
          <li key={s} className="flex flex-col gap-2">
            <span className={cn("h-1.5 rounded-full", i <= stage ? "bg-accent" : "bg-surface-raised")} />
            <span className={cn("flex items-center gap-1 text-xs", i <= stage ? "text-foreground" : "text-subtle", i === stage && "font-semibold")}>
              {i < stage ? <CheckIcon size={11} className="text-accent" /> : null}
              {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="mb-5 font-semibold">Shipment history</h2>
          <Timeline
            items={[
              { title: "Out for delivery", description: "Indiranagar hub, Bengaluru", time: "08:12", tone: "accent" },
              { title: "Arrived at local hub", description: "Bengaluru", time: "Yesterday 22:40", tone: "success", icon: <CheckIcon /> },
              { title: "Shipped", description: "Mumbai fulfilment centre", time: "Nov 13", tone: "success", icon: <CheckIcon /> },
              { title: "Order placed", time: "Nov 12", tone: "success", icon: <CheckIcon /> },
            ]}
          />
        </div>
        <div className="flex h-fit flex-col gap-4 rounded-3xl border border-border bg-surface p-6 text-sm">
          <div>
            <div className="text-xs text-subtle">Tracking number</div>
            <div className="mt-1 flex items-center gap-2 font-mono">
              {tracking}
              <CopyButton value={tracking} />
            </div>
          </div>
          <div>
            <div className="text-xs text-subtle">Deliver to</div>
            <div className="mt-1">Maya Kapoor, 12 Lavelle Rd, Bengaluru 560001</div>
          </div>
          <Button variant="secondary">Change delivery</Button>
        </div>
      </div>
    </section>
  );
}
