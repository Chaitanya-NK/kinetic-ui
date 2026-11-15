"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";

/* 100×50 land mask (equirectangular, lat 82°N → 56°S), one hex row per line. Generated from public land-mask data. */
const LAND: string[] = [
  "000000affffc0100400800000",
  "00000033fff80280000000000",
  "00003bf03ff00000203f80d00",
  "0001fa781fe00000057ffc600",
  "07e63d261fe001e017ffffffe",
  "87ffffe39f8003fbfffffffff",
  "07ffffa30e0c07f7fffffffff",
  "0fffff0c04001efffffffffec",
  "0207ff0f0000067fffffff820",
  "0407ffc7800088ffffffff060",
  "0003ffffc0014fffffffffc40",
  "0003ffff00003fffffffffc00",
  "0001fffd20007fffffffffc00",
  "0000fffe80003bdfffffff400",
  "0001fffc0000edc3fffffc000",
  "0000fff80001ca7fffffe0000",
  "0000fff80000b80ffffff4800",
  "00007ff00000f80fffffe0000",
  "00001fe00001fefffffff0000",
  "00003e100001fffffffff0000",
  "00000e100003ffff5fffe0000",
  "000006100007fff7e3ffd0000",
  "000006480007fff7c3ce80000",
  "000003800007fffb838f10000",
  "000000e00007fffb010700000",
  "000000220003fffc010700000",
  "000000078003ffff018400000",
  "0000000fc001dfff008020000",
  "0000000ff00007fe000760000",
  "0000000ff00007fc0002fc000",
  "0000000ffc0007f8000250800",
  "0000001fff0007f8000000c00",
  "0000000fff0003f8000082e40",
  "0000000fff0003f8000000000",
  "00000007fe0003f8000003400",
  "00000007fe0007f9000007400",
  "00000003fe0007f300000fe00",
  "00000001fe0003f200003fe00",
  "00000003f80003f200007ff00",
  "00000003f80003e000003ff80",
  "00000003f00001e000003ff80",
  "00000003e00001c0000039f00",
  "00000003c0000000000000f00",
  "00000003c0000000000000601",
  "0000000780000000000000000",
  "0000000300000000000000004",
  "0000000600000000000000000",
  "0000000600000000000000000",
  "0000000640000000000000000",
  "0000000300000000000000000",
];
const W = 100;
const H = 50;
const LAT_TOP = 82;
const LAT_SPAN = 138;

const isLand = (x: number, y: number) => {
  const row = LAND[y];
  if (!row) return false;
  const nibble = parseInt(row[Math.floor(x / 4)]!, 16);
  return ((nibble >> (3 - (x % 4))) & 1) === 1;
};

export const projectLatLng = (lat: number, lng: number) => ({ x: ((lng + 180) / 360) * W, y: ((LAT_TOP - lat) / LAT_SPAN) * H });

export type MapMarker = { id: string; lat: number; lng: number; label?: string; value?: React.ReactNode; color?: string; size?: number };
export type MapArc = { from: [number, number]; to: [number, number]; color?: string };

export type WorldMapProps = {
  markers?: MapMarker[];
  /** Curved, animated connections between [lat, lng] pairs. */
  arcs?: MapArc[];
  dotColor?: string;
  onMarkerClick?: (m: MapMarker) => void;
  className?: string;
};

/** Dotted world map with pulsing markers, tooltips and animated arcs. No map library or tiles needed. */
export function WorldMap({ markers = [], arcs = [], dotColor = "var(--kn-border-strong)", onMarkerClick, className }: WorldMapProps) {
  const [hover, setHover] = React.useState<MapMarker | null>(null);
  const dots = React.useMemo(() => {
    const d: string[] = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isLand(x, y)) d.push(`M${x + 0.5} ${y + 0.5}h0`);
    return d.join("");
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="World map">
        <path d={dots} stroke={dotColor} strokeWidth={0.55} strokeLinecap="round" />
        {arcs.map((a, i) => {
          const p = projectLatLng(...a.from);
          const q = projectLatLng(...a.to);
          const mx = (p.x + q.x) / 2;
          const my = Math.min(p.y, q.y) - Math.hypot(q.x - p.x, q.y - p.y) * 0.3;
          return (
            <motion.path
              key={i}
              d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`}
              fill="none"
              stroke={a.color ?? "var(--kn-accent)"}
              strokeWidth={0.35}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: i * 0.25, ease: "easeInOut" }}
            />
          );
        })}
        {markers.map((m) => {
          const p = projectLatLng(m.lat, m.lng);
          const r = m.size ?? 0.9;
          const c = m.color ?? "var(--kn-accent)";
          return (
            <g key={m.id} className="cursor-pointer" onPointerEnter={() => setHover(m)} onPointerLeave={() => setHover(null)} onClick={() => onMarkerClick?.(m)}>
              <circle cx={p.x} cy={p.y} r={r * 2.4} fill={c} opacity={0.25}>
                <animate attributeName="r" values={`${r};${r * 3};${r}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r={r} fill={c} stroke="var(--kn-background)" strokeWidth={0.25} />
            </g>
          );
        })}
      </svg>
      {hover ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg border border-border-strong bg-surface-overlay px-2.5 py-1.5 text-xs shadow-overlay"
          style={{ left: `${(projectLatLng(hover.lat, hover.lng).x / W) * 100}%`, top: `${(projectLatLng(hover.lat, hover.lng).y / H) * 100}%` }}
        >
          <div className="font-medium">{hover.label ?? hover.id}</div>
          {hover.value ? <div className="text-muted">{hover.value}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
