"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type MeteorsProps = {
  count?: number;
  /** Angle of travel in degrees (215 = down and to the left). */
  angle?: number;
  className?: string;
};

/** Shooting stars streaking across a card or hero. CSS-animated, positions are deterministic so SSR matches. */
export function Meteors({ count = 18, angle = 215, className }: MeteorsProps) {
  const meteors = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Deterministic pseudo-random spread.
        const r = (n: number) => ((Math.sin((i + 1) * n) * 10000) % 1 + 1) % 1;
        return { left: `${Math.round(r(12.9898) * 110 - 5)}%`, delay: `${(r(78.233) * 6).toFixed(2)}s`, duration: `${(2.5 + r(37.719) * 5).toFixed(2)}s`, width: Math.round(60 + r(4.1414) * 90) };
      }),
    [count],
  );
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((m, i) => (
        <span
          key={i}
          data-kn-motion
          className="absolute top-[-5%] size-[3px] rounded-full bg-foreground opacity-0 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_10px_2px_var(--kn-accent)] animate-[kn-meteor_var(--d)_linear_infinite]"
          style={{ left: m.left, animationDelay: m.delay, "--d": m.duration, "--a": `${angle}deg` } as React.CSSProperties}
        >
          <span className="absolute left-full top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent to-transparent" style={{ width: m.width }} />
        </span>
      ))}
    </div>
  );
}
