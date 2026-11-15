import * as React from "react";
import { cn } from "@kineticui/core";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 0–100. Leave undefined for an indeterminate bar. */
  value?: number;
  label?: React.ReactNode;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  striped?: boolean;
};

const heights = { sm: "h-1", md: "h-2", lg: "h-3.5" };

export function Progress({ value, label, showValue, size = "md", striped, className, ...props }: ProgressProps) {
  const indeterminate = value === undefined;
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className={cn("flex w-full flex-col gap-2", className)} {...props}>
      {label || showValue ? (
        <div className="flex justify-between text-sm">
          <span className="text-muted">{label}</span>
          {showValue && !indeterminate ? <span className="font-mono text-accent">{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : pct}
        className={cn("w-full overflow-hidden rounded-full bg-border", heights[size])}
      >
        <div
          data-kn-motion={indeterminate || striped || undefined}
          className={cn(
            "h-full rounded-full bg-accent transition-[width] duration-500 ease-kn-out",
            indeterminate && "w-[35%] animate-kn-indeterminate",
            striped &&
              "animate-[kn-stripes_0.8s_linear_infinite] bg-[repeating-linear-gradient(45deg,var(--kn-accent)_0_7px,color-mix(in_oklab,var(--kn-accent),black_15%)_7px_14px)] bg-[length:28px_100%]",
          )}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export type ProgressRingProps = {
  value: number;
  size?: number;
  thickness?: number;
  /** Text in the middle. Defaults to the percentage. */
  label?: React.ReactNode;
  color?: string;
  className?: string;
};

export function ProgressRing({ value, size = 72, thickness = 6, label, color = "var(--kn-accent)", className }: ProgressRingProps) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--kn-border)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="transition-[stroke-dashoffset] duration-700 ease-kn-out"
        />
      </svg>
      <span className="absolute text-sm font-semibold tabular-nums">{label ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-kn-motion
      className={cn(
        "animate-kn-shimmer rounded-md bg-[linear-gradient(90deg,var(--kn-surface-raised)_0%,var(--kn-border)_50%,var(--kn-surface-raised)_100%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
