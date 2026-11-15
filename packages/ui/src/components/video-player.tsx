"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { PauseIcon, PlayIcon } from "@kineticui/icons";

export type VideoChapter = { time: number; title: string };

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  chapters?: VideoChapter[];
  className?: string;
};

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Custom-skinned video player: big play button, scrubber with buffer and chapters, volume, speed, fullscreen. */
export function VideoPlayer({ src, poster, title, chapters = [], className }: VideoPlayerProps) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const video = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [rate, setRate] = React.useState(1);
  const [hoverX, setHoverX] = React.useState<number | null>(null);
  const [idle, setIdle] = React.useState(false);
  const idleTimer = React.useRef<number>(0);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  const poke = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };
  const seekTo = (t: number) => {
    if (video.current && duration) video.current.currentTime = Math.max(0, Math.min(duration, t));
  };

  const chapterAt = (t: number) => [...chapters].reverse().find((c) => c.time <= t);
  const showControls = !playing || !idle;

  return (
    <div
      ref={wrap}
      tabIndex={0}
      onPointerMove={poke}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          toggle();
        }
        if (e.key === "ArrowRight") seekTo(time + 5);
        if (e.key === "ArrowLeft") seekTo(time - 5);
        if (e.key === "m") setMuted((m) => !m);
        if (e.key === "f") void (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen());
        poke();
      }}
      className={cn("group relative aspect-video overflow-hidden rounded-2xl bg-black outline-none focus-visible:ring-2 focus-visible:ring-accent", playing && idle && "cursor-none", className)}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        preload="metadata"
        onClick={toggle}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          e.currentTarget.volume = volume;
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onProgress={(e) => {
          const b = e.currentTarget.buffered;
          if (b.length) setBuffered(b.end(b.length - 1));
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          poke();
        }}
        onPause={() => setPlaying(false)}
        className="size-full object-cover"
      />
      <AnimatePresence>
        {!started ? (
          <motion.button
            type="button"
            aria-label="Play video"
            onClick={toggle}
            exit={{ opacity: 0, scale: 1.4 }}
            className="absolute inset-0 flex items-center justify-center bg-black/25"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_10px_rgba(198,244,50,0.18)] transition-transform hover:scale-105">
              <PlayIcon size={30} fill="currentColor" className="translate-x-0.5" />
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
      {title ? (
        <div className={cn("pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4 text-sm font-medium text-white transition-opacity duration-300", started && !showControls && "opacity-0")}>{title}</div>
      ) : null}
      <div className={cn("absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10 text-white transition-opacity duration-300", (!started || !showControls) && "pointer-events-none opacity-0")}>
        <div
          role="slider"
          tabIndex={-1}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          className="group/bar relative flex h-4 cursor-pointer items-center"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHoverX((e.clientX - r.left) / r.width);
            if (e.buttons === 1) seekTo(((e.clientX - r.left) / r.width) * duration);
          }}
          onPointerLeave={() => setHoverX(null)}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seekTo(((e.clientX - r.left) / r.width) * duration);
          }}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/bar:h-1.5">
            <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
            <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${duration ? (time / duration) * 100 : 0}%` }} />
            {chapters.slice(1).map((c) => (
              <span key={c.time} className="absolute inset-y-0 w-[3px] bg-black/70" style={{ left: `${(c.time / (duration || 1)) * 100}%` }} />
            ))}
          </div>
          <span className="absolute size-3 -translate-x-1/2 rounded-full bg-accent opacity-0 transition-opacity group-hover/bar:opacity-100" style={{ left: `${duration ? (time / duration) * 100 : 0}%` }} />
          {hoverX !== null && duration ? (
            <span className="pointer-events-none absolute bottom-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 font-mono text-[11px]" style={{ left: `${hoverX * 100}%` }}>
              {chapterAt(hoverX * duration) ? <span className="mr-1.5 font-sans font-medium">{chapterAt(hoverX * duration)!.title}</span> : null}
              {fmt(hoverX * duration)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={toggle} className="flex size-8 items-center justify-center rounded-md hover:bg-white/10">
            {playing ? <PauseIcon size={18} fill="currentColor" /> : <PlayIcon size={18} fill="currentColor" />}
          </button>
          <button type="button" aria-label="Back 10 seconds" onClick={() => seekTo(time - 10)} className="flex size-8 items-center justify-center rounded-md hover:bg-white/10">
            <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
          </button>
          <button type="button" aria-label="Forward 10 seconds" onClick={() => seekTo(time + 10)} className="flex size-8 items-center justify-center rounded-md hover:bg-white/10">
            <Icon d="M13 17l5-5-5-5M6 17l5-5-5-5" />
          </button>
          <div className="group/vol flex items-center">
            <button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted(!muted)} className="flex size-8 items-center justify-center rounded-md hover:bg-white/10">
              <Icon d={muted || volume === 0 ? "M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" : "M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
                if (video.current) video.current.volume = v;
              }}
              className="w-0 accent-[var(--kn-accent)] opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100"
            />
          </div>
          <span className="ml-1 font-mono text-xs text-white/80">
            {fmt(time)} / {fmt(duration)}
          </span>
          {chapterAt(time) ? <span className="ml-2 hidden truncate text-xs text-white/60 sm:inline">· {chapterAt(time)!.title}</span> : null}
          <button
            type="button"
            aria-label="Playback speed"
            onClick={() => {
              const next = rate >= 2 ? 0.5 : rate + 0.25;
              setRate(next);
              if (video.current) video.current.playbackRate = next;
            }}
            className="ml-auto h-7 rounded-md px-2 font-mono text-xs hover:bg-white/10"
          >
            {rate}×
          </button>
          <button
            type="button"
            aria-label="Picture in picture"
            onClick={() => void (document.pictureInPictureElement ? document.exitPictureInPicture() : video.current?.requestPictureInPicture?.())}
            className="flex size-8 items-center justify-center rounded-md hover:bg-white/10"
          >
            <Icon d="M3 5h18v14H3zM13 12h6v5h-6z" />
          </button>
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : wrap.current?.requestFullscreen())}
            className="flex size-8 items-center justify-center rounded-md hover:bg-white/10"
          >
            <Icon d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
