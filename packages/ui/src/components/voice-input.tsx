"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { MicIcon } from "@kineticui/icons";

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

export type VoiceInputProps = {
  /** Called with the final transcript when listening stops. */
  onTranscript?: (text: string) => void;
  /** Live (interim) transcript while speaking. */
  onInterim?: (text: string) => void;
  lang?: string;
  /** Bars in the level meter. */
  bars?: number;
  className?: string;
};

/** Mic button with a live audio-level waveform and speech-to-text (Web Speech API where available). */
export function VoiceInput({ onTranscript, onInterim, lang = "en-US", bars = 24, className }: VoiceInputProps) {
  const mounted = useMounted();
  const [state, setState] = React.useState<"idle" | "listening" | "error">("idle");
  const [levels, setLevels] = React.useState<number[]>(() => new Array(bars).fill(0.08));
  const [text, setText] = React.useState("");
  const [seconds, setSeconds] = React.useState(0);
  const cleanup = React.useRef<() => void>(() => {});
  const finalText = React.useRef("");

  const supported = mounted && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const SR = mounted ? ((window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition) : undefined;

  const stop = React.useCallback(() => {
    cleanup.current();
    cleanup.current = () => {};
    setState("idle");
    setLevels(new Array(bars).fill(0.08));
    if (finalText.current) onTranscript?.(finalText.current.trim());
  }, [bars, onTranscript]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const loop = () => {
        analyser.getByteFrequencyData(data);
        setLevels(Array.from({ length: bars }, (_, i) => Math.max(0.08, (data[Math.floor((i / bars) * data.length)] ?? 0) / 255)));
        raf = requestAnimationFrame(loop);
      };
      loop();
      const t0 = Date.now();
      const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - t0) / 1000)), 250);

      let rec: SpeechRec | null = null;
      finalText.current = "";
      setText("");
      if (SR) {
        rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = lang;
        rec.onresult = (e) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i]!;
            if (r.isFinal) finalText.current += r[0]!.transcript + " ";
            else interim += r[0]!.transcript;
          }
          const live = (finalText.current + interim).trim();
          setText(live);
          onInterim?.(live);
        };
        rec.start();
      }
      cleanup.current = () => {
        cancelAnimationFrame(raf);
        window.clearInterval(timer);
        rec?.stop();
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close();
      };
      setSeconds(0);
      setState("listening");
    } catch {
      setState("error");
    }
  };

  React.useEffect(() => () => cleanup.current(), []);

  const listening = state === "listening";
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex h-12 items-center gap-[3px]" aria-hidden>
        {levels.map((l, i) => (
          <motion.span key={i} animate={{ height: `${Math.round(l * 100)}%` }} transition={{ duration: 0.08 }} className={cn("w-1 rounded-full", listening ? "bg-accent" : "bg-border-strong")} style={{ minHeight: 4 }} />
        ))}
      </div>
      <button
        type="button"
        disabled={mounted && !supported}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Start voice input"}
        onClick={() => (listening ? stop() : void start())}
        className={cn(
          "relative flex size-16 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40",
          listening ? "bg-danger text-background" : "bg-accent text-accent-foreground",
        )}
      >
        {listening ? <span className="absolute inset-0 rounded-full bg-danger/40 animate-ping" /> : null}
        {listening ? <span className="relative size-5 rounded-md bg-current" /> : <MicIcon size={26} />}
      </button>
      <div className="min-h-10 max-w-sm text-center text-sm">
        {state === "error" ? (
          <span className="text-danger">Microphone access was blocked.</span>
        ) : listening ? (
          <span className="flex flex-col gap-1">
            <span className="font-mono text-xs text-danger">● {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
            <span className="text-foreground">{text || (SR ? "Listening…" : "Recording (speech-to-text not supported in this browser)")}</span>
          </span>
        ) : mounted && !supported ? (
          <span className="text-subtle">Voice input isn&apos;t available here.</span>
        ) : (
          <span className="text-subtle">Tap to speak</span>
        )}
      </div>
    </div>
  );
}
