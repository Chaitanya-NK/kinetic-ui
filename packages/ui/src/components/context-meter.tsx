"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@kineticui/core";

export type ContextUsage = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

export type ContextMeterProps = {
  /** Tokens currently in the context window. Defaults to the sum of usage fields. */
  used?: number;
  /** Size of the model's context window. */
  max: number;
  usage?: ContextUsage;
  /** Price per million tokens, to show an estimated cost. */
  pricing?: { input: number; output: number; cachedInput?: number };
  modelName?: string;
  /** Called from the popover, e.g. to summarise older turns. */
  onCompact?: () => void;
  className?: string;
};

const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M` : n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : String(n));

/** Ring that shows how full the model's context window is, with a token and cost breakdown on click. */
export function ContextMeter({ used, max, usage = {}, pricing, modelName, onCompact, className }: ContextMeterProps) {
  const total = used ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0) + (usage.reasoningTokens ?? 0);
  const pct = Math.min(1, total / max);
  const mv = useMotionValue(0);
  React.useEffect(() => {
    const c = animate(mv, pct, { type: "spring", stiffness: 90, damping: 20 });
    return () => c.stop();
  }, [pct, mv]);
  const R = 9, C = 2 * Math.PI * R;
  const dash = useTransform(mv, (p) => `${p * C} ${C}`);
  const tone = pct >= 0.9 ? "var(--kn-danger)" : pct >= 0.7 ? "var(--kn-warning)" : "var(--kn-accent)";
  const cost = pricing
    ? (((usage.inputTokens ?? 0) - (usage.cachedInputTokens ?? 0)) * pricing.input +
        (usage.cachedInputTokens ?? 0) * (pricing.cachedInput ?? pricing.input) +
        ((usage.outputTokens ?? 0) + (usage.reasoningTokens ?? 0)) * pricing.output) /
      1_000_000
    : null;
  const rows: [string, number | undefined][] = [
    ["Input", usage.inputTokens],
    ["Cached", usage.cachedInputTokens],
    ["Output", usage.outputTokens],
    ["Reasoning", usage.reasoningTokens],
  ];

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        aria-label={`Context ${Math.round(pct * 100)}% used`}
        className={cn("flex h-8 items-center gap-2 rounded-lg px-2 font-mono text-xs text-muted outline-none transition-colors hover:bg-surface-overlay hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent", className)}
      >
        <svg viewBox="0 0 24 24" className="size-5 -rotate-90">
          <circle cx="12" cy="12" r={R} fill="none" stroke="var(--kn-border-strong)" strokeWidth="3" />
          <motion.circle cx="12" cy="12" r={R} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" style={{ strokeDasharray: dash }} />
        </svg>
        <span className="tabular-nums">{Math.round(pct * 100)}%</span>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side="top" align="start" sideOffset={8} collisionPadding={12} className="z-50 w-72 origin-[var(--radix-popover-content-transform-origin)] rounded-xl border border-border-strong bg-surface-raised p-4 text-sm shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">Context window</span>
            {modelName ? <span className="text-xs text-subtle">{modelName}</span> : null}
          </div>
          <div className="mt-1 font-mono text-xs text-subtle">
            <span className="text-foreground">{fmt(total)}</span> / {fmt(max)} tokens
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-overlay">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="h-full rounded-full" style={{ background: tone }} />
          </div>
          <dl className="mt-3 flex flex-col gap-1.5 text-xs">
            {rows.filter(([, n]) => n != null).map(([k, n]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-subtle">{k}</dt>
                <dd className="font-mono tabular-nums">{n!.toLocaleString("en-US")}</dd>
              </div>
            ))}
            {cost != null ? (
              <div className="mt-1 flex justify-between border-t border-border pt-2">
                <dt className="text-subtle">Estimated cost</dt>
                <dd className="font-mono tabular-nums text-foreground">${cost.toFixed(cost < 0.01 ? 4 : 2)}</dd>
              </div>
            ) : null}
          </dl>
          {onCompact && pct >= 0.5 ? (
            <button type="button" onClick={onCompact} className="mt-3 w-full rounded-lg border border-border-strong py-2 text-xs font-medium transition-colors hover:border-accent hover:text-foreground">
              Compact conversation
            </button>
          ) : null}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
