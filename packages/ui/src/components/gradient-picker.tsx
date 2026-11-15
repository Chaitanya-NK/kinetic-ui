"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CopyIcon, CheckIcon, PlusIcon, TrashIcon } from "@kineticui/icons";

export type GradientStop = { id: string; color: string; pos: number };
export type Gradient = { type: "linear" | "radial" | "conic"; angle: number; stops: GradientStop[] };

export const gradientToCss = (g: Gradient) => {
  const s = [...g.stops].sort((a, b) => a.pos - b.pos).map((x) => `${x.color} ${Math.round(x.pos)}%`).join(", ");
  return g.type === "linear" ? `linear-gradient(${g.angle}deg, ${s})` : g.type === "radial" ? `radial-gradient(circle, ${s})` : `conic-gradient(from ${g.angle}deg, ${s})`;
};

const presets: Gradient[] = [
  { type: "linear", angle: 135, stops: [{ id: "a", color: "#C6F432", pos: 0 }, { id: "b", color: "#1d2a4a", pos: 100 }] },
  { type: "linear", angle: 90, stops: [{ id: "a", color: "#F0A3D0", pos: 0 }, { id: "b", color: "#7C8CFF", pos: 50 }, { id: "c", color: "#6EE7A0", pos: 100 }] },
  { type: "radial", angle: 0, stops: [{ id: "a", color: "#F5C451", pos: 0 }, { id: "b", color: "#F4A86A", pos: 45 }, { id: "c", color: "#3a1230", pos: 100 }] },
  { type: "conic", angle: 0, stops: [{ id: "a", color: "#7C8CFF", pos: 0 }, { id: "b", color: "#F0A3D0", pos: 33 }, { id: "c", color: "#C6F432", pos: 66 }, { id: "d", color: "#7C8CFF", pos: 100 }] },
];

export type GradientPickerProps = {
  value?: Gradient;
  defaultValue?: Gradient;
  onChange?: (g: Gradient, css: string) => void;
  className?: string;
};

/** Gradient builder: draggable stops, linear/radial/conic, angle dial, presets and copy-as-CSS. */
export function GradientPicker({ value, defaultValue = presets[0]!, onChange, className }: GradientPickerProps) {
  const [inner, setInner] = React.useState(defaultValue);
  const g = value ?? inner;
  const [sel, setSel] = React.useState(g.stops[0]!.id);
  const [copied, setCopied] = React.useState(false);
  const bar = React.useRef<HTMLDivElement>(null);
  const dial = React.useRef<HTMLDivElement>(null);
  const css = gradientToCss(g);
  const set = (next: Gradient) => {
    if (!value) setInner(next);
    onChange?.(next, gradientToCss(next));
  };
  const selected = g.stops.find((s) => s.id === sel) ?? g.stops[0]!;
  const updateStop = (id: string, patch: Partial<GradientStop>) => set({ ...g, stops: g.stops.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const posFrom = (clientX: number) => {
    const r = bar.current!.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-surface p-4", className)}>
      <div className="h-40 rounded-xl border border-border" style={{ background: css }} />
      <div className="flex items-center gap-2">
        {(["linear", "radial", "conic"] as const).map((t) => (
          <button key={t} type="button" aria-pressed={g.type === t} onClick={() => set({ ...g, type: t })} className={cn("h-8 rounded-lg px-3 text-xs capitalize", g.type === t ? "bg-surface-overlay text-foreground" : "text-subtle hover:text-foreground")}>
            {t}
          </button>
        ))}
        {g.type !== "radial" ? (
          <div
            ref={dial}
            role="slider"
            tabIndex={0}
            aria-label="Angle"
            aria-valuenow={g.angle}
            aria-valuemin={0}
            aria-valuemax={360}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") set({ ...g, angle: (g.angle + 5) % 360 });
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") set({ ...g, angle: (g.angle + 355) % 360 });
            }}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const r = dial.current!.getBoundingClientRect();
              const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
              set({ ...g, angle: Math.round((a + 360) % 360) });
            }}
            className="relative ml-auto size-9 cursor-grab rounded-full border border-border-strong bg-background outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="absolute left-1/2 top-1/2 h-3.5 w-0.5 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-accent" style={{ transform: `translate(-50%,-100%) rotate(${g.angle}deg)` }} />
          </div>
        ) : null}
        {g.type !== "radial" ? <span className="w-10 font-mono text-xs text-muted">{g.angle}°</span> : null}
      </div>
      <div
        ref={bar}
        className="relative h-8 cursor-copy rounded-lg border border-border"
        style={{ background: gradientToCss({ ...g, type: "linear", angle: 90 }) }}
        onDoubleClick={(e) => {
          const id = Math.random().toString(36).slice(2, 7);
          set({ ...g, stops: [...g.stops, { id, color: selected.color, pos: posFrom(e.clientX) }] });
          setSel(id);
        }}
        title="Double-click to add a stop"
      >
        {g.stops.map((s) => (
          <motion.button
            key={s.id}
            type="button"
            aria-label={`Stop ${s.color} at ${Math.round(s.pos)}%`}
            onPointerDown={(e) => {
              setSel(s.id);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && updateStop(s.id, { pos: posFrom(e.clientX) })}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") updateStop(s.id, { pos: Math.min(100, s.pos + 1) });
              if (e.key === "ArrowLeft") updateStop(s.id, { pos: Math.max(0, s.pos - 1) });
            }}
            className={cn("absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-[3px] shadow-md", sel === s.id ? "border-white ring-2 ring-accent" : "border-white/80")}
            style={{ left: `${s.pos}%`, background: s.color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border-strong" style={{ background: selected.color }}>
          <input type="color" value={selected.color} onChange={(e) => updateStop(selected.id, { color: e.target.value })} aria-label="Stop colour" className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <input value={selected.color} onChange={(e) => updateStop(selected.id, { color: e.target.value })} aria-label="Hex" className="h-9 w-24 rounded-lg border border-border bg-background px-2 font-mono text-xs uppercase outline-none focus:border-accent" />
        <span className="font-mono text-xs text-subtle">{Math.round(selected.pos)}%</span>
        <button type="button" aria-label="Add stop" onClick={() => { const id = Math.random().toString(36).slice(2, 7); set({ ...g, stops: [...g.stops, { id, color: "#ffffff", pos: 50 }] }); setSel(id); }} className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-foreground">
          <PlusIcon size={15} />
        </button>
        <button type="button" aria-label="Remove stop" disabled={g.stops.length <= 2} onClick={() => { const rest = g.stops.filter((s) => s.id !== selected.id); set({ ...g, stops: rest }); setSel(rest[0]!.id); }} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-30">
          <TrashIcon size={15} />
        </button>
      </div>
      <div className="flex gap-2">
        {presets.map((p, i) => (
          <button key={i} type="button" aria-label={`Preset ${i + 1}`} onClick={() => { set(p); setSel(p.stops[0]!.id); }} className="h-8 flex-1 rounded-lg border border-border transition-transform hover:scale-105" style={{ background: gradientToCss(p) }} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(`background: ${css};`);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
        className="flex items-center gap-2 rounded-lg bg-background p-2.5 text-left font-mono text-[11px] text-muted hover:text-foreground"
      >
        <span className="flex-1 truncate">background: {css};</span>
        {copied ? <CheckIcon size={14} className="text-success" /> : <CopyIcon size={14} />}
      </button>
    </div>
  );
}
