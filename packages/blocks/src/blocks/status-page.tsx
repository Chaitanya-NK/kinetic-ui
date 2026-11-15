"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button, UptimeBars, type UptimeDay } from "@kineticui/ui";
import { BellIcon, CheckIcon } from "@kineticui/icons";

// Deterministic pseudo-random so server and client render the same history.
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const history = (seed: number, bad: number[]): UptimeDay[] => {
  const r = rng(seed);
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 8, 17 + i));
    const status = bad.includes(i) ? (r() > 0.5 ? "down" : "degraded") : r() > 0.97 ? "degraded" : "up";
    return { date: d.toISOString().slice(0, 10), status, note: status === "up" ? undefined : "Elevated error rates" };
  });
};
const services = [
  { name: "API", days: history(3, [41]) },
  { name: "Dashboard", days: history(7, []) },
  { name: "Registry CDN", days: history(11, [12, 13]) },
  { name: "Webhooks", days: history(19, [58]) },
];
const incidents = [
  { title: "Webhook delivery delays", status: "Monitoring", time: "Today, 09:12 UTC", updates: [["Monitoring", "A fix has been deployed and deliveries are catching up."], ["Identified", "A queue worker was stuck after a deploy."], ["Investigating", "Some webhooks are delivered up to 10 minutes late."]] },
];

/** Status page: overall banner, per-service 60-day uptime bars, active incident timeline and subscribe. */
export function StatusPage() {
  const [sub, setSub] = React.useState(false);
  const degraded = incidents.length > 0;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14">
      <div className="flex items-center justify-between">
        <span className="font-display text-xl font-semibold">Kinetic <span className="text-subtle">Status</span></span>
        <Button size="sm" variant={sub ? "secondary" : "primary"} onClick={() => setSub(!sub)}>{sub ? <><CheckIcon size={14} /> Subscribed</> : <><BellIcon size={14} /> Subscribe to updates</>}</Button>
      </div>
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`flex items-center gap-4 rounded-2xl p-5 ${degraded ? "bg-warning-soft" : "bg-success-soft"}`}>
        <span className="relative flex size-3">
          <span className={`absolute inset-0 animate-ping rounded-full ${degraded ? "bg-warning" : "bg-success"}`} />
          <span className={`relative size-3 rounded-full ${degraded ? "bg-warning" : "bg-success"}`} />
        </span>
        <div><div className="font-semibold">{degraded ? "Partial degradation" : "All systems operational"}</div><div className="text-sm text-muted">Updated a minute ago</div></div>
      </motion.div>
      {incidents.map((inc) => (
        <div key={inc.title} className="flex flex-col gap-4 rounded-2xl border border-warning/30 bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{inc.title}</span><Badge variant="warning" size="sm" dot="pulse">{inc.status}</Badge><span className="ml-auto text-xs text-subtle">{inc.time}</span></div>
          <ol className="flex flex-col gap-3 border-l border-border pl-4">
            {inc.updates.map(([s, t], i) => (
              <li key={s} className="relative text-sm">
                <span className={`absolute -left-[21px] top-1.5 size-2 rounded-full ${i === 0 ? "bg-warning" : "bg-border-strong"}`} />
                <b className="text-foreground">{s}</b> <span className="text-muted">— {t}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5">
        {services.map((s) => <UptimeBars key={s.name} name={s.name} days={s.days} />)}
      </div>
      <p className="text-center text-xs text-subtle">60-day history · Times in UTC</p>
    </section>
  );
}
