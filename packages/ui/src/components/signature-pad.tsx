"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type SignaturePadHandle = { clear: () => void; toDataURL: () => string; isEmpty: () => boolean };

export type SignaturePadProps = {
  /** Called after each stroke with a PNG data URL, or null when cleared. */
  onChange?: (dataUrl: string | null) => void;
  height?: number;
  /** Stroke colour. Defaults to the foreground token. */
  color?: string;
  lineWidth?: number;
  className?: string;
  "aria-label"?: string;
};

/** Draw a signature with mouse, pen or finger. Smooth strokes, retina-sharp. */
export const SignaturePad = React.forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onChange, height = 180, color, lineWidth = 2.5, className, ...rest }, ref) => {
    const canvas = React.useRef<HTMLCanvasElement>(null);
    const last = React.useRef<{ x: number; y: number } | null>(null);
    const [empty, setEmpty] = React.useState(true);

    const ctx = () => canvas.current?.getContext("2d") ?? null;

    React.useEffect(() => {
      const c = canvas.current;
      if (!c) return;
      const resize = () => {
        const ratio = window.devicePixelRatio || 1;
        const { width } = c.getBoundingClientRect();
        c.width = width * ratio;
        c.height = height * ratio;
        const g = c.getContext("2d")!;
        g.scale(ratio, ratio);
        g.lineCap = "round";
        g.lineJoin = "round";
        setEmpty(true);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(c);
      return () => ro.disconnect();
    }, [height]);

    const clear = React.useCallback(() => {
      const c = canvas.current;
      const g = ctx();
      if (!c || !g) return;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, c.width, c.height);
      g.restore();
      setEmpty(true);
      onChange?.(null);
    }, [onChange]);

    React.useImperativeHandle(ref, () => ({
      clear,
      toDataURL: () => canvas.current?.toDataURL("image/png") ?? "",
      isEmpty: () => empty,
    }));

    const point = (e: React.PointerEvent) => {
      const r = canvas.current!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    return (
      <div className={cn("relative overflow-hidden rounded-2xl border border-dashed border-border-strong bg-background", className)} style={{ height }}>
        <canvas
          ref={canvas}
          role="img"
          aria-label={rest["aria-label"] ?? (empty ? "Empty signature pad" : "Signature")}
          className="absolute inset-0 size-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = point(e);
          }}
          onPointerMove={(e) => {
            if (!last.current) return;
            const g = ctx();
            if (!g) return;
            const p = point(e);
            const pressure = e.pressure > 0 && e.pointerType === "pen" ? e.pressure * 2 : 1;
            g.strokeStyle = color ?? getComputedStyle(e.currentTarget).getPropertyValue("--kn-foreground") ?? "#000";
            g.lineWidth = lineWidth * pressure;
            g.beginPath();
            g.moveTo(last.current.x, last.current.y);
            const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
            g.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
            g.lineTo(p.x, p.y);
            g.stroke();
            last.current = p;
            if (empty) setEmpty(false);
          }}
          onPointerUp={() => {
            last.current = null;
            if (!empty) onChange?.(canvas.current?.toDataURL("image/png") ?? null);
          }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-8 h-px bg-border" />
        {empty ? <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-subtle">Sign above the line</span> : null}
        {!empty ? (
          <button type="button" onClick={clear} className="absolute right-3 top-3 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted hover:text-foreground">
            Clear
          </button>
        ) : null}
      </div>
    );
  },
);
SignaturePad.displayName = "SignaturePad";
