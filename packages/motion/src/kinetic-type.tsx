"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type KineticTypeProps = {
  text: string;
  /** weight: letters thicken near the cursor. lens: they also grow. wave: they lift and tilt like a ripple. */
  effect?: "weight" | "lens" | "wave";
  /** Pointer influence radius in px. */
  radius?: number;
  /** Variable-font weight range. Needs a variable font (Space Grotesk, Inter…). */
  minWeight?: number;
  maxWeight?: number;
  /** Extra scale at the cursor for "lens". */
  maxScale?: number;
  /** Highlight letters near the cursor with the accent colour. */
  colorize?: boolean;
  as?: React.ElementType;
  className?: string;
};

/**
 * Type that reacts to the pointer letter by letter: weight swells, letters grow or ripple as the cursor passes,
 * then spring back. Runs outside React for 60fps and reads as one label to screen readers.
 */
export function KineticType({ text, effect = "lens", radius = 160, minWeight = 300, maxWeight = 700, maxScale = 1.35, colorize = false, as: Tag = "span", className }: KineticTypeProps) {
  const root = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-l]"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = letters.map(() => 0);
    const pointer = { x: -1e5, y: -1e5 };
    let centres: { x: number; y: number }[] = [];
    let raf = 0;
    let active = false;
    const measure = () => {
      centres = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    const apply = (i: number, k: number) => {
      const s = letters[i]!.style;
      const w = minWeight + (maxWeight - minWeight) * k;
      s.fontVariationSettings = `"wght" ${w.toFixed(0)}`;
      s.fontWeight = String(Math.round(w));
      if (effect === "lens") s.transform = `scale(${1 + (maxScale - 1) * k})`;
      else if (effect === "wave") s.transform = `translateY(${(-k * 0.18).toFixed(3)}em) rotate(${(k * -8).toFixed(2)}deg)`;
      if (colorize) s.color = k > 0.02 ? `color-mix(in srgb, var(--kn-accent) ${Math.round(k * 100)}%, currentColor)` : "";
    };
    const tick = () => {
      let moving = false;
      for (let i = 0; i < letters.length; i++) {
        const c = centres[i]!;
        const d = Math.hypot(pointer.x - c.x, (pointer.y - c.y) * 1.3);
        const target = Math.max(0, 1 - d / radius) ** 1.6;
        const next = cur[i]! + (target - cur[i]!) * 0.18;
        if (Math.abs(next - cur[i]!) > 0.001) moving = true;
        cur[i] = next;
        apply(i, next);
      }
      raf = moving || active ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => !raf && (raf = requestAnimationFrame(tick));
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      active = true;
      kick();
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e5;
      active = false;
      kick();
    };
    measure();
    letters.forEach((_, i) => apply(i, 0));
    if (reduce) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [text, effect, radius, minWeight, maxWeight, maxScale, colorize]);

  const words = text.split(/(\s+)/);
  return (
    <Tag ref={root} aria-label={text} className={cn("inline-block", className)}>
      {words.map((w, wi) =>
        /^\s+$/.test(w) ? (
          <span key={wi} aria-hidden> </span>
        ) : (
          <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(w).map((ch, ci) => (
              <span key={ci} data-l className="inline-block origin-bottom transition-[color] duration-150 will-change-transform">
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </Tag>
  );
}
