"use client";

import * as React from "react";
import { cn, useReducedMotion } from "@kineticui/core";

/*
 * A tiny physics box. Each child becomes a capsule (two particles joined by a stick, Verlet integration),
 * so pills tumble, stack and rotate without a physics library. Drag and throw them; they bounce off the walls.
 */

type P = { x: number; y: number; px: number; py: number };
type Body = { a: P; b: P; len: number; r: number; el: HTMLElement; w: number; h: number };

export type GravityBoxProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: React.ReactNode;
  /** Gravity in px/s². Negative values float upwards. */
  gravity?: number;
  /** Bounciness off walls and each other, 0 to 1. */
  bounce?: number;
  /** When to drop the items in. */
  start?: "mount" | "inView";
  /** Let people drag and throw items. */
  draggable?: boolean;
};

function closest(a1: P, a2: P, b1: P, b2: P) {
  const d1x = a2.x - a1.x, d1y = a2.y - a1.y;
  const d2x = b2.x - b1.x, d2y = b2.y - b1.y;
  const rx = a1.x - b1.x, ry = a1.y - b1.y;
  const a = d1x * d1x + d1y * d1y, e = d2x * d2x + d2y * d2y, f = d2x * rx + d2y * ry;
  let s = 0, t = 0;
  if (a <= 1e-6 && e <= 1e-6) return { s, t };
  if (a <= 1e-6) t = Math.min(1, Math.max(0, f / e));
  else {
    const c = d1x * rx + d1y * ry;
    if (e <= 1e-6) s = Math.min(1, Math.max(0, -c / a));
    else {
      const b = d1x * d2x + d1y * d2y;
      const den = a * e - b * b;
      s = den !== 0 ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = Math.min(1, Math.max(0, -c / a)); }
      else if (t > 1) { t = 1; s = Math.min(1, Math.max(0, (b - c) / a)); }
    }
  }
  return { s, t };
}

