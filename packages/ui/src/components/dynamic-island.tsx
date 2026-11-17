"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { CheckIcon, MicIcon, MusicIcon, PauseIcon, PhoneIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, SparkleIcon, TimerIcon, UploadIcon, XIcon } from "@kineticui/icons";

export type IslandActivity = {
  /** Changing the id morphs to the new activity. */
  id: string;
  /** Small left and right content of the compact pill. */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Shown when the island is tapped open. Omit for activities that can't expand. */
  expanded?: React.ReactNode;
  /** Read to screen readers when the activity appears. */
  label: string;
};

export type DynamicIslandProps = {
  /** The live activity, or null for the idle pill. */
  activity: IslandActivity | null;
  /** Controlled open state. */
  expanded?: boolean;
  onExpandedChange?: (open: boolean) => void;
  /** Keep the pill fixed at the top centre of the viewport. */
  fixed?: boolean;
  className?: string;
};

const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

/**
 * A black pill that morphs between live activities, like a phone's dynamic island: music, timers, uploads,
 * calls, "AI is thinking". Tap to expand. Swap the activity and it reshapes with a spring.
 */
export function DynamicIsland({ activity, expanded: controlled, onExpandedChange, fixed = false, className }: DynamicIslandProps) {
  const [inner, setInner] = React.useState(false);
  const open = (controlled ?? inner) && !!activity?.expanded;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setInner(v);
    onExpandedChange?.(v);
  };
  React.useEffect(() => {
    if (!activity?.expanded && open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity?.id]);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => (document.removeEventListener("pointerdown", away), document.removeEventListener("keydown", esc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const state = !activity ? "idle" : open ? "open" : "compact";
  const size = state === "idle" ? { width: 126, height: 36, radius: 18 } : state === "compact" ? { width: 236, height: 36, radius: 18 } : { width: 360, height: "auto" as const, radius: 34 };

  return (
    <div className={cn(fixed ? "fixed inset-x-0 top-3 z-50 flex justify-center" : "flex justify-center", className)}>
      <motion.div
        ref={ref}
        layout
        initial={false}
        animate={{ width: size.width, borderRadius: size.radius }}
        style={{ height: size.height }}
        transition={spring}
        role={activity?.expanded ? "button" : undefined}
        tabIndex={activity?.expanded ? 0 : undefined}
        aria-expanded={activity?.expanded ? open : undefined}
        aria-label={activity ? activity.label : undefined}
        onClick={() => activity?.expanded && !open && setOpen(true)}
        onKeyDown={(e) => {
          if (activity?.expanded && (e.key === "Enter" || e.key === " ") && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "relative overflow-hidden bg-black text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-accent",
          activity?.expanded && !open && "cursor-pointer",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "compact" && activity ? (
            <motion.div
              key={`c-${activity.id}`}
              initial={{ opacity: 0, filter: "blur(6px)", scale: 0.9 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)", scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className="flex h-9 items-center justify-between gap-3 px-2.5"
            >
              <span className="flex min-w-0 items-center gap-2 text-xs">{activity.leading}</span>
              <span className="flex shrink-0 items-center gap-2 text-xs">{activity.trailing}</span>
            </motion.div>
          ) : null}
          {state === "open" && activity ? (
            <motion.div
              key={`o-${activity.id}`}
              initial={{ opacity: 0, filter: "blur(8px)", y: -6 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="p-4"
            >
              {activity.expanded}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <span aria-live="polite" className="sr-only">{activity?.label ?? ""}</span>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Ready-made activities. Each returns an IslandActivity; pass it straight to <DynamicIsland activity={…} />.
 * ----------------------------------------------------------------------------------------------*/

function Bars({ playing, color = "var(--kn-accent)" }: { playing: boolean; color?: string }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
      {[0.6, 1, 0.75, 0.9].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color }}
          animate={playing ? { height: ["30%", `${h * 100}%`, "45%", `${h * 80}%`, "30%"] } : { height: "30%" }}
          transition={playing ? { duration: 0.9 + i * 0.13, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        />
      ))}
    </span>
  );
}

const Art = ({ src, size = 22, gradient = "linear-gradient(135deg,#C6F432,#7dd3fc)" }: { src?: string; size?: number; gradient?: string }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="shrink-0 rounded-md object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="shrink-0 rounded-md" style={{ width: size, height: size, background: gradient }} />
  );

export function islandMusic(o: { title: string; artist: string; art?: string; playing: boolean; progress: number; onToggle?: () => void; onNext?: () => void; onPrev?: () => void }): IslandActivity {
  return {
    id: "music",
    label: `${o.playing ? "Playing" : "Paused"}: ${o.title} by ${o.artist}`,
    leading: <Art src={o.art} />,
    trailing: <Bars playing={o.playing} />,
    expanded: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Art src={o.art} size={52} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{o.title}</span>
            <span className="truncate text-xs text-white/55">{o.artist}</span>
          </div>
          <Bars playing={o.playing} />
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/15">
          <motion.div className="h-full rounded-full bg-white" animate={{ width: `${o.progress * 100}%` }} transition={{ ease: "linear", duration: 0.3 }} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <IslandButton label="Previous" onClick={o.onPrev}><SkipBackIcon size={18} /></IslandButton>
          <IslandButton label={o.playing ? "Pause" : "Play"} onClick={o.onToggle} big>{o.playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}</IslandButton>
          <IslandButton label="Next" onClick={o.onNext}><SkipForwardIcon size={18} /></IslandButton>
        </div>
      </div>
    ),
  };
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function islandTimer(o: { remaining: number; total: number; label?: string; onCancel?: () => void }): IslandActivity {
  const p = 1 - o.remaining / o.total;
  return {
    id: "timer",
    label: `${o.label ?? "Timer"}: ${fmt(o.remaining)} left`,
    leading: <span className="flex items-center gap-1.5 text-[#fdba74]"><TimerIcon size={15} /> <span className="text-white/70">{o.label ?? "Timer"}</span></span>,
    trailing: <span className="font-mono tabular-nums text-[#fdba74]">{fmt(o.remaining)}</span>,
    expanded: (
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 44 44" className="size-14 -rotate-90" aria-hidden>
          <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(253,186,116,0.2)" strokeWidth="4" />
          <motion.circle cx="22" cy="22" r="19" fill="none" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" strokeDasharray={119.4} animate={{ strokeDashoffset: 119.4 * p }} transition={{ ease: "linear", duration: 0.4 }} />
        </svg>
        <div className="flex flex-1 flex-col">
          <span className="text-xs text-white/55">{o.label ?? "Timer"}</span>
          <span className="font-display text-3xl font-semibold tabular-nums text-[#fdba74]">{fmt(o.remaining)}</span>
        </div>
        <IslandButton label="Cancel timer" onClick={o.onCancel} tone="danger"><XIcon size={18} /></IslandButton>
      </div>
    ),
  };
}

export function islandUpload(o: { name: string; progress: number; done?: boolean }): IslandActivity {
  const pct = Math.round(o.progress * 100);
  return {
    id: o.done ? "upload-done" : "upload",
    label: o.done ? `${o.name} uploaded` : `Uploading ${o.name}, ${pct}%`,
    leading: o.done ? (
      <span className="flex items-center gap-1.5 text-[#86efac]"><CheckIcon size={15} strokeWidth={3} /> <span className="text-white/80">Uploaded</span></span>
    ) : (
      <span className="flex items-center gap-1.5 text-[#7dd3fc]"><UploadIcon size={15} /> <span className="max-w-[90px] truncate text-white/70">{o.name}</span></span>
    ),
    trailing: o.done ? null : (
      <svg viewBox="0 0 20 20" className="size-5 -rotate-90" aria-hidden>
        <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(125,211,252,0.25)" strokeWidth="2.5" />
        <circle cx="10" cy="10" r="8" fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={50.3} strokeDashoffset={50.3 * (1 - o.progress)} />
      </svg>
    ),
  };
}

export function islandCall(o: { name: string; avatar?: string; onAccept?: () => void; onDecline?: () => void }): IslandActivity {
  return {
    id: "call",
    label: `Incoming call from ${o.name}`,
    leading: <span className="flex items-center gap-1.5"><Art src={o.avatar} gradient="linear-gradient(135deg,#f9a8d4,#c4b5fd)" /> <span className="max-w-[90px] truncate text-white/80">{o.name}</span></span>,
    trailing: <motion.span animate={{ rotate: [0, -14, 14, -10, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.6 }} className="flex text-[#86efac]"><PhoneIcon size={15} /></motion.span>,
    expanded: (
      <div className="flex items-center gap-3">
        <Art src={o.avatar} size={48} gradient="linear-gradient(135deg,#f9a8d4,#c4b5fd)" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs text-white/55">Incoming call</span>
          <span className="truncate text-base font-semibold">{o.name}</span>
        </div>
        <IslandButton label="Decline" onClick={o.onDecline} tone="danger" big><PhoneIcon size={20} className="rotate-[135deg]" /></IslandButton>
        <IslandButton label="Accept" onClick={o.onAccept} tone="success" big><PhoneIcon size={20} /></IslandButton>
      </div>
    ),
  };
}

export function islandThinking(o: { text?: string; listening?: boolean } = {}): IslandActivity {
  return {
    id: o.listening ? "listening" : "thinking",
    label: o.listening ? "Listening" : o.text ?? "Thinking",
    leading: (
      <span className="flex items-center gap-1.5">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="flex text-accent">
          {o.listening ? <MicIcon size={15} /> : <SparkleIcon size={15} />}
        </motion.span>
        <span className="text-white/75">{o.listening ? "Listening" : o.text ?? "Thinking"}</span>
      </span>
    ),
    trailing: (
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="size-1.5 rounded-full bg-accent" animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </span>
    ),
  };
}

function IslandButton({ label, onClick, children, big, tone }: { label: string; onClick?: () => void; children: React.ReactNode; big?: boolean; tone?: "danger" | "success" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-90",
        big ? "size-11" : "size-9",
        tone === "danger" ? "bg-[#ef4444] text-white" : tone === "success" ? "bg-[#22c55e] text-white" : big ? "bg-white text-black" : "text-white/80 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
