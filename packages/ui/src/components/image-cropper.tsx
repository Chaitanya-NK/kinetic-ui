"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type ImageCropperHandle = {
  /** Renders the visible crop to a data URL. */
  getCroppedImage: (opts?: { size?: number; type?: string; quality?: number }) => string | null;
};

export type ImageCropperProps = {
  src: string;
  /** width / height of the crop frame. */
  aspect?: number;
  /** Round mask for avatars. */
  round?: boolean;
  maxZoom?: number;
  className?: string;
};

/** Pan-and-zoom cropper: drag the image, scroll or slide to zoom, export via ref. */
export const ImageCropper = React.forwardRef<ImageCropperHandle, ImageCropperProps>(function ImageCropper({ src, aspect = 1, round, maxZoom = 3, className }, ref) {
  const frame = React.useRef<HTMLDivElement>(null);
  const img = React.useRef<HTMLImageElement>(null);
  const [nat, setNat] = React.useState({ w: 1, h: 1 });
  const [box, setBox] = React.useState({ w: 1, h: 1 });
  const [zoom, setZoom] = React.useState(1);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  React.useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e!.contentRect.width, h: e!.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Image scale that covers the frame at zoom 1.
  const base = Math.max(box.w / nat.w, box.h / nat.h);
  const scale = base * zoom;
  const clamp = (p: { x: number; y: number }, s = scale) => {
    const mx = Math.max(0, (nat.w * s - box.w) / 2);
    const my = Math.max(0, (nat.h * s - box.h) / 2);
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };

  React.useImperativeHandle(ref, () => ({
    getCroppedImage: ({ size = 512, type = "image/png", quality } = {}) => {
      const el = img.current;
      if (!el) return null;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = Math.round(size / aspect);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      // Visible region in natural pixels.
      const sw = box.w / scale;
      const sh = box.h / scale;
      const sx = nat.w / 2 - pos.x / scale - sw / 2;
      const sy = nat.h / 2 - pos.y / scale - sh / 2;
      if (round) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
        ctx.clip();
      }
      ctx.drawImage(el, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL(type, quality);
    },
  }));

  const setZoomClamped = (z: number) => {
    const nz = Math.max(1, Math.min(maxZoom, z));
    setZoom(nz);
    setPos((p) => clamp(p, base * nz));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        ref={frame}
        className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-black active:cursor-grabbing"
        style={{ aspectRatio: String(aspect) }}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (d) setPos(clamp({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y }));
        }}
        onPointerUp={() => (drag.current = null)}
        onWheel={(e) => setZoomClamped(zoom - e.deltaY * 0.002)}
        tabIndex={0}
        aria-label="Crop area. Use arrow keys to move, plus and minus to zoom."
        onKeyDown={(e) => {
          const step = 10;
          if (e.key === "ArrowLeft") setPos((p) => clamp({ ...p, x: p.x + step }));
          if (e.key === "ArrowRight") setPos((p) => clamp({ ...p, x: p.x - step }));
          if (e.key === "ArrowUp") setPos((p) => clamp({ ...p, y: p.y + step }));
          if (e.key === "ArrowDown") setPos((p) => clamp({ ...p, y: p.y - step }));
          if (e.key === "+" || e.key === "=") setZoomClamped(zoom + 0.1);
          if (e.key === "-") setZoomClamped(zoom - 0.1);
        }}
      >
        <img
          ref={img}
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth || 1, h: e.currentTarget.naturalHeight || 1 })}
          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center"
          style={{ width: nat.w * scale, height: nat.h * scale, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
        />
        {round ? <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white/80" /> : null}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="border border-white/30" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 text-subtle">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        <input type="range" min={1} max={maxZoom} step={0.01} value={zoom} aria-label="Zoom" onChange={(e) => setZoomClamped(Number(e.target.value))} className="flex-1 accent-[var(--kn-accent)]" />
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
      </div>
    </div>
  );
});
