"use client";

import * as React from "react";
import { cn, useMounted } from "@kineticui/core";
import { DownloadIcon, MicIcon, PauseIcon, PlayIcon, TrashIcon } from "@kineticui/icons";

export type AudioRecorderProps = {
  /** Called when a recording is finished. */
  onRecorded?: (blob: Blob, url: string) => void;
  /** Stop automatically after this many seconds. */
  maxSeconds?: number;
  className?: string;
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Record a voice note: scrolling live waveform, pause/resume, playback, download, discard. */
export function AudioRecorder({ onRecorded, maxSeconds = 300, className }: AudioRecorderProps) {
  const mounted = useMounted();
  const [state, setState] = React.useState<"idle" | "recording" | "paused" | "done" | "error">("idle");
  const [levels, setLevels] = React.useState<number[]>([]);
  const [seconds, setSeconds] = React.useState(0);
  const [url, setUrl] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const rec = React.useRef<MediaRecorder | null>(null);
  const stopAll = React.useRef<() => void>(() => {});
  const player = React.useRef<HTMLAudioElement>(null);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const supported = mounted && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const chunks: Blob[] = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType });
        const u = URL.createObjectURL(blob);
        setUrl(u);
        onRecorded?.(blob, u);
      };
      mr.start();
      rec.current = mr;
      let raf = 0;
      let last = 0;
      let elapsed = 0;
      let prev = performance.now();
      const loop = (now: number) => {
        if (stateRef.current === "recording") {
          elapsed += (now - prev) / 1000;
          setSeconds(elapsed);
          if (elapsed >= maxSeconds) stop();
          if (now - last > 70) {
            last = now;
            analyser.getByteTimeDomainData(buf);
            let peak = 0;
            for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
            setLevels((l) => [...l.slice(-79), Math.min(1, peak * 1.8)]);
          }
        }
        prev = now;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      stopAll.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
      setLevels([]);
      setSeconds(0);
      setState("recording");
    } catch {
      setState("error");
    }
  };

  const stop = () => {
    rec.current?.stop();
    stopAll.current();
    setState("done");
  };

  const discard = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setLevels([]);
    setSeconds(0);
    setState("idle");
  };

  React.useEffect(() => () => stopAll.current(), []);

  const active = state === "recording" || state === "paused";

  return (
    <div className={cn("flex w-full max-w-md items-center gap-3 rounded-full border border-border bg-surface p-2", className)}>
      {state === "done" && url ? (
        <>
          <audio ref={player} src={url} onEnded={() => setPlaying(false)} />
          <button type="button" aria-label={playing ? "Pause" : "Play recording"} onClick={() => { if (playing) player.current?.pause(); else void player.current?.play(); setPlaying(!playing); }} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            {playing ? <PauseIcon size={16} fill="currentColor" /> : <PlayIcon size={16} fill="currentColor" />}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={mounted && !supported}
          aria-label={active ? "Stop recording" : "Start recording"}
          onClick={() => (active ? stop() : void start())}
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40", active ? "bg-danger text-background" : "bg-accent text-accent-foreground")}
        >
          {active ? <span className="size-3.5 rounded-[3px] bg-current" /> : <MicIcon size={18} />}
        </button>
      )}
      <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden" aria-hidden>
        {levels.length ? (
          levels.map((l, i) => <span key={i} className={cn("w-[3px] shrink-0 rounded-full", state === "done" ? "bg-muted" : "bg-accent")} style={{ height: `${Math.max(10, l * 100)}%` }} />)
        ) : (
          <span className="w-full text-sm text-subtle">
            {state === "error" ? "Microphone access was blocked." : mounted && !supported ? "Recording isn't supported here." : "Tap to record a voice note"}
          </span>
        )}
      </div>
      <span className={cn("w-12 shrink-0 text-right font-mono text-xs", state === "recording" ? "text-danger" : "text-muted")}>{active || state === "done" ? fmt(seconds) : ""}</span>
      {state === "recording" || state === "paused" ? (
        <button
          type="button"
          aria-label={state === "paused" ? "Resume" : "Pause"}
          onClick={() => {
            if (state === "paused") {
              rec.current?.resume();
              setState("recording");
            } else {
              rec.current?.pause();
              setState("paused");
            }
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-foreground"
        >
          {state === "paused" ? <PlayIcon size={15} /> : <PauseIcon size={15} />}
        </button>
      ) : null}
      {state === "done" && url ? (
        <>
          <a href={url} download="recording.webm" aria-label="Download" className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-foreground">
            <DownloadIcon size={15} />
          </a>
          <button type="button" aria-label="Discard" onClick={discard} className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-danger">
            <TrashIcon size={15} />
          </button>
        </>
      ) : null}
    </div>
  );
}
