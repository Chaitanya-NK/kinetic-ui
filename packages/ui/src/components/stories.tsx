"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn, useReducedMotion } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, XIcon } from "@kineticui/icons";

export type StoryItem = {
  id: string;
  /** Image URL. Ignored when `content` is given. */
  src?: string;
  /** Any node, e.g. a gradient card or a video. */
  content?: React.ReactNode;
  /** Seconds this item stays up. Default 5. */
  duration?: number;
  caption?: React.ReactNode;
  /** Shown in the header, e.g. "2h". */
  time?: string;
};

export type Story = {
  id: string;
  name: string;
  avatar?: string;
  items: StoryItem[];
};

/* ------------------------------------------------------------------ player */

export type StoryPlayerProps = {
  stories: Story[];
  /** Index of the story to start on. */
  initialStory?: number;
  /** Called with the story id when every item in it has been watched. */
  onSeen?: (storyId: string) => void;
  /** Called after the last item of the last story, or when the close button is pressed. */
  onClose?: () => void;
  className?: string;
};

function Avatar({ story, size = 32 }: { story: Story; size?: number }) {
  return story.avatar ? (
    <img src={story.avatar} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-accent font-display text-xs font-semibold text-accent-foreground"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {story.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}

/**
 * A full-bleed story player: segmented progress, tap the sides to move, hold to pause,
 * and a cube turn between people. Arrow keys and Space work too.
 */
export function StoryPlayer({ stories, initialStory = 0, onSeen, onClose, className }: StoryPlayerProps) {
  const reduced = useReducedMotion();
  const [s, setS] = React.useState(Math.min(initialStory, stories.length - 1));
  const [i, setI] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const [paused, setPaused] = React.useState(false);
  const [held, setHeld] = React.useState(false);
  const progress = React.useRef(0);
  const bar = React.useRef<HTMLDivElement>(null);
  const story = stories[s];
  const item = story?.items[i];
  const duration = (item?.duration ?? 5) * 1000;
  const stopped = paused || held;

  const goStory = React.useCallback(
    (next: number) => {
      if (next < 0) return;
      if (next >= stories.length) {
        onClose?.();
        return;
      }
      setDir(next > s ? 1 : -1);
      setS(next);
      setI(0);
    },
    [s, stories.length, onClose],
  );

  const next = React.useCallback(() => {
    if (!story) return;
    if (i < story.items.length - 1) setI(i + 1);
    else {
      onSeen?.(story.id);
      goStory(s + 1);
    }
  }, [i, s, story, goStory, onSeen]);

  const prev = React.useCallback(() => {
    if (i > 0) setI(i - 1);
    else if (s > 0) {
      setDir(-1);
      setS(s - 1);
      setI(Math.max(0, (stories[s - 1]?.items.length ?? 1) - 1));
    }
  }, [i, s, stories]);

  // Reset progress whenever the item changes.
  React.useEffect(() => {
    progress.current = 0;
    bar.current?.style.setProperty("--p", "0");
  }, [s, i]);

  // Drive the active segment without re-rendering every frame.
  React.useEffect(() => {
    if (stopped) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      progress.current += (now - last) / duration;
      last = now;
      bar.current?.style.setProperty("--p", String(Math.min(1, progress.current)));
      if (progress.current >= 1) next();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stopped, duration, next]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === " ") {
      e.preventDefault();
      setPaused((p) => !p);
    } else if (e.key === "ArrowDown" || e.key === "Escape") onClose?.();
    else return;
    e.stopPropagation();
  };

  // Tap left third = back, elsewhere = forward. A press longer than 220ms is a hold, not a tap.
  const pressAt = React.useRef(0);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onDown = () => {
    pressAt.current = performance.now();
    holdTimer.current = setTimeout(() => setHeld(true), 220);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    clearTimeout(holdTimer.current);
    const wasHold = performance.now() - pressAt.current > 220;
    setHeld(false);
    if (wasHold) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width / 3) prev();
    else next();
  };

  if (!story || !item) return null;

  const cube = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: (d: number) => ({ rotateY: d * 90, x: `${d * 50}%`, z: -200, opacity: 0.6 }),
        animate: { rotateY: 0, x: "0%", z: 0, opacity: 1 },
        exit: (d: number) => ({ rotateY: d * -90, x: `${d * -50}%`, z: -200, opacity: 0.6 }),
      };

  return (
    <div
      ref={bar}
      tabIndex={0}
      onKeyDown={onKey}
      aria-roledescription="story player"
      aria-label={`${story.name}, ${i + 1} of ${story.items.length}`}
      className={cn("relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[22px] bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      style={{ perspective: 1200 }}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={story.id}
          custom={dir}
          variants={cube}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className="absolute inset-0"
          style={{ transformOrigin: dir > 0 ? "0% 50%" : "100% 50%", backfaceVisibility: "hidden" }}
        >
          {/* media */}
          <AnimatePresence initial={false}>
            <motion.div key={item.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {item.content ?? (item.src ? <img src={item.src} alt="" className="size-full object-cover" draggable={false} /> : null)}
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

          {/* tap zones */}
          <div className="absolute inset-0 touch-none select-none" onPointerDown={onDown} onPointerUp={onUp} onPointerLeave={() => { clearTimeout(holdTimer.current); setHeld(false); }} />

          {/* progress */}
          <motion.div animate={{ opacity: held ? 0 : 1 }} className="pointer-events-none absolute inset-x-3 top-3 flex gap-1" aria-hidden>
            {story.items.map((it, k) => (
              <div key={it.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                <div
                  className="h-full origin-left rounded-full bg-white"
                  style={{ transform: k < i ? "scaleX(1)" : k > i ? "scaleX(0)" : "scaleX(var(--p, 0))" }}
                />
              </div>
            ))}
          </motion.div>

          {/* header */}
          <motion.div animate={{ opacity: held ? 0 : 1 }} className="absolute inset-x-3 top-6 flex items-center gap-2.5">
            <Avatar story={story} />
            <span className="text-sm font-semibold">{story.name}</span>
            {item.time && <span className="text-sm text-white/60">{item.time}</span>}
            <div className="ml-auto flex items-center">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play" : "Pause"}
                className="grid size-8 place-items-center rounded-full hover:bg-white/10"
              >
                {paused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
              </button>
              {onClose && (
                <button type="button" onClick={onClose} aria-label="Close stories" className="grid size-8 place-items-center rounded-full hover:bg-white/10">
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          </motion.div>

          {item.caption && (
            <motion.div animate={{ opacity: held ? 0 : 1 }} className="pointer-events-none absolute inset-x-5 bottom-6 text-[15px] font-medium leading-snug">
              {item.caption}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {story.name}, story {i + 1} of {story.items.length}
        {paused ? ", paused" : ""}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ ring */

export type StoryRingProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  story: Story;
  seen?: boolean;
  size?: number;
  /** Show the name under the avatar. */
  showName?: boolean;
};

/** The avatar with a gradient ring. Grey once seen. */
export function StoryRing({ story, seen, size = 64, showName = true, className, ...props }: StoryRingProps) {
  return (
    <button type="button" className={cn("group flex w-fit flex-col items-center gap-1.5 outline-none", className)} aria-label={`${story.name}'s story${seen ? ", seen" : ""}`} {...props}>
      <span
        className="grid place-items-center rounded-full p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-ring"
        style={{
          width: size + 10,
          height: size + 10,
          background: seen ? "var(--kn-border-strong)" : "conic-gradient(from 210deg, var(--kn-accent), #22d3ee, #a78bfa, #f472b6, var(--kn-accent))",
        }}
      >
        <span className="grid size-full place-items-center rounded-full bg-background p-[2.5px]">
          <Avatar story={story} size={size} />
        </span>
      </span>
      {showName && <span className={cn("max-w-[5rem] truncate text-xs", seen ? "text-subtle" : "text-foreground")}>{story.name.split(" ")[0]}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ bar + viewer */

export type StoriesProps = {
  stories: Story[];
  className?: string;
  /** Ids of stories already seen. Uncontrolled if left out. */
  seen?: string[];
  onSeenChange?: (seen: string[]) => void;
};

/** A row of story rings that opens the player in a full-screen overlay. */
export function Stories({ stories, className, seen: seenProp, onSeenChange }: StoriesProps) {
  const [open, setOpen] = React.useState<number | null>(null);
  const [seenState, setSeenState] = React.useState<string[]>([]);
  const seen = seenProp ?? seenState;
  const markSeen = (id: string) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeenState(next);
    onSeenChange?.(next);
  };

  return (
    <>
      <div className={cn("flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none]", className)}>
        {stories.map((st, k) => (
          <StoryRing key={st.id} story={st} seen={seen.includes(st.id)} onClick={() => setOpen(k)} />
        ))}
      </div>
      <DialogPrimitive.Root open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <AnimatePresence>
          {open !== null && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-0 z-50 grid place-items-center p-4 outline-none"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                >
                  <DialogPrimitive.Title className="sr-only">Stories</DialogPrimitive.Title>
                  <div className="relative flex w-full max-w-sm items-center">
                    <button
                      type="button"
                      aria-label="Previous person"
                      disabled={open === 0}
                      onClick={() => setOpen((o) => (o ? o - 1 : o))}
                      className="absolute -left-14 hidden size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 sm:grid"
                    >
                      <ChevronLeftIcon className="size-5" />
                    </button>
                    <StoryPlayer
                      key={open}
                      stories={stories}
                      initialStory={open}
                      onSeen={markSeen}
                      onClose={() => setOpen(null)}
                      className="w-[min(100%,calc(88vh*0.5625))] max-w-none"
                    />
                    <button
                      type="button"
                      aria-label="Next person"
                      disabled={open === stories.length - 1}
                      onClick={() => setOpen((o) => (o !== null && o < stories.length - 1 ? o + 1 : o))}
                      className="absolute -right-14 hidden size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 sm:grid"
                    >
                      <ChevronRightIcon className="size-5" />
                    </button>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </>
  );
}
