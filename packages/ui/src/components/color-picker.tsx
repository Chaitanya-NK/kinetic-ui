"use client";

import * as React from "react";
import { cn, useControllableState, useMounted } from "@kineticui/core";

type HSV = { h: number; s: number; v: number };

function hexToHsv(hex: string): HSV {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  const n = m ? parseInt(m[1]!, 16) : 0;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

function hsvToHex({ h, s, v }: HSV): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255);
  };
  return "#" + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function useDrag(onMove: (x: number, y: number) => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  const handle = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    onMove(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handle(e);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (e.buttons) handle(e);
    },
  };
}

export type ColorPickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** Preset swatches. */
  swatches?: string[];
  className?: string;
};

/** Saturation/brightness area, hue slider, hex field, eyedropper and swatches. */
export function ColorPicker({
  value,
  defaultValue = "#C6F432",
  onValueChange,
  swatches = ["#C6F432", "#7C8CFF", "#F4A86A", "#F0A3D0", "#6EE7A0", "#FBBF5A", "#FF8A8A", "#F4F4F5"],
  className,
}: ColorPickerProps) {
  const [hex, setHex] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [hsv, setHsv] = React.useState<HSV>(() => hexToHsv(hex));
  const [draft, setDraft] = React.useState(hex);

  React.useEffect(() => {
    if (hsvToHex(hsv) !== hex.toUpperCase()) setHsv(hexToHsv(hex));
    setDraft(hex.toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  const update = (next: HSV) => {
    setHsv(next);
    setHex(hsvToHex(next));
  };

  const area = useDrag((x, y) => update({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag((x) => update({ ...hsv, h: x * 360 }));
  // Feature-detect after mount so server and client render the same markup.
  const mounted = useMounted();
  const hasEyeDropper = mounted && "EyeDropper" in window;

  return (
    <div className={cn("flex w-64 flex-col gap-3", className)}>
      <div
        {...area}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={hex}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = 0.02;
          if (e.key === "ArrowRight") update({ ...hsv, s: Math.min(1, hsv.s + step) });
          if (e.key === "ArrowLeft") update({ ...hsv, s: Math.max(0, hsv.s - step) });
          if (e.key === "ArrowUp") update({ ...hsv, v: Math.min(1, hsv.v + step) });
          if (e.key === "ArrowDown") update({ ...hsv, v: Math.max(0, hsv.v - step) });
        }}
        className="relative h-36 cursor-crosshair touch-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
      >
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_1px_rgb(0_0_0/0.4)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>
      <div
        {...hue}
        role="slider"
        aria-label="Hue"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") update({ ...hsv, h: (hsv.h + 4) % 360 });
          if (e.key === "ArrowLeft") update({ ...hsv, h: (hsv.h + 356) % 360 });
        }}
        className="relative h-3 cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
      >
        <span
          className="pointer-events-none absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white"
          style={{ left: `${(hsv.h / 360) * 100}%`, background: `hsl(${hsv.h} 100% 50%)` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="size-9 shrink-0 rounded-lg border border-border" style={{ background: hex }} />
        <input
          aria-label="Hex colour"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setHex(e.target.value.toUpperCase());
          }}
          className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 font-mono text-sm uppercase text-foreground outline-none focus:border-accent"
        />
        {hasEyeDropper ? (
          <button
            type="button"
            aria-label="Pick a colour from the screen"
            onClick={async () => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const res = await new (window as any).EyeDropper().open().catch(() => null);
              if (res?.sRGBHex) setHex(String(res.sRGBHex).toUpperCase());
            }}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M10 2.5l3.5 3.5-1.5 1.5-3.5-3.5zM8.5 4L2.5 10v3.5H6l6-6" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {swatches.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={s}
            onClick={() => setHex(s)}
            className={cn("size-6 rounded-md border border-border transition-transform hover:scale-110", hex.toUpperCase() === s.toUpperCase() && "ring-2 ring-foreground ring-offset-2 ring-offset-background")}
            style={{ background: s }}
          />
        ))}
      </div>
    </div>
  );
}
