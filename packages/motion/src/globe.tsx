"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type GlobeMarker = { id?: string; lat: number; lng: number; label?: string; size?: number };
export type GlobeArc = { from: [number, number]; to: [number, number] };

export type GlobeProps = {
  markers?: GlobeMarker[];
  /** Animated arcs between [lat, lng] pairs. */
  arcs?: GlobeArc[];
  /** Degrees per second of auto-rotation. 0 to stop. */
  speed?: number;
  /** Starting longitude facing the viewer. */
  initialLng?: number;
  tilt?: number;
  /** Dot and marker colours; defaults follow the theme. */
  dotColor?: string;
  markerColor?: string;
  /** Let people spin it with a drag. */
  draggable?: boolean;
  className?: string;
};

// 180x90 equirectangular land mask, run-length encoded (hex run lengths, alternating sea/land).
const LAND = "24f,5,b,6,1,4,90,2,3,3,1,6,1,19,22,2,1,1,1,1,e,1,50,1,4,4,1,4,4,18,10,4,26,2,1,1,44,2,e,4,4,1b,11,1,2a,3,44,1,1,3,3,1,1,1,1,6,b,13,26,2,e,c,d,3,2,1,2b,3,1,2,2,1,3,4,1,7,b,e,1,1,26,1,b,15,2,3,19,1,a,2,12,7,4,2,1,a,a,c,1,1,17,1,d,2,5,3,1,4,1,17,1,a,1,2,a,1,8,d,1,9,2,3,1,2,1,2,1,3,1,2,1,1,1,4,8,d,16,9,6,1,5,3,1,2,3,37,5,28,5,4,5,a,18,e,1,1,1,c,1,35,2,2,3,27,1,1,3,6,7,5,9,5,d,5,2,4,1,1,1,46,8,25,9,2,1,1,7,4,19,5,2,4f,7,7,1,1,1,1a,8,4,b,3,17,7,2,43,2,1,1,4,d,4,9,15,8,5,1,1,23,2,1,3,3,3b,9,2,13,1,a,1,1,15,7,7,1c,2,5,1,1,2,3,3a,9,3,20,1a,2,a,19,3,5,1,2,1,3,3a,9,3,22,19,1,b,17,2,1,2,3,43,1,1,6,1,25,23,1b,2,1,45,1,1,2d,1,1,1b,1,1,3,2,1a,47,30,1e,5,1,19,14,1,31,2,1,2e,1f,1e,7,1,8,2,1,1,31,32,1b,1e,7,3,2,2,5,6,2f,3,3,2d,19,21,4,4,1,2,2,1,4,1,32,35,18,21,5,4,1,3,1,2,1,1,2e,4,1,6,1,30,17,23,2,5,2,1,1,3,1,1,30,2,2,3,2,32,16,23,8,7,1,3,1,1,2a,3,1,2,4,33,13,24,a,c,2a,5,2,37,11,24,e,1,4,1,2e,3f,8,7,1,23,15,1,7,1,24,3e,1,1,6,8,1,21,18,1,7,2,21,40,1,1,5,2a,18,2,7,7,1a,44,4,7,2,20,1a,1,b,4,18,2,1,42,4,4,2,4,1,1e,1b,1,9,6,8,3,8,4a,4,2,2,8,2,1a,1b,2,8,8,5,5,6,1,1,4b,6,24,1c,1,6,a,4,6,1,1,5,6,1,49,4,21,1d,1,4,c,3,9,5,6,1,4b,2,22,1d,1,1,e,3,9,6,5,2,4b,1,5,3,1a,1e,2,2,c,2,9,1,2,2,8,1,4b,1,1,1,1,8,17,20,d,1,a,1,2,1,58,a,17,1f,f,1,15,1,4e,d,15,2,6,15,18,1,1,2,5,2,52,e,1e,12,1a,1,1,1,4,3,51,f,1e,11,1b,3,2,5,1,1,4f,11,1b,11,1d,2,3,4,6,2,49,14,19,f,1f,2,2,3,1,1,4,1,1,1,1,3,44,17,18,e,20,1,10,4,43,17,17,e,21,4,c,4,5,1,3e,15,19,d,26,1,3,1,7,2,1,1,6,1,3c,14,1a,d,7a,13,19,e,4,1,28,3,3,1,46,12,1a,e,4,1,26,5,3,2,a,1,3c,10,1a,e,2,3,24,c,48,f,1a,c,4,3,24,c,48,f,1b,b,4,2,22,11,7,1,3e,d,1d,b,4,2,21,12,46,b,1f,a,5,2,21,13,45,b,20,8,29,14,43,b,21,8,29,14,43,a,23,6,2b,13,43,a,23,5,2c,4,5,9,44,7,57,1,9,7,44,9,62,5,c,1,37,6,76,2,36,4,1,1,67,2,c,2,38,4,69,1,b,2,38,4,75,2,39,4,b0,3,44,1,6b,3,b2,3,b3,1,c70";
const MW = 180, MH = 90;
let mask: Uint8Array | null = null;
function landMask() {
  if (mask) return mask;
  mask = new Uint8Array(MW * MH);
  let i = 0, v = 0;
  for (const r of LAND.split(",")) {
    const n = parseInt(r, 16);
    if (v) mask.fill(1, i, i + n);
    i += n;
    v ^= 1;
  }
  return mask;
}
const isLand = (lat: number, lng: number) => {
  const x = Math.floor(((lng + 180) / 360) * MW) % MW;
  const y = Math.min(MH - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MH)));
  return landMask()[y * MW + x] === 1;
};

