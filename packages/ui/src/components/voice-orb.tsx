"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type VoiceOrbState = "idle" | "listening" | "thinking" | "speaking";

export type VoiceOrbProps = {
  state?: VoiceOrbState;
  /** Audio level 0 to 1, or a function read every frame (cheaper than re-rendering). Speaking is simulated when left out. */
  level?: number | (() => number);
  /** Diameter in px. */
  size?: number;
  /** Three colours for the layered blobs. Defaults to the accent, cyan and violet. */
  colors?: [string, string, string];
  /** Makes the orb a button, e.g. to start or stop listening. */
  onClick?: () => void;
  /** Accessible name. Defaults to the state. */
  label?: string;
  className?: string;
};

const settings: Record<VoiceOrbState, { amp: number; react: number; speed: number; spin: number; scale: number }> = {
  idle: { amp: 0.035, react: 0, speed: 0.5, spin: 0.1, scale: 0.92 },
  listening: { amp: 0.06, react: 0.55, speed: 1, spin: 0.25, scale: 1 },
  thinking: { amp: 0.05, react: 0, speed: 1.6, spin: 1.6, scale: 0.88 },
  speaking: { amp: 0.08, react: 0.7, speed: 1.4, spin: 0.4, scale: 1.04 },
};

/** A living orb for voice assistants. It breathes when idle, follows the mic when listening, swirls while thinking and pulses with speech. */
export function VoiceOrb({ state = "idle", level, size = 200, colors, onClick, label, className }: VoiceOrbProps) {
  const reduced = useReducedMotion();
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const live = React.useRef({ state, level, colors, reduced });
  live.current = { state, level, colors, reduced };

  React.useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr;
    cv.height = size * dpr;
    ctx.scale(dpr, dpr);
    const accent = getComputedStyle(cv).getPropertyValue("--kn-accent").trim() || "#C6F432";

    let raf = 0;
    let t = 0;
    let last = performance.now();
    let amp = 0.03, lvl = 0, spin = 0, scale = 0.92;
    const c = size / 2;

    const rgba = (col: string, al: number) => {
      const m = /^#?([0-9a-f]{6})$/i.exec(col.trim());
      if (!m) return col;
      const n = parseInt(m[1]!, 16);
      return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${al})`;
    };

    // A wobbly closed shape: a circle whose radius is a sum of moving sines.
    const shape = (R: number, a: number, phase: number, ox = 0, oy = 0) => {
      ctx.beginPath();
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * Math.PI * 2;
        const r = R * (1 + a * (Math.sin(3 * th + phase * 1.3) * 0.55 + Math.sin(5 * th - phase * 0.9) * 0.3 + Math.sin(2 * th + phase * 0.6) * 0.45));
        const x = c + ox + Math.cos(th) * r, y = c + oy + Math.sin(th) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const blob = (R: number, a: number, phase: number, color: string, ox: number, oy: number, alpha: number) => {
      shape(R, a, phase, ox, oy);
      const g = ctx.createRadialGradient(c + ox, c + oy, 0, c + ox, c + oy, R * 1.15);
      g.addColorStop(0, rgba(color, alpha));
      g.addColorStop(0.7, rgba(color, alpha * 0.75));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.fill();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { state: st, level: lv, colors: cs, reduced: rm } = live.current;
      const s = settings[st];
      t += dt * s.speed * (rm ? 0.3 : 1);

      // Input level, or a speech-like envelope when none is given.
      let target = typeof lv === "function" ? lv() : (lv ?? 0);
      if (lv === undefined && st === "speaking") target = Math.max(0, 0.45 + 0.35 * Math.sin(t * 7.1) * Math.sin(t * 2.3) + 0.2 * Math.sin(t * 13.7));
      lvl += (target - lvl) * Math.min(1, dt * 14);
      amp += (s.amp + lvl * s.react * 0.35 - amp) * Math.min(1, dt * 6);
      scale += (s.scale + lvl * s.react * 0.12 - scale) * Math.min(1, dt * 8);
      spin += dt * s.spin * (rm ? 0.3 : 1);

      const [c1, c2, c3] = cs ?? [accent, "#22d3ee", "#a78bfa"];
      ctx.clearRect(0, 0, size, size);
      const R = size * 0.34 * scale;

      // outer glow
      ctx.globalCompositeOperation = "source-over";
      const glow = ctx.createRadialGradient(c, c, R * 0.8, c, c, size / 2);
      glow.addColorStop(0, rgba(c1, 0.22 + lvl * 0.25));
      glow.addColorStop(1, rgba(c1, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // the sphere
      ctx.save();
      shape(R, amp * 0.35, t * 1.2);
      const base = ctx.createRadialGradient(c, c - R * 0.2, R * 0.1, c, c, R);
      base.addColorStop(0, "#15171a");
      base.addColorStop(1, "#050506");
      ctx.fillStyle = base;
      ctx.fill();
      ctx.clip();

      // colour blobs swimming inside, softened
      ctx.globalCompositeOperation = "screen";
      ctx.filter = `blur(${Math.round(size * 0.045)}px)`;
      const orbit = R * (st === "thinking" ? 0.42 : 0.3);
      const br = R * (0.62 + lvl * 0.15);
      blob(br, amp * 2.4, t * 2 + 1, c2, Math.cos(spin) * orbit, Math.sin(spin) * orbit, 0.9);
      blob(br * 0.95, amp * 2.2, t * 2.4 + 3, c3, Math.cos(spin + 2.1) * orbit, Math.sin(spin + 2.1) * orbit, 0.9);
      blob(br * 0.9, amp * 2, t * 1.7, c1, Math.cos(spin + 4.2) * orbit, Math.sin(spin + 4.2) * orbit, 0.95);
      ctx.filter = "none";
      ctx.restore();

      // glass: specular highlight and rim
      ctx.globalCompositeOperation = "source-over";
      const hi = ctx.createRadialGradient(c - R * 0.35, c - R * 0.5, 0, c - R * 0.35, c - R * 0.5, R * 0.55);
      hi.addColorStop(0, "rgba(255,255,255,.35)");
      hi.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hi;
      shape(R, amp * 0.35, t * 1.2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.14)";
      ctx.lineWidth = 1;
      ctx.stroke();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  const name = label ?? { idle: "Voice assistant, idle", listening: "Listening", thinking: "Thinking", speaking: "Speaking" }[state];
  const Comp = onClick ? motion.button : motion.div;

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={name}
      role={onClick ? undefined : "img"}
      whileTap={onClick ? { scale: 0.94 } : undefined}
      className={cn("relative inline-grid shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring", onClick && "cursor-pointer", className)}
      style={{ width: size, height: size }}
    >
      <canvas ref={canvas} style={{ width: size, height: size }} aria-hidden />
      <span className="sr-only" aria-live="polite">
        {name}
      </span>
    </Comp>
  );
}

/**
 * Microphone level for the orb. `start()` asks for the mic; read `level()` every frame.
 */
export function useMicrophoneLevel() {
  const [active, setActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const st = React.useRef<{ stream?: MediaStream; ctx?: AudioContext; an?: AnalyserNode; buf?: Uint8Array<ArrayBuffer> }>({});

  const stop = React.useCallback(() => {
    st.current.stream?.getTracks().forEach((t) => t.stop());
    void st.current.ctx?.close();
    st.current = {};
    setActive(false);
  }, []);

  const start = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      st.current = { stream, ctx, an, buf: new Uint8Array(new ArrayBuffer(an.fftSize)) };
      setError(null);
      setActive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone unavailable");
    }
  }, []);

  const level = React.useCallback(() => {
    const { an, buf } = st.current;
    if (!an || !buf) return 0;
    an.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(sum / buf.length) * 4);
  }, []);

  React.useEffect(() => stop, [stop]);
  return { start, stop, active, error, level };
}
