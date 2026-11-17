"use client";

import * as React from "react";
import { KineticType, LiquidGlass } from "@kineticui/motion";
import {
  Button,
  DynamicIsland,
  Input,
  MorphSurface,
  MorphSurfaceHeader,
  SoundProvider,
  SoundToggle,
  Switch,
  Textarea,
  ThemeRippleButton,
  ThemeSwitch,
  islandCall,
  islandMusic,
  islandThinking,
  islandTimer,
  islandUpload,
  useSound,
  type IslandActivity,
  type SoundName,
} from "@kineticui/ui";
import { BellIcon, HeartIcon, HomeIcon, MessageCircleIcon, SearchIcon, SendIcon, UserIcon } from "@kineticui/icons";

/* ---------------------------------------------------------------- dynamic island */

const kinds = ["music", "timer", "upload", "call", "thinking"] as const;
type Kind = (typeof kinds)[number] | "idle";

function DynamicIslandDemo() {
  const [kind, setKind] = React.useState<Kind>("music");
  const [playing, setPlaying] = React.useState(true);
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 500);
    return () => clearInterval(id);
  }, []);
  const upload = Math.min(1, ((t % 16) / 12));
  const activity: IslandActivity | null =
    kind === "music"
      ? islandMusic({ title: "Midnight Drive", artist: "Neon Coast", playing, progress: ((t * 0.5) % 180) / 180, onToggle: () => setPlaying((p) => !p) })
      : kind === "timer"
        ? islandTimer({ remaining: Math.max(0, 300 - Math.floor(t / 2)), total: 300, label: "Focus", onCancel: () => setKind("idle") })
        : kind === "upload"
          ? islandUpload({ name: "launch-film.mp4", progress: upload, done: upload >= 1 })
          : kind === "call"
            ? islandCall({ name: "Maya Kapoor", onAccept: () => setKind("timer"), onDecline: () => setKind("idle") })
            : kind === "thinking"
              ? islandThinking({ text: "Thinking" })
              : null;
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <div className="relative flex h-[300px] w-[300px] justify-center overflow-hidden rounded-[48px] border-[10px] border-[#1c1c1f] bg-gradient-to-b from-[#1b2a12] via-background to-background pt-3 shadow-overlay">
        <DynamicIsland activity={activity} />
        <span className="absolute bottom-5 text-xs text-subtle">Tap the island to expand it</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Activity">
        {(["idle", ...kinds] as Kind[]).map((k) => (
          <Button key={k} size="sm" variant={kind === k ? "primary" : "outline"} onClick={() => setKind(k)} className="capitalize">
            {k}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- morph surface */

function MorphDemo() {
  const [sending, setSending] = React.useState(false);
  return (
    <div className="flex h-[380px] w-full max-w-lg items-end justify-between gap-6 rounded-2xl border border-border bg-background p-6">
      <MorphSurface label={<><SearchIcon /> Search</>} origin="bottom-left" width={300} title="Search">
        {({ close }) => (
          <div className="flex flex-col">
            <MorphSurfaceHeader onClose={close}>Quick search</MorphSurfaceHeader>
            <div className="flex flex-col gap-1 p-3">
              <Input placeholder="Search docs…" leading={<SearchIcon />} />
              {["Dynamic Island", "Liquid Glass", "Kinetic Type"].map((r) => (
                <button key={r} type="button" onClick={close} className="rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface-overlay hover:text-foreground">{r}</button>
              ))}
            </div>
          </div>
        )}
      </MorphSurface>
      <MorphSurface label={<><MessageCircleIcon /> Feedback</>} width={320} title="Send feedback">
        {({ close, done }) => (
          <form
            className="flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                done("Thanks!");
              }, 700);
            }}
          >
            <MorphSurfaceHeader onClose={close}>Send feedback</MorphSurfaceHeader>
            <div className="flex flex-col gap-3 p-4">
              <Textarea rows={3} placeholder="What should we build next?" required />
              <Button type="submit" disabled={sending} className="w-full">{sending ? "Sending…" : <>Send <SendIcon /></>}</Button>
            </div>
          </form>
        )}
      </MorphSurface>
    </div>
  );
}

/* ---------------------------------------------------------------- theme ripple */

function ThemeRippleDemo() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="max-w-sm text-sm text-muted">Click either control. The new theme spreads out from your pointer, across the whole page.</p>
      <div className="flex items-center gap-6">
        <ThemeRippleButton />
        <ThemeSwitch />
        <ThemeSwitch variant="segmented" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- sounds */

const pads: { name: SoundName; label: string }[] = [
  { name: "tap", label: "Tap" },
  { name: "pop", label: "Pop" },
  { name: "toggleOn", label: "Toggle on" },
  { name: "toggleOff", label: "Toggle off" },
  { name: "success", label: "Success" },
  { name: "error", label: "Error" },
  { name: "notify", label: "Notify" },
  { name: "whoosh", label: "Whoosh" },
  { name: "type", label: "Key" },
];

