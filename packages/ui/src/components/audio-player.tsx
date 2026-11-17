"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { PauseIcon, PlayIcon } from "@kineticui/icons";

export type AudioPlayerProps = {
  src: string;
  title?: string;
  artist?: string;
  cover?: React.ReactNode;
  /** Waveform peaks 0–1. Generated from the title when omitted. */
  peaks?: number[];
  bars?: number;
  className?: string;
};

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function fakePeaks(seed: string, n: number) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return 0.25 + 0.75 * Math.abs(Math.sin(i / 3.1)) * ((h % 1000) / 1000) * 0.6 + 0.15 * ((h >> 10) % 100) / 100;
  });
}

/** Waveform audio player with scrubbing, keyboard seek and playback speed. */
export function AudioPlayer({ src, title, artist, cover, peaks, bars = 64, className }: AudioPlayerProps) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [rate, setRate] = React.useState(1);
  const wave = React.useMemo(() => peaks ?? fakePeaks(title ?? src, bars), [peaks, title, src, bars]);
  const progress = duration ? time / duration : 0;

  const seek = (fraction: number) => {
    const a = audio.current;
    if (!a || !duration) return;
    a.currentTime = Math.max(0, Math.min(duration, fraction * duration));
    setTime(a.currentTime);
  };

  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 pr-4", className)}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {cover ? <div className="size-14 shrink-0 overflow-hidden rounded-xl">{cover}</div> : null}
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => (playing ? audio.current?.pause() : void audio.current?.play())}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-90"
      >
        {playing ? <PauseIcon size={18} fill="currentColor" /> : <PlayIcon size={18} fill="currentColor" className="translate-x-px" />}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title || artist ? (
          <div className="flex items-baseline gap-2 truncate text-sm">
            {title ? <span className="font-medium">{title}</span> : null}
            {artist ? <span className="text-subtle">{artist}</span> : null}
          </div>
        ) : null}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - r.left) / r.width);
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            const r = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - r.left) / r.width);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek((time + 5) / duration);
            if (e.key === "ArrowLeft") seek((time - 5) / duration);
            if (e.key === " ") {
              e.preventDefault();
              if (playing) audio.current?.pause();
              else void audio.current?.play();
            }
          }}
          className="flex h-9 cursor-pointer items-center gap-[2px] rounded outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {wave.map((p, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-full transition-colors duration-150", i / wave.length < progress ? "bg-accent" : "bg-border-strong")}
              style={{ height: `${Math.max(12, p * 100)}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-subtle">
          <span>{fmt(time)}</span>
          <button
            type="button"
            onClick={() => {
              const next = rate >= 2 ? 0.75 : rate === 0.75 ? 1 : rate + 0.5;
              setRate(next);
              if (audio.current) audio.current.playbackRate = next;
            }}
            className="rounded px-1.5 hover:bg-surface-raised hover:text-foreground"
          >
            <span className="sr-only">Playback speed </span>
            {rate}×
          </button>
          <span>{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
