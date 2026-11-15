"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

export type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  date: string;
  verified?: boolean;
  helpful?: number;
  avatarColor?: string;
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const f = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`kn-star-${i}-${Math.round(f * 100)}`}>
                <stop offset={`${f * 100}%`} stopColor="#F5C451" />
                <stop offset={`${f * 100}%`} stopColor="var(--kn-border-strong)" />
              </linearGradient>
            </defs>
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill={`url(#kn-star-${i}-${Math.round(f * 100)})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** Rating summary with distribution bars plus filterable review cards. */
export function Reviews({ reviews, className }: { reviews: Review[]; className?: string }) {
  const [filter, setFilter] = React.useState<number | null>(null);
  const [helpful, setHelpful] = React.useState<Record<string, boolean>>({});
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / Math.max(1, reviews.length);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: reviews.filter((r) => Math.round(r.rating) === s).length }));
  const shown = filter ? reviews.filter((r) => Math.round(r.rating) === filter) : reviews;

  return (
    <div className={cn("grid gap-8 md:grid-cols-[240px_1fr]", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <span className="font-display text-5xl font-semibold tracking-tight">{avg.toFixed(1)}</span>
          <div className="flex flex-col gap-1 pb-1.5">
            <Stars value={avg} size={16} />
            <span className="text-xs text-subtle">{reviews.length} reviews</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {dist.map(({ s, n }) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
              className={cn("flex items-center gap-2.5 rounded-md px-1 py-0.5 text-xs transition-opacity", filter && filter !== s && "opacity-40")}
            >
              <span className="w-3 font-mono text-muted">{s}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised">
                <motion.span className="block h-full rounded-full bg-[#F5C451]" initial={{ width: 0 }} animate={{ width: `${(n / Math.max(1, reviews.length)) * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
              </span>
              <span className="w-6 text-right font-mono text-subtle">{n}</span>
            </button>
          ))}
        </div>
        {filter ? (
          <button type="button" onClick={() => setFilter(null)} className="w-fit text-xs text-accent">
            Clear filter
          </button>
        ) : null}
      </div>
      <ul className="flex flex-col gap-3">
        {shown.map((r) => (
          <motion.li layout key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full text-[11px] font-bold text-[#0b0c0e]" style={{ background: r.avatarColor ?? "var(--kn-accent)" }}>
                {r.author.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </span>
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {r.author}
                  {r.verified ? <span className="rounded-full bg-success-soft px-1.5 py-px text-[10px] text-success">Verified</span> : null}
                </span>
                <span className="text-xs text-subtle">{r.date}</span>
              </div>
              <span className="ml-auto">
                <Stars value={r.rating} />
              </span>
            </div>
            {r.title ? <span className="font-semibold">{r.title}</span> : null}
            <p className="text-sm leading-relaxed text-muted">{r.body}</p>
            <button
              type="button"
              aria-pressed={!!helpful[r.id]}
              onClick={() => setHelpful((h) => ({ ...h, [r.id]: !h[r.id] }))}
              className={cn("w-fit rounded-full border px-2.5 py-1 text-xs transition-colors", helpful[r.id] ? "border-accent text-accent" : "border-border text-subtle hover:text-foreground")}
            >
              Helpful · {(r.helpful ?? 0) + (helpful[r.id] ? 1 : 0)}
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
