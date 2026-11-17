"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { VolumeIcon, VolumeXIcon } from "@kineticui/icons";

/*
 * Interface sounds synthesised with the Web Audio API: no audio files, a few hundred bytes of code each.
 * Off by default. People turn them on with <SoundToggle />, and the choice is remembered.
 */

export type SoundName = "tap" | "toggleOn" | "toggleOff" | "pop" | "success" | "error" | "notify" | "whoosh" | "type";

type Ctx = { enabled: boolean; setEnabled: (v: boolean) => void; volume: number; play: (name: SoundName) => void };
const SoundCtx = React.createContext<Ctx | null>(null);

let audio: AudioContext | null = null;
const ctx = () => {
  if (typeof window === "undefined") return null;
  audio ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (audio.state === "suspended") void audio.resume();
  return audio;
};

/** One enveloped oscillator note. */
function tone(a: AudioContext, out: AudioNode, { f, f2, type = "sine", t = 0, dur = 0.08, gain = 0.25 }: { f: number; f2?: number; type?: OscillatorType; t?: number; dur?: number; gain?: number }) {
  const o = a.createOscillator();
  const g = a.createGain();
  const start = a.currentTime + t;
  o.type = type;
  o.frequency.setValueAtTime(f, start);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(out);
  o.start(start);
  o.stop(start + dur + 0.02);
}

/** Short filtered noise burst, for whooshes and key clicks. */
function noise(a: AudioContext, out: AudioNode, { dur = 0.12, from = 400, to = 2400, gain = 0.15, q = 0.8 }: { dur?: number; from?: number; to?: number; gain?: number; q?: number }) {
  const len = Math.ceil(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, a.currentTime);
  bp.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur);
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(out);
  src.start();
}

const recipes: Record<SoundName, (a: AudioContext, o: AudioNode) => void> = {
  tap: (a, o) => tone(a, o, { f: 1800, f2: 1200, type: "triangle", dur: 0.035, gain: 0.18 }),
  toggleOn: (a, o) => (tone(a, o, { f: 660, type: "sine", dur: 0.06, gain: 0.2 }), tone(a, o, { f: 990, type: "sine", t: 0.05, dur: 0.08, gain: 0.18 })),
  toggleOff: (a, o) => (tone(a, o, { f: 880, type: "sine", dur: 0.06, gain: 0.18 }), tone(a, o, { f: 587, type: "sine", t: 0.05, dur: 0.08, gain: 0.16 })),
  pop: (a, o) => tone(a, o, { f: 380, f2: 1100, type: "sine", dur: 0.09, gain: 0.25 }),
  success: (a, o) => [523.25, 659.25, 783.99].forEach((f, i) => tone(a, o, { f, type: "triangle", t: i * 0.07, dur: 0.22, gain: 0.16 })),
  error: (a, o) => (tone(a, o, { f: 220, f2: 180, type: "square", dur: 0.12, gain: 0.08 }), tone(a, o, { f: 196, f2: 150, type: "square", t: 0.13, dur: 0.16, gain: 0.08 })),
  notify: (a, o) => (tone(a, o, { f: 1046.5, type: "sine", dur: 0.18, gain: 0.16 }), tone(a, o, { f: 1568, type: "sine", t: 0.09, dur: 0.3, gain: 0.12 })),
  whoosh: (a, o) => noise(a, o, { dur: 0.28, from: 300, to: 3200, gain: 0.22, q: 0.6 }),
  type: (a, o) => noise(a, o, { dur: 0.025, from: 2600, to: 1800, gain: 0.25, q: 2 }),
};

/** Play a sound directly, outside React. Respects nothing: prefer useSound(), which honours the user's setting. */
export function playSound(name: SoundName, volume = 0.6) {
  const a = ctx();
  if (!a) return;
  const master = a.createGain();
  master.gain.value = volume;
  master.connect(a.destination);
  recipes[name](a, master);
}

export type SoundProviderProps = {
  children: React.ReactNode;
  /** Initial state when the visitor hasn't chosen yet. Defaults to off. */
  defaultEnabled?: boolean;
  /** 0 to 1. */
  volume?: number;
  /** localStorage key that remembers the choice; null to disable. */
  storageKey?: string | null;
};

export function SoundProvider({ children, defaultEnabled = false, volume = 0.6, storageKey = "kinetic-sounds" }: SoundProviderProps) {
  const [enabled, setEnabledState] = React.useState(defaultEnabled);
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const v = localStorage.getItem(storageKey);
      if (v != null) setEnabledState(v === "on");
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);
  const setEnabled = React.useCallback(
    (v: boolean) => {
      setEnabledState(v);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, v ? "on" : "off");
        } catch {
          /* ignore */
        }
      }
    },
    [storageKey],
  );
  const play = React.useCallback((name: SoundName) => enabled && playSound(name, volume), [enabled, volume]);
  return <SoundCtx.Provider value={{ enabled, setEnabled, volume, play }}>{children}</SoundCtx.Provider>;
}

/** play(name) does nothing unless sounds are on. Works without a provider too (sounds stay off). */
export function useSound() {
  return React.useContext(SoundCtx) ?? { enabled: false, setEnabled: () => {}, volume: 0, play: () => {} };
}

/** Speaker button that turns interface sounds on and off. */
export function SoundToggle({ className }: { className?: string }) {
  const { enabled, setEnabled } = useSound();
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label={enabled ? "Turn interface sounds off" : "Turn interface sounds on"}
      onClick={() => {
        setEnabled(!enabled);
        if (!enabled) playSound("toggleOn");
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent aria-pressed:border-accent aria-pressed:text-accent",
        className,
      )}
    >
      {enabled ? <VolumeIcon size={16} /> : <VolumeXIcon size={16} />}
    </button>
  );
}
