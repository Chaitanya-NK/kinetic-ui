"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblings?: number;
  className?: string;
};

function range(page: number, total: number, siblings: number): (number | "gap")[] {
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - siblings);
  const end = Math.min(total - 1, page + siblings);
  if (start > 2) out.push("gap");
  for (let n = start; n <= end; n++) out.push(n);
  if (end < total - 1) out.push("gap");
  if (total > 1) out.push(total);
  return out;
}

export function Pagination({ page, totalPages, onPageChange, siblings = 1, className }: PaginationProps) {
  const btn =
    "flex size-9 items-center justify-center rounded-[10px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(btn, "border border-border text-muted hover:text-foreground")}
      >
        <ChevronLeftIcon size={15} />
      </button>
      {range(page, totalPages, siblings).map((n, i) =>
        n === "gap" ? (
          <span key={`g${i}`} className="w-7 text-center text-subtle">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPageChange(n)}
            className={cn(btn, n === page ? "bg-accent font-semibold text-accent-foreground" : "text-muted hover:bg-surface-raised hover:text-foreground")}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(btn, "border border-border text-muted hover:text-foreground")}
      >
        <ChevronRightIcon size={15} />
      </button>
    </nav>
  );
}
