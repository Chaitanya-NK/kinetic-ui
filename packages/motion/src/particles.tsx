"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type ParticlesProps = {
  /** Particles per 100,000 px² of area. */
  density?: number;
  color?: string;
  /** How strongly particles move away from the pointer. 0 to disable. */
  repel?: number;
  /** Draw faint lines between nearby particles. */
  connect?: boolean;
  /** Overall drift speed. */
  speed?: number;
  className?: string;
};

/** Floating particle field on canvas that drifts, twinkles and parts around the pointer. */
export function Particles({ density = 40, color, repel = 90, connect = false, speed = 0.25, className }: ParticlesProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const col = color || getComputedStyle(canvas).getPropertyValue("--kn-accent").trim() || "#C6F432";
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; t: number };
    let ps: P[] = [];
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: -1e4, y: -1e4 };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(((w * h) / 100_000) * density);
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.4 + 0.5,
        a: Math.random() * 0.5 + 0.45,
        t: Math.random() * Math.PI * 2,
      }));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => ((mouse.x = -1e4), (mouse.y = -1e4));
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col;
      ctx.strokeStyle = col;
      for (const p of ps) {
        if (!reduce) {
          p.t += 0.02;
          p.x += p.vx;
          p.y += p.vy;
          if (repel) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < repel && d > 0.1) {
              const f = (1 - d / repel) * 2;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
          }
          if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
          if (p.y < -5) p.y = h + 5; else if (p.y > h + 5) p.y = -5;
        }
        ctx.globalAlpha = p.a * (0.6 + Math.sin(p.t) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (connect) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < ps.length; i++)
          for (let j = i + 1; j < ps.length; j++) {
            const a = ps[i]!, b = ps[j]!, d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 90) {
              ctx.globalAlpha = (1 - d / 90) * 0.25;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [density, color, repel, connect, speed]);
  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}
