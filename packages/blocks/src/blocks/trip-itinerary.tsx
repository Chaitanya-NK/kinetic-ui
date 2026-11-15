"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { AvatarStack, Badge, Checkbox } from "@kineticui/ui";
import { MapPinIcon } from "@kineticui/icons";

type Stop = { time: string; title: string; note: string; kind: "food" | "sight" | "travel" | "stay" };
const days: { label: string; date: string; stops: Stop[] }[] = [
  { label: "Day 1", date: "Fri, Dec 12", stops: [
    { time: "10:30", title: "Land at Lisbon airport", note: "Metro red line to Saldanha", kind: "travel" },
    { time: "13:00", title: "Time Out Market", note: "Try the bifana", kind: "food" },
    { time: "16:00", title: "Alfama walk", note: "Miradouro de Santa Luzia at sunset", kind: "sight" },
    { time: "20:30", title: "Check in · Casa Azul", note: "Code arrives by SMS", kind: "stay" },
  ] },
  { label: "Day 2", date: "Sat, Dec 13", stops: [
    { time: "09:00", title: "Pastéis de Belém", note: "Go early, the queue moves fast", kind: "food" },
    { time: "10:30", title: "Jerónimos Monastery", note: "Tickets booked", kind: "sight" },
    { time: "15:00", title: "Train to Sintra", note: "40 min from Rossio", kind: "travel" },
  ] },
  { label: "Day 3", date: "Sun, Dec 14", stops: [
    { time: "11:00", title: "LX Factory", note: "Bookshop + brunch", kind: "food" },
    { time: "17:40", title: "Flight home", note: "Leave for airport by 15:30", kind: "travel" },
  ] },
];
const kindColor = { food: "#F4A86A", sight: "#C6F432", travel: "#7C8CFF", stay: "#F0A3D0" };

/** Trip planner: day tabs, timed stops on a route line, packing checklist and travellers. */
export function TripItinerary() {
  const [day, setDay] = React.useState(0);
  return (
    <section className="flex min-h-[700px] items-center justify-center p-6">
      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="relative h-36 bg-[linear-gradient(135deg,#4a2a12,#1d2a4a)] p-5">
            <Badge variant="solid" className="absolute right-4 top-4">3 days</Badge>
            <span className="font-mono text-xs uppercase tracking-widest text-white/60">Weekend in</span>
            <h2 className="font-display text-4xl font-semibold text-white">Lisbon</h2>
            <span className="flex items-center gap-1 text-sm text-white/70"><MapPinIcon size={13} /> Portugal · Dec 12–14</span>
          </div>
          <div role="tablist" className="flex gap-1 border-b border-border px-4 pt-3">
            {days.map((d, i) => (
              <button key={d.label} role="tab" type="button" aria-selected={day === i} onClick={() => setDay(i)} className={cn("relative flex flex-col items-start px-3 pb-3 text-sm", day === i ? "text-foreground" : "text-subtle hover:text-foreground")}>
                <span className="font-medium">{d.label}</span>
                <span className="text-[11px]">{d.date}</span>
                {day === i ? <motion.span layoutId="kn-trip-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" /> : null}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.ol key={day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative flex flex-col gap-1 p-5">
              <span className="absolute bottom-8 left-[94px] top-8 w-px border-l-2 border-dashed border-border-strong" aria-hidden />
              {days[day]!.stops.map((s, i) => (
                <motion.li key={s.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative flex items-start gap-4 rounded-xl p-2 hover:bg-surface-raised">
                  <span className="w-14 pt-0.5 text-right font-mono text-xs text-subtle">{s.time}</span>
                  <span className="relative z-[1] mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-surface" style={{ background: kindColor[s.kind] }} />
                  <span className="flex flex-col">
                    <span className="font-medium">{s.title}</span>
                    <span className="text-sm text-muted">{s.note}</span>
                  </span>
                </motion.li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5">
            <div className="mb-3 text-sm font-semibold">Travellers</div>
            <AvatarStack avatars={[{ alt: "Maya Kapoor", color: "#7C8CFF" }, { alt: "Rohan Joshi", color: "#F4A86A" }, { alt: "Rosa Silva", color: "#F0A3D0" }]} />
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5">
            <div className="text-sm font-semibold">Packing list</div>
            {["Passport", "Power adapter (Type F)", "Walking shoes", "Light jacket", "Sunglasses"].map((p, i) => (
              <Checkbox key={p} label={p} defaultChecked={i < 2} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 px-1 text-xs text-muted">
            {(Object.keys(kindColor) as (keyof typeof kindColor)[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5 capitalize"><span className="size-2 rounded-full" style={{ background: kindColor[k] }} />{k}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
