import * as React from "react";
import { cn } from "@kineticui/core";

/* Ready-made loading placeholders that match common layouts. Shimmer respects reduced motion. */

export function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "block rounded-md bg-[linear-gradient(90deg,var(--kn-surface-raised)_25%,var(--kn-surface-overlay)_50%,var(--kn-surface-raised)_75%)] bg-[length:200%_100%] animate-kn-shimmer motion-reduce:animate-none",
        className,
      )}
    />
  );
}

const Wrap = ({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) => (
  <div role="status" aria-label={label} aria-busy="true" className={className}>
    {children}
    <span className="sr-only">{label}</span>
  </div>
);

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <Wrap label="Loading text" className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Bone key={i} className="h-3" style={{ width: i === lines - 1 ? "60%" : `${92 - (i % 3) * 6}%` }} />
      ))}
    </Wrap>
  );
}

export function SkeletonCard({ media = true, className }: { media?: boolean; className?: string }) {
  return (
    <Wrap label="Loading card" className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4", className)}>
      {media ? <Bone className="aspect-video w-full rounded-xl" /> : null}
      <Bone className="h-4 w-2/3" />
      <SkeletonText lines={2} />
      <div className="flex items-center gap-3 pt-1">
        <Bone className="size-8 rounded-full" />
        <Bone className="h-3 w-24" />
        <Bone className="ml-auto h-8 w-20 rounded-lg" />
      </div>
    </Wrap>
  );
}

export function SkeletonProfile({ className }: { className?: string }) {
  return (
    <Wrap label="Loading profile" className={cn("flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6", className)}>
      <Bone className="size-20 rounded-full" />
      <Bone className="h-4 w-32" />
      <Bone className="h-3 w-24" />
      <div className="mt-2 flex gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Bone className="h-4 w-10" />
            <Bone className="h-2.5 w-14" />
          </div>
        ))}
      </div>
      <Bone className="mt-2 h-9 w-full rounded-lg" />
    </Wrap>
  );
}

export function SkeletonList({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <Wrap label="Loading list" className={cn("flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Bone className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Bone className="h-3" style={{ width: `${50 + ((i * 17) % 35)}%` }} />
            <Bone className="h-2.5 w-1/3" />
          </div>
          <Bone className="h-3 w-12" />
        </div>
      ))}
    </Wrap>
  );
}

export function SkeletonTable({ rows = 6, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <Wrap label="Loading table" className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="grid gap-4 border-b border-border p-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }, (_, i) => <Bone key={i} className="h-2.5 w-1/2" />)}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid items-center gap-4 border-b border-border/60 p-3 last:border-0" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }, (_, c) => (
            <Bone key={c} className={c === 0 ? "h-8 w-8 rounded-full" : "h-3"} style={c === 0 ? undefined : { width: `${40 + ((r * 13 + c * 29) % 50)}%` }} />
          ))}
        </div>
      ))}
    </Wrap>
  );
}

export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <Wrap label="Loading dashboard" className={cn("flex flex-col gap-3", className)}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
            <Bone className="h-3 w-1/2" />
            <Bone className="h-7 w-2/3" />
            <Bone className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>
      <div className="flex h-56 items-end gap-2 rounded-2xl border border-border bg-surface p-4">
        {Array.from({ length: 16 }, (_, i) => <Bone key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${30 + ((i * 37) % 60)}%` }} />)}
      </div>
    </Wrap>
  );
}
