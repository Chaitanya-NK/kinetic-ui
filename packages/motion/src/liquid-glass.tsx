"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type LiquidGlassProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Corner radius in px. */
  radius?: number;
  /** How strongly the edges bend what's behind (px). */
  refraction?: number;
  /** Background blur in px. */
  blur?: number;
  /** Extra colour saturation of what's behind. */
  saturation?: number;
  /** A faint tint mixed over the glass, e.g. "rgba(255,255,255,0.06)". */
  tint?: string;
  /** Splits colour channels slightly at the rim, like a real lens. */
  dispersion?: boolean;
  as?: React.ElementType;
};

/*
 * A refraction map: red encodes horizontal displacement, green vertical. The middle is neutral grey, so only the
 * rim bends light, which is what makes thick glass look like glass rather than frosted plastic.
 */
function mapUrl(w: number, h: number, r: number, edge: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
<linearGradient id="x" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="1" stop-color="#000"/></linearGradient>
<filter id="b"><feGaussianBlur stdDeviation="${Math.max(2, edge / 2.4)}"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="#000"/>
<rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/>
<rect width="${w}" height="${h}" rx="${r}" fill="url(#y)" style="mix-blend-mode:screen"/>
<rect x="${edge}" y="${edge}" width="${Math.max(1, w - edge * 2)}" height="${Math.max(1, h - edge * 2)}" rx="${Math.max(0, r - edge)}" fill="#808080" filter="url(#b)"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const supportsSvgBackdrop = () => {
  if (typeof navigator === "undefined") return false;
  // Only Chromium applies SVG filters inside backdrop-filter; others get the blur-only fallback.
  return /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent);
};

/**
 * Glass that bends what's behind it at the edges, with a specular rim and soft blur. Real refraction in
 * Chromium browsers; an elegant frosted fallback elsewhere. Put anything inside.
 */
export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ radius = 28, refraction = 38, blur = 3, saturation = 1.6, tint = "rgba(255,255,255,0.05)", dispersion = true, as: Tag = "div", className, style, children, ...props }, fwd) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(fwd, () => ref.current!);
    const id = `kn-glass-${React.useId().replace(/:/g, "")}`;
    const [size, setSize] = React.useState({ w: 0, h: 0 });
    const [svgOk, setSvgOk] = React.useState(false);
    React.useEffect(() => {
      setSvgOk(supportsSvgBackdrop());
      const el = ref.current;
      if (!el) return;
      const ro = new ResizeObserver(() => setSize({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) }));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);
    const edge = Math.min(radius, size.h / 2, size.w / 2, 40);
    const ready = svgOk && size.w > 0;
    const backdrop = ready ? `url(#${id}) blur(${blur}px) saturate(${saturation})` : `blur(${blur + 10}px) saturate(${saturation})`;

    return (
      <Tag
        ref={ref}
        className={cn("relative isolate overflow-hidden", className)}
        style={{ borderRadius: radius, ...style }}
        {...props}
      >
        {ready ? (
          <svg aria-hidden width="0" height="0" style={{ position: "absolute" }} colorInterpolationFilters="sRGB">
            <filter id={id} x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
              <feImage href={mapUrl(size.w, size.h, radius, edge)} x="0" y="0" width={size.w} height={size.h} result="map" />
              {dispersion ? (
                <>
                  <feDisplacementMap in="SourceGraphic" in2="map" scale={-refraction} xChannelSelector="R" yChannelSelector="G" result="r" />
                  <feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rc" />
                  <feDisplacementMap in="SourceGraphic" in2="map" scale={-refraction * 0.94} xChannelSelector="R" yChannelSelector="G" result="g" />
                  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gc" />
                  <feDisplacementMap in="SourceGraphic" in2="map" scale={-refraction * 0.88} xChannelSelector="R" yChannelSelector="G" result="b" />
                  <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bc" />
                  <feBlend in="rc" in2="gc" mode="screen" result="rg" />
                  <feBlend in="rg" in2="bc" mode="screen" />
                </>
              ) : (
                <feDisplacementMap in="SourceGraphic" in2="map" scale={-refraction} xChannelSelector="R" yChannelSelector="G" />
              )}
            </filter>
          </svg>
        ) : null}
        {/* the refracted backdrop */}
        <span aria-hidden className="absolute inset-0 -z-10" style={{ borderRadius: radius, backdropFilter: backdrop, WebkitBackdropFilter: `blur(${blur + 10}px) saturate(${saturation})`, background: tint }} />
        {/* specular rim and highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            borderRadius: radius,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.12), inset 1px 0 0 rgba(255,255,255,0.18), inset -1px 0 0 rgba(255,255,255,0.18), 0 12px 40px -12px rgba(0,0,0,0.45)",
            background: "linear-gradient(160deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.08))",
          }}
        />
        {children}
      </Tag>
    );
  },
);
LiquidGlass.displayName = "LiquidGlass";