/** Drop pills, tags or avatars into a box and let them tumble. Drag to throw. */
export function GravityBox({ children, gravity = 2200, bounce = 0.35, start = "inView", draggable = true, className, ...props }: GravityBoxProps) {
  const reduced = useReducedMotion();
  const box = React.useRef<HTMLDivElement>(null);
  const items = React.Children.toArray(children);
  const count = items.length;

  React.useEffect(() => {
    const root = box.current;
    if (!root || reduced) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-gravity-item]"));
    let W = root.clientWidth, H = root.clientHeight;
    const bodies: Body[] = els.map((el, i) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const r = h / 2, len = Math.max(0, w - h);
      const cx = r + len / 2 + Math.random() * Math.max(1, W - len - 2 * r);
      const cy = -h - i * (h * 0.9) - Math.random() * 40;
      const ang = (Math.random() - 0.5) * 0.8;
      const dx = (Math.cos(ang) * len) / 2, dy = (Math.sin(ang) * len) / 2;
      return { a: { x: cx - dx, y: cy - dy, px: cx - dx, py: cy - dy }, b: { x: cx + dx, y: cy + dy, px: cx + dx, py: cy + dy }, len, r, el, w, h };
    });
    const parts = bodies.flatMap((b) => [b.a, b.b]);

    let grab: { p: P; ox: number; oy: number; tx: number; ty: number } | null = null;
    let running = start === "mount";
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const dt = 1 / 120;

    const render = () => {
      for (const b of bodies) {
        const cx = (b.a.x + b.b.x) / 2, cy = (b.a.y + b.b.y) / 2;
        let ang = b.len > 0 ? Math.atan2(b.b.y - b.a.y, b.b.x - b.a.x) : 0;
        // A capsule looks the same turned half way round, so keep the text the right way up.
        if (ang > Math.PI / 2) ang -= Math.PI;
        else if (ang < -Math.PI / 2) ang += Math.PI;
        b.el.style.transform = `translate(${cx - b.w / 2}px, ${cy - b.h / 2}px) rotate(${ang}rad)`;
        b.el.style.opacity = "1";
      }
    };

    const wall = (p: P, r: number) => {
      const vx = p.x - p.px, vy = p.y - p.py;
      if (p.x < r) { p.x = r; p.px = p.x + vx * bounce; }
      else if (p.x > W - r) { p.x = W - r; p.px = p.x + vx * bounce; }
      if (p.y > H - r) {
        p.y = H - r;
        p.py = p.y + vy * bounce;
        p.px = p.x - vx * 0.85; // floor friction
      }
    };

    const step = () => {
      const g = gravity * dt * dt;
      for (const p of parts) {
        const vx = (p.x - p.px) * 0.995, vy = (p.y - p.py) * 0.995;
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + g;
      }
      if (grab) {
        grab.p.x += (grab.tx - grab.ox - grab.p.x) * 0.5;
        grab.p.y += (grab.ty - grab.oy - grab.p.y) * 0.5;
      }
      for (let it = 0; it < 4; it++) {
        for (const b of bodies) {
          const dx = b.b.x - b.a.x, dy = b.b.y - b.a.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          const diff = ((d - b.len) / d) * 0.5;
          b.a.x += dx * diff; b.a.y += dy * diff;
          b.b.x -= dx * diff; b.b.y -= dy * diff;
        }
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const A = bodies[i]!, B = bodies[j]!;
            const { s, t } = closest(A.a, A.b, B.a, B.b);
            const ax = A.a.x + (A.b.x - A.a.x) * s, ay = A.a.y + (A.b.y - A.a.y) * s;
            const bx = B.a.x + (B.b.x - B.a.x) * t, by = B.a.y + (B.b.y - B.a.y) * t;
            let nx = bx - ax, ny = by - ay;
            const dist = Math.hypot(nx, ny);
            const min = A.r + B.r;
            if (dist >= min) continue;
            if (dist < 1e-4) { nx = 0; ny = 1; } else { nx /= dist; ny /= dist; }
            const pen = (min - dist) * 0.5;
            const ka = 1 / ((1 - s) ** 2 + s ** 2), kb = 1 / ((1 - t) ** 2 + t ** 2);
            A.a.x -= nx * pen * (1 - s) * ka; A.a.y -= ny * pen * (1 - s) * ka;
            A.b.x -= nx * pen * s * ka; A.b.y -= ny * pen * s * ka;
            B.a.x += nx * pen * (1 - t) * kb; B.a.y += ny * pen * (1 - t) * kb;
            B.b.x += nx * pen * t * kb; B.b.y += ny * pen * t * kb;
          }
        }
        for (const b of bodies) { wall(b.a, b.r); wall(b.b, b.r); }
      }
    };

    const loop = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      if (running) while (acc >= dt) { step(); acc -= dt; }
      else acc = 0;
      render();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    let io: IntersectionObserver | undefined;
    if (!running) {
      io = new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) { running = true; io?.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(root);
    }

    const ro = new ResizeObserver(() => { W = root.clientWidth; H = root.clientHeight; });
    ro.observe(root);

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      if (!draggable) return;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-gravity-item]");
      const body = bodies.find((b) => b.el === el);
      if (!body) return;
      running = true;
      const { x, y } = local(e);
      const p = Math.hypot(body.a.x - x, body.a.y - y) < Math.hypot(body.b.x - x, body.b.y - y) ? body.a : body.b;
      grab = { p, ox: x - p.x, oy: y - p.y, tx: x, ty: y };
      root.setPointerCapture(e.pointerId);
      el!.style.cursor = "grabbing";
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (!grab) return;
      const { x, y } = local(e);
      grab.tx = x; grab.ty = y;
    };
    const up = () => {
      if (!grab) return;
      for (const b of bodies) b.el.style.cursor = "";
      grab = null;
    };
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, [count, gravity, bounce, start, draggable, reduced]);

  return (
    <div
      ref={box}
      {...props}
      className={cn(
        "relative overflow-hidden select-none",
        reduced && "flex flex-wrap content-end items-end justify-center gap-2 p-4",
        className,
      )}
      style={{ touchAction: draggable && !reduced ? "none" : undefined, ...props.style }}
    >
      {items.map((child, i) => (
        <div
          key={(React.isValidElement(child) && child.key) || i}
          data-gravity-item=""
          className={cn(!reduced && "absolute left-0 top-0 opacity-0 will-change-transform", draggable && !reduced && "cursor-grab")}
          style={{ transformOrigin: "center" }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/** A pill to drop into a GravityBox. */
export function GravityPill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex h-12 items-center whitespace-nowrap rounded-full border border-border bg-surface-raised px-5 font-display text-base font-medium text-foreground shadow-sm", className)}
      {...props}
    />
  );
}