function SoundPads() {
  const { play, enabled } = useSound();
  const [on, setOn] = React.useState(true);
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Interface sounds</span>
          <span className="text-xs text-subtle">{enabled ? "On. Try the pads below." : "Off. Turn them on to hear the pads."}</span>
        </div>
        <SoundToggle />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {pads.map((p) => (
          <button key={p.name} type="button" onClick={() => play(p.name)} className="rounded-xl border border-border bg-surface py-4 text-sm font-medium transition-[transform,border-color] hover:border-accent active:scale-95">
            {p.label}
          </button>
        ))}
      </div>
      <label className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-sm">
        A switch with sound
        <Switch checked={on} onCheckedChange={(v) => (setOn(v), play(v ? "toggleOn" : "toggleOff"))} />
      </label>
    </div>
  );
}

/* ---------------------------------------------------------------- liquid glass */

function GlassDemo() {
  const [pos, setPos] = React.useState({ x: 70, y: 60 });
  const drag = React.useRef<{ x: number; y: number } | null>(null);
  const [tab, setTab] = React.useState(0);
  const tabs = [HomeIcon, SearchIcon, HeartIcon, BellIcon, UserIcon];
  return (
    <div
      className="relative h-[460px] w-full max-w-2xl touch-none overflow-hidden rounded-3xl"
      onPointerMove={(e) => {
        if (!drag.current) return;
        setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
      }}
      onPointerUp={() => (drag.current = null)}
    >
      {/* busy, colourful content so the refraction is visible */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#C6F432,transparent_35%),radial-gradient(circle_at_80%_30%,#7dd3fc,transparent_35%),radial-gradient(circle_at_50%_90%,#f9a8d4,transparent_40%),#0a0a0b]" />
      <div className="absolute inset-0 grid grid-cols-6 gap-3 p-6 opacity-80">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10" style={{ background: `hsl(${(i * 37) % 360} 60% ${i % 3 ? 18 : 45}%)` }} />
        ))}
      </div>
      <p className="absolute left-6 top-6 max-w-[16rem] font-display text-3xl font-semibold leading-tight text-white">Drag the lens across the page.</p>

      <LiquidGlass
        radius={999}
        refraction={60}
        className="absolute z-10 flex size-36 cursor-grab items-center justify-center active:cursor-grabbing"
        style={{ left: pos.x, top: pos.y + 90 }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
        aria-label="Glass lens, drag to move"
      >
        <span className="text-xs font-medium text-white/80">Lens</span>
      </LiquidGlass>

      <LiquidGlass radius={30} className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 p-2" role="tablist" aria-label="Glass tab bar">
        {tabs.map((I, i) => (
          <button key={i} type="button" role="tab" aria-selected={tab === i} aria-label={["Home", "Search", "Likes", "Alerts", "Profile"][i]} onClick={() => setTab(i)} className={`flex size-12 items-center justify-center rounded-[22px] transition-colors ${tab === i ? "bg-white/25 text-white" : "text-white/75 hover:text-white"}`}>
            <I size={20} />
          </button>
        ))}
      </LiquidGlass>

      <LiquidGlass radius={22} className="absolute right-6 top-6 flex w-56 flex-col gap-1 p-4 text-white">
        <span className="text-xs text-white/70">Now playing</span>
        <span className="font-semibold">Midnight Drive</span>
        <span className="text-xs text-white/70">Neon Coast</span>
      </LiquidGlass>
    </div>
  );
}

/* ---------------------------------------------------------------- kinetic type */

function KineticTypeDemo() {
  return (
    <div className="flex flex-col items-center gap-10 py-6 text-center">
      <KineticType text="Move your cursor" effect="lens" colorize className="font-display text-6xl font-light tracking-tight sm:text-7xl" as="h2" />
      <KineticType text="Weight follows you around" effect="weight" className="font-display text-4xl tracking-tight" />
      <KineticType text="Ripples like water" effect="wave" radius={120} className="font-display text-3xl tracking-tight text-muted" />
    </div>
  );
}

export const signature2Demos: Record<string, () => React.ReactNode> = {
  "dynamic-island": () => <DynamicIslandDemo />,
  "morph-surface": () => <MorphDemo />,
  "theme-ripple": () => <ThemeRippleDemo />,
  "ui-sounds": () => (
    <SoundProvider storageKey={null} defaultEnabled>
      <SoundPads />
    </SoundProvider>
  ),
  "liquid-glass": () => <GlassDemo />,
  "kinetic-type": () => <KineticTypeDemo />,
};
