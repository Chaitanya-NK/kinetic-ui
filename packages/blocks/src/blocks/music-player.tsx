"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { Slider } from "@kineticui/ui";
import { HeartIcon, PauseIcon, PlayIcon } from "@kineticui/icons";

const tracks = [
  { title: "Night Drive", artist: "Kinetic Sessions", len: 214, a: "#C6F432", b: "#1d2a4a" },
  { title: "Soft Focus", artist: "Lumen", len: 187, a: "#F0A3D0", b: "#3a1230" },
  { title: "Low Orbit", artist: "Atlas & Co", len: 242, a: "#7C8CFF", b: "#0b0c0e" },
  { title: "Paper Planes", artist: "Mira", len: 199, a: "#F4A86A", b: "#4a2a12" },
];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Btn({ label, d, onClick }: { label: string; d: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-10 items-center justify-center rounded-full text-muted hover:text-foreground">
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d={d} /></svg>
    </button>
  );
}

/** Now-playing card: spinning artwork, animated equaliser, scrubber, transport controls and an up-next queue. Simulated playback. */
export function MusicPlayer() {
  const [i, setI] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(46);
  const [liked, setLiked] = React.useState<Set<number>>(new Set([0]));
  const t = tracks[i]!;

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPos((p) => (p + 1 >= t.len ? (setI((x) => (x + 1) % tracks.length), 0) : p + 1)), 1000);
    return () => window.clearInterval(id);
  }, [playing, t.len]);

  const go = (d: number) => {
    setI((x) => (x + d + tracks.length) % tracks.length);
    setPos(0);
  };

  return (
    <section className="flex min-h-[640px] items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-[28px] border border-border bg-surface p-6">
        <div className="relative mx-auto mt-2 size-56">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: playing ? 360 : 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ rotate: playing ? { duration: 12, repeat: Infinity, ease: "linear" } : { duration: 0.6 }, opacity: { duration: 0.3 } }}
              className="absolute inset-0 rounded-full shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)]"
              style={{ background: `radial-gradient(circle at 50% 50%, var(--kn-surface) 0 14%, transparent 15%), repeating-radial-gradient(circle at 50% 50%, transparent 0 3px, rgba(255,255,255,0.04) 3px 4px), conic-gradient(from 0deg, ${t.a}, ${t.b}, ${t.a})` }}
            />
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-xl font-semibold">{t.title}</div>
            <div className="truncate text-sm text-muted">{t.artist}</div>
          </div>
          <span className="flex h-5 items-end gap-0.5" aria-hidden>
            {[0, 1, 2, 3].map((k) => (
              <span key={k} className={cn("w-1 origin-bottom rounded-full bg-accent", playing ? "animate-[kn-wave_0.9s_ease-in-out_infinite]" : "h-1")} style={playing ? { height: "100%", animationDelay: `${k * 0.15}s` } : undefined} />
            ))}
          </span>
          <button type="button" aria-label="Like" aria-pressed={liked.has(i)} onClick={() => setLiked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
            <HeartIcon size={20} className={liked.has(i) ? "fill-accent text-accent" : "text-muted"} />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Slider min={0} max={t.len} value={[pos]} onValueChange={(v) => setPos(v[0]!)} aria-label="Seek" />
          <div className="flex justify-between font-mono text-[11px] text-subtle">
            <span>{fmt(pos)}</span>
            <span>-{fmt(t.len - pos)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Btn label="Previous" d="M6 6h2v12H6zM9.5 12L18 6v12z" onClick={() => go(-1)} />
          <motion.button whileTap={{ scale: 0.9 }} type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)} className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
            {playing ? <PauseIcon size={24} fill="currentColor" /> : <PlayIcon size={24} fill="currentColor" className="translate-x-0.5" />}
          </motion.button>
          <Btn label="Next" d="M16 6h2v12h-2zM14.5 12L6 18V6z" onClick={() => go(1)} />
        </div>
        <div className="border-t border-border pt-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-subtle">Up next</div>
          {tracks.map((x, k) =>
            k === i ? null : (
              <button key={x.title} type="button" onClick={() => { setI(k); setPos(0); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm hover:bg-surface-raised">
                <span className="size-9 rounded-lg" style={{ background: `linear-gradient(135deg, ${x.a}, ${x.b})` }} />
                <span className="flex-1">
                  <span className="block font-medium">{x.title}</span>
                  <span className="block text-xs text-subtle">{x.artist}</span>
                </span>
                <span className="font-mono text-xs text-subtle">{fmt(x.len)}</span>
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