const RAD = Math.PI / 180;
function project(lat: number, lng: number, rot: number, tilt: number) {
  const phi = lat * RAD, lam = (lng + rot) * RAD, t = tilt * RAD;
  const x = Math.cos(phi) * Math.sin(lam);
  const y0 = Math.sin(phi), z0 = Math.cos(phi) * Math.cos(lam);
  const y = y0 * Math.cos(t) - z0 * Math.sin(t);
  const z = y0 * Math.sin(t) + z0 * Math.cos(t);
  return { x, y: -y, z };
}
function slerp(a: [number, number], b: [number, number], k: number): [number, number] {
  const toV = ([la, ln]: [number, number]) => [Math.cos(la * RAD) * Math.cos(ln * RAD), Math.cos(la * RAD) * Math.sin(ln * RAD), Math.sin(la * RAD)];
  const p = toV(a), q = toV(b);
  const d = Math.acos(Math.min(1, p[0]! * q[0]! + p[1]! * q[1]! + p[2]! * q[2]!)) || 1e-6;
  const s1 = Math.sin((1 - k) * d) / Math.sin(d), s2 = Math.sin(k * d) / Math.sin(d);
  const v = [0, 1, 2].map((i) => s1 * p[i]! + s2 * q[i]!);
  return [Math.asin(v[2]!) / RAD, Math.atan2(v[1]!, v[0]!) / RAD];
}

