"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type HoloFoil = "rainbow" | "sparkle" | "lines" | "none";

export type HoloCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> & {
  /** Maximum tilt in degrees. */
  max?: number;
  /** Foil pattern laid over the card. */
  foil?: HoloFoil;
  /** Foil strength, 0 to 1. */
  intensity?: number;
  /** Corner radius in px. */
  radius?: number;
  /** Show the moving glare highlight. */
  glare?: boolean;
};

const sparkle =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg fill='white'%3E%3Ccircle cx='12' cy='18' r='1.2'/%3E%3Ccircle cx='64' cy='9' r='.8'/%3E%3Ccircle cx='98' cy='40' r='1.4'/%3E%3Ccircle cx='30' cy='70' r='.9'/%3E%3Ccircle cx='80' cy='88' r='1.1'/%3E%3Ccircle cx='50' cy='110' r='.7'/%3E%3Ccircle cx='110' cy='104' r='.9'/%3E%3Ccircle cx='6' cy='100' r='1'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * A collectible-card style holographic foil. The rainbow sheen, sparkle and glare move with the pointer
 * while the card tilts in 3D. Works with touch too.
 */
export function HoloCard({ max = 14, foil = "rainbow", intensity = 0.7, radius = 20, glare = true, className, style, children, ...props }: HoloCardProps) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const active = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const on = useSpring(active, { stiffness: 120, damping: 20 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const mx = useTransform(sx, (v) => `${v * 100}%`);
  const my = useTransform(sy, (v) => `${v * 100}%`);
  const bgx = useTransform(sx, (v) => `${50 + (v - 0.5) * 80}%`);
  const bgy = useTransform(sy, (v) => `${50 + (v - 0.5) * 80}%`);
  const hue = useTransform(() => (sx.get() + sy.get()) * 180);
  const foilOpacity = useTransform(on, (v) => (0.25 + v * 0.75) * intensity);
  const glareOpacity = useTransform(on, (v) => v * 0.9);

  const glareBg = useMotionTemplate`radial-gradient(farthest-corner circle at ${mx} ${my}, rgba(255,255,255,.55) 0%, rgba(255,255,255,.12) 25%, rgba(0,0,0,.35) 90%)`;
  const rainbowBg = useMotionTemplate`repeating-linear-gradient(${hue}deg, hsl(0 100% 70%) 0%, hsl(55 100% 65%) 6%, hsl(140 100% 65%) 12%, hsl(200 100% 70%) 18%, hsl(270 100% 72%) 24%, hsl(330 100% 70%) 30%, hsl(0 100% 70%) 36%), repeating-linear-gradient(-45deg, rgba(14,21,46,.6) 0%, rgba(143,163,163,.4) 4%, rgba(143,193,193,.5) 5%, rgba(14,21,46,.6) 9%)`;
  const bgPos = useMotionTemplate`${bgx} ${bgy}`;

  const set = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    active.set(1);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
    active.set(0);
  };

  const layer: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none" };

  return (
    <div style={{ perspective: 1000 }} className="inline-block">
      <motion.div
        {...(props as React.ComponentProps<typeof motion.div>)}
        className={cn("relative isolate overflow-hidden bg-surface-raised shadow-overlay [touch-action:none]", className)}
        style={{
          borderRadius: radius,
          transformStyle: "preserve-3d",
          ...(reduced ? {} : { rotateX, rotateY }),
          ...style,
        }}
        onPointerMove={set}
        onPointerDown={set}
        onPointerLeave={reset}
        onPointerCancel={reset}
      >
        {children}
        {foil !== "none" && (
          <motion.div
            aria-hidden
            style={{
              ...layer,
              backgroundImage: foil === "lines" ? undefined : rainbowBg,
              background:
                foil === "lines"
                  ? "repeating-linear-gradient(115deg, transparent 0 6px, rgba(255,255,255,.18) 6px 7px), linear-gradient(115deg, hsl(190 100% 70%), hsl(280 100% 75%), hsl(60 100% 70%))"
                  : undefined,
              backgroundSize: "400% 400%",
              backgroundPosition: bgPos,
              mixBlendMode: "color-dodge",
              filter: "brightness(.6) contrast(1.4) saturate(1.2)",
              opacity: foilOpacity,
            }}
          />
        )}
        {foil === "sparkle" && (
          <motion.div
            aria-hidden
            style={{ ...layer, backgroundImage: sparkle, backgroundSize: "120px 120px", backgroundPosition: bgPos, mixBlendMode: "screen", opacity: glareOpacity }}
          />
        )}
        {glare && <motion.div aria-hidden style={{ ...layer, background: glareBg, mixBlendMode: "overlay", opacity: glareOpacity }} />}
        <div aria-hidden style={{ ...layer, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" }} />
      </motion.div>
    </div>
  );
}
