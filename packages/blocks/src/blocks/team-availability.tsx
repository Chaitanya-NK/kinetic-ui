"use client";

import * as React from "react";
import { cn, useMounted } from "@kineticui/core";
import { Avatar, Button, toast } from "@kineticui/ui";

type Person = { name: string; color: string; city: string; tz: number; busy: [number, number][] };
const people: Person[] = [
  { name: "Maya Kapoor", color: "#7C8CFF", city: "Bengaluru", tz: 5.5, busy: [[10, 11], [15, 16]] },
  { name: "Rohan Joshi", color: "#F4A86A", city: "Bengaluru", tz: 5.5, busy: [[12, 13.5]] },
  { name: "Rosa Silva", color: "#F0A3D0", city: "Lisbon", tz: 0, busy: [[9, 10], [14, 15]] },
  { name: "Kemi Okafor", color: "#6EE7A0", city: "Lagos", tz: 1, busy: [[11, 12]] },
  { name: "Noah Kim", color: "#E8E8E3", city: "New York", tz: -5, busy: [[9, 9.5]] },
];
const WORK: [number, number] = [9, 18];

/** Cross-timezone availability grid (UTC): working hours, busy blocks, local times and the best shared slot. */
export function TeamAvailability() {
  const mounted = useMounted();
  const [hover, setHover] = React.useState<number | null>(null);
  const nowUtc = mounted ? new Date().getUTCHours() + new Date().getUTCMinutes() / 60 : null;
  const local = (p: Person, utc: number) => (utc + p.tz + 24) % 24;
  const free = (p: Person, utc: number) => {
    const l = local(p, utc);
    return l >= WORK[0] && l < WORK[1] && !p.busy.some(([a, b]) => l >= a && l < b);
  };
  const scores = Array.from({ length: 24 }, (_, h) => people.filter((p) => free(p, h + 0.25)).length);
  const best = scores.indexOf(Math.max(...scores));
  const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;

  return (
    <section className="flex min-h-[560px] items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-3xl border border-border bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Find a time</h2>
            <p className="text-sm text-muted">Best overlap: <b className="text-accent">{fmt(best)} UTC</b> · {scores[best]} of {people.length} free</p>
          </div>
          <Button size="sm" onClick={() => toast({ title: `Invite sent for ${fmt(best)} UTC`, tone: "success" })}>Schedule at best time</Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[680px]" onPointerLeave={() => setHover(null)}>
            <div className="ml-44 grid grid-cols-24 font-mono text-[10px] text-subtle">
              {Array.from({ length: 24 }, (_, h) => <span key={h} className={cn("text-center", h === best && "text-accent")}>{h % 3 === 0 ? h : ""}</span>)}
            </div>
            {people.map((p) => (
              <div key={p.name} className="mt-2 flex items-center">
                <div className="flex w-44 shrink-0 items-center gap-2 pr-3">
                  <Avatar alt={p.name} color={p.color} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name.split(" ")[0]}</div>
                    <div className="truncate text-[11px] text-subtle">{p.city} · {hover !== null ? fmt(local(p, hover)) : `UTC${p.tz >= 0 ? "+" : ""}${p.tz}`}</div>
                  </div>
                </div>
                <div className="relative grid h-8 flex-1 grid-cols-24 gap-px">
                  {Array.from({ length: 24 }, (_, h) => {
                    const l = local(p, h + 0.25);
                    const working = l >= WORK[0] && l < WORK[1];
                    const isFree = free(p, h + 0.25);
                    return (
                      <span
                        key={h}
                        onPointerEnter={() => setHover(h)}
                        className={cn("rounded-sm", isFree ? "bg-accent/70" : working ? "bg-danger/50" : "bg-surface-raised", hover === h && "ring-1 ring-foreground", h === best && "outline outline-1 outline-accent")}
                        title={`${fmt(l)} local`}
                      />
                    );
                  })}
                  {nowUtc !== null ? <span className="pointer-events-none absolute inset-y-[-4px] w-0.5 rounded bg-foreground" style={{ left: `${(nowUtc / 24) * 100}%` }} /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-accent/70" /> Free</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-danger/50" /> Busy</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-surface-raised" /> Outside hours</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-foreground" /> Now</span>
        </div>
      </div>
    </section>
  );
}
