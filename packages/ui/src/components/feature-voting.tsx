"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChatIcon } from "@kineticui/icons";

export type FeatureRequest = {
  id: string;
  title: string;
  description?: string;
  votes: number;
  voted?: boolean;
  status?: "open" | "planned" | "in-progress" | "shipped";
  comments?: number;
  createdAt?: number;
};

export type FeatureVotingProps = {
  items: FeatureRequest[];
  onVote: (id: string, voted: boolean) => void;
  onItemClick?: (item: FeatureRequest) => void;
  className?: string;
};

const statusStyle = {
  open: "bg-surface-overlay text-muted",
  planned: "bg-info-soft text-info",
  "in-progress": "bg-warning-soft text-warning",
  shipped: "bg-success-soft text-success",
};

/** Public roadmap board: upvote requests, sort by top or new, filter by status. */
export function FeatureVoting({ items, onVote, onItemClick, className }: FeatureVotingProps) {
  const [sort, setSort] = React.useState<"top" | "new">("top");
  const [filter, setFilter] = React.useState<FeatureRequest["status"] | "all">("all");
  const list = items
    .filter((i) => filter === "all" || (i.status ?? "open") === filter)
    .sort((a, b) => (sort === "top" ? b.votes - a.votes : (b.createdAt ?? 0) - (a.createdAt ?? 0)));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-surface-raised p-0.5 text-xs">
          {(["top", "new"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={sort === s} onClick={() => setSort(s)} className={cn("rounded-md px-3 py-1 capitalize", sort === s ? "bg-surface-overlay text-foreground" : "text-subtle")}>
              {s}
            </button>
          ))}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          aria-label="Filter by status"
          className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-muted outline-none"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="planned">Planned</option>
          <option value="in-progress">In progress</option>
          <option value="shipped">Shipped</option>
        </select>
      </div>
      <ul className="flex flex-col gap-2">
        {list.map((it) => (
          <motion.li layout key={it.id} transition={{ type: "spring", stiffness: 400, damping: 34 }} className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
            <motion.button
              type="button"
              aria-pressed={!!it.voted}
              aria-label={`${it.voted ? "Remove vote" : "Upvote"}: ${it.title}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => onVote(it.id, !it.voted)}
              className={cn(
                "flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors",
                it.voted ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:border-border-strong hover:text-foreground",
              )}
            >
              <svg viewBox="0 0 24 24" className="size-4" fill={it.voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden>
                <path d="M12 5l7 9h-4v5H9v-5H5z" />
              </svg>
              <motion.span key={it.votes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-mono text-sm font-semibold">
                {it.votes}
              </motion.span>
            </motion.button>
            <button type="button" onClick={() => onItemClick?.(it)} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
              <span className="font-medium">{it.title}</span>
              {it.description ? <span className="line-clamp-2 text-sm text-muted">{it.description}</span> : null}
              <span className="mt-1 flex items-center gap-3 text-xs text-subtle">
                <span className={cn("rounded-full px-2 py-0.5 font-medium capitalize", statusStyle[it.status ?? "open"])}>{(it.status ?? "open").replace("-", " ")}</span>
                {it.comments !== undefined ? (
                  <span className="flex items-center gap-1">
                    <ChatIcon size={12} /> {it.comments}
                  </span>
                ) : null}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
