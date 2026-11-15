"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { useMounted, useReducedMotion } from "@kineticui/core";

type Burst = { id: number; x: number; y: number };

const COLORS = [
  "var(--kn-accent)",
  "#7C8CFF",
  "#F4A86A",
  "#F0A3D0",
  "#6EE7A0",
  "var(--kn-foreground)",
];

/**
 * const { fire, Confetti } = useConfetti();
 * <button onClick={(e) => fire(e)}>Celebrate</button>
 * <Confetti />
 */
export function useConfetti({ pieces = 28 }: { pieces?: number } = {}) {
  const [bursts, setBursts] = React.useState<Burst[]>([]);
  const reduced = useReducedMotion();
  // Portals only exist in the browser; render nothing until mounted to keep hydration in sync.
  const mounted = useMounted();

  const fire = React.useCallback(
    (from?: { clientX: number; clientY: number } | HTMLElement | null) => {
      if (reduced) return;
      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      if (from instanceof HTMLElement) {
        const r = from.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      } else if (from && "clientX" in from) {
        x = from.clientX;
        y = from.clientY;
      }
      const id = Date.now() + Math.random();
      setBursts((b) => [...b, { id, x, y }]);
      setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 1400);
    },
    [reduced],
  );

  const Confetti = React.useCallback(
    () =>
      !mounted
        ? null
        : createPortal(
            <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
              {bursts.map((b) =>
                Array.from({ length: pieces }).map((_, i) => {
                  const angle = (i / pieces) * Math.PI * 2 + b.id;
                  const dist = 90 + ((i * 37) % 80);
                  return (
                    <motion.span
                      key={`${b.id}-${i}`}
                      className="absolute block rounded-[2px]"
                      style={{
                        left: b.x,
                        top: b.y,
                        width: 6 + (i % 3) * 2,
                        height: 10 - (i % 3) * 2,
                        background: COLORS[i % COLORS.length],
                      }}
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist + 60,
                        rotate: (i * 47) % 360,
                        opacity: 0,
                      }}
                      transition={{ duration: 1.1, ease: [0.1, 0.7, 0.3, 1] }}
                    />
                  );
                }),
              )}
            </div>,
            document.body,
          ),
    [bursts, pieces, mounted],
  );

  return { fire, Confetti };
}

export type ConfettiButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** A plain button that fires confetti from itself on click. Style it with className. */
export function ConfettiButton({ onClick, children, ...props }: ConfettiButtonProps) {
  const { fire, Confetti } = useConfetti();
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          fire(e.currentTarget);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
      <Confetti />
    </>
  );
}