/** A dotted, rotating world globe on canvas: markers with pulses, travelling arcs and drag to spin. No dependencies. */
export function Globe({ markers = [], arcs = [], speed = 6, initialLng = -20, tilt = 18, dotColor, markerColor, draggable = true, className }: GlobeProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rot = React.useRef(initialLng);
  const drag = React.useRef<{ x: number; r: number } | null>(null);
  const vel = React.useRef(0);

  // Fibonacci sphere points that fall on land.
  const dots = React.useMemo(() => {
    const out: [number, number][] = [];
    const N = 9000, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const lat = Math.asin(y) / RAD;
      const lng = (((i * ga) / RAD) % 360) - 180;
      if (isLand(lat, lng)) out.push([lat, lng]);
    }
    return out;
  }, []);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now(), visible = true;
    const css = getComputedStyle(canvas);
    const dc = dotColor || css.getPropertyValue("--kn-muted").trim() || "#9a9a9a";
    const mc = markerColor || css.getPropertyValue("--kn-accent").trim() || "#C6F432";
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(canvas);

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!visible) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!drag.current) {
        vel.current *= 0.95;
        rot.current += (reduce ? 0 : speed) * dt + vel.current;
      }
      const R = Math.min(w, h) / 2 / 1.12, cx = w / 2, cy = h / 2;

      // Soft halo and body.
      const g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.08);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, mc);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.14;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = dc;
      for (const [la, ln] of dots) {
        const p = project(la, ln, rot.current, tilt);
        if (p.z <= 0) continue;
        ctx.globalAlpha = 0.15 + p.z * 0.7;
        const s = 0.6 + p.z * 0.9;
        ctx.fillRect(cx + p.x * R - s / 2, cy + p.y * R - s / 2, s, s);
      }
      ctx.globalAlpha = 1;

      // Arcs: a lifted great-circle path with a travelling head.
      const t = (now / 1000) % 3;
      arcs.forEach((a, k) => {
        const phase = ((t + k * 0.6) % 3) / 3;
        ctx.beginPath();
        let started = false;
        const N = 48;
        for (let i = 0; i <= N; i++) {
          const f = i / N;
          const [la, ln] = slerp(a.from, a.to, f);
          const lift = 1 + Math.sin(f * Math.PI) * 0.18;
          const p = project(la, ln, rot.current, tilt);
          if (p.z < -0.05) { started = false; continue; }
          const x = cx + p.x * R * lift, y = cy + p.y * R * lift;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = mc;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        const [hla, hln] = slerp(a.from, a.to, phase);
        const hp = project(hla, hln, rot.current, tilt);
        if (hp.z > 0) {
          const lift = 1 + Math.sin(phase * Math.PI) * 0.18;
          ctx.fillStyle = mc;
          ctx.beginPath(); ctx.arc(cx + hp.x * R * lift, cy + hp.y * R * lift, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Markers with expanding pulses.
      for (const m of markers) {
        const p = project(m.lat, m.lng, rot.current, tilt);
        if (p.z <= 0) continue;
        const x = cx + p.x * R, y = cy + p.y * R, s = (m.size ?? 3) * (0.6 + p.z * 0.4);
        const pulse = ((now / 1600 + (m.lat + 90) / 180) % 1);
        ctx.strokeStyle = mc;
        ctx.globalAlpha = (1 - pulse) * p.z;
        ctx.beginPath(); ctx.arc(x, y, s + pulse * 12, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = p.z;
        ctx.fillStyle = mc;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        if (m.label && p.z > 0.55) {
          ctx.font = "500 11px Inter, system-ui, sans-serif";
          ctx.fillStyle = css.getPropertyValue("--kn-foreground").trim() || "#fff";
          ctx.fillText(m.label, x + s + 5, y + 4);
        }
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => (cancelAnimationFrame(raf), io.disconnect());
  }, [dots, markers, arcs, speed, tilt, dotColor, markerColor]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={markers.length ? `Globe showing ${markers.map((m) => m.label).filter(Boolean).join(", ")}` : "Rotating globe"}
      onPointerDown={draggable ? (e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, r: rot.current }; } : undefined}
      onPointerMove={draggable ? (e) => { if (!drag.current) return; const nr = drag.current.r + (e.clientX - drag.current.x) * 0.35; vel.current = (nr - rot.current); rot.current = nr; } : undefined}
      onPointerUp={draggable ? () => (drag.current = null) : undefined}
      onPointerCancel={draggable ? () => (drag.current = null) : undefined}
      className={cn("aspect-square w-full touch-pan-y", draggable && "cursor-grab active:cursor-grabbing", className)}
    />
  );
}
