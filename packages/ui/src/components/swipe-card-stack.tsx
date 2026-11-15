"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@kineticui/core";
import { HeartIcon, RefreshIcon, XIcon } from "@kineticui/icons";

export type SwipeDirection = "left" | "right";

export type SwipeCardStackProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onSwipe?: (item: T, direction: SwipeDirection) => void;
  /** Shown when every card has been swiped. */
  empty?: React.ReactNode;
  /** Labels stamped on the card while dragging. */
  likeLabel?: string;
  nopeLabel?: string;
  /** Show Undo / Nope / Like buttons. */
  showControls?: boolean;
  className?: string;
};

function TopCard({ children, onSwipe, likeLabel, nopeLabel, forced }: { children: React.ReactNode; onSwipe: (d: SwipeDirection) => void; likeLabel: string; nopeLabel: string; forced: SwipeDirection | null }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-16, 16]);
  const like = useTransform(x, [20, 110], [0, 1]);
  const nope = useTransform(x, [-110, -20], [1, 0]);
  const fly = React.useCallback(
    (d: SwipeDirection) => {
      void animate(x, d === "right" ? 600 : -600, { duration: 0.32, ease: "easeIn" }).then(() => onSwipe(d));
    },
    [x, onSwipe],
  );
  React.useEffect(() => {
    if (forced) fly(forced);
  }, [forced, fly]);

  return (
    <motion.div
      drag="x"
      dragSnapToOrigin
      style={{ x, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120 || info.velocity.x > 600) fly("right");
        else if (info.offset.x < -120 || info.velocity.x < -600) fly("left");
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") fly("right");
        if (e.key === "ArrowLeft") fly("left");
      }}
      aria-label="Card. Swipe or press left/right arrow."
      className="absolute inset-0 z-10 cursor-grab touch-none overflow-hidden rounded-3xl shadow-overlay outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
    >
      {children}
      <motion.span style={{ opacity: like }} className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-lg border-[3px] border-accent px-3 py-1 font-display text-2xl font-bold uppercase text-accent">
        {likeLabel}
      </motion.span>
      <motion.span style={{ opacity: nope }} className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-lg border-[3px] border-danger px-3 py-1 font-display text-2xl font-bold uppercase text-danger">
        {nopeLabel}
      </motion.span>
    </motion.div>
  );
}

/** Tinder-style card stack: drag or tap to like/pass, with undo. */
export function SwipeCardStack<T>({ items, getKey, renderCard, onSwipe, empty, likeLabel = "Like", nopeLabel = "Nope", showControls = true, className }: SwipeCardStackProps<T>) {
  const [index, setIndex] = React.useState(0);
  const [forced, setForced] = React.useState<SwipeDirection | null>(null);
  const top = items[index];
  const next = items.slice(index + 1, index + 3);

  const handle = React.useCallback(
    (d: SwipeDirection) => {
      if (top) onSwipe?.(top, d);
      setForced(null);
      setIndex((i) => i + 1);
    },
    [top, onSwipe],
  );

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative aspect-[3/4] w-full max-w-xs">
        {next
          .map((item, i) => (
            <motion.div
              key={getKey(item)}
              animate={{ scale: 1 - (i + 1) * 0.05, y: (i + 1) * 14 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 overflow-hidden rounded-3xl opacity-90"
              aria-hidden
            >
              {renderCard(item)}
            </motion.div>
          ))
          .reverse()}
        <AnimatePresence>
          {top ? (
            <TopCard key={getKey(top)} onSwipe={handle} likeLabel={likeLabel} nopeLabel={nopeLabel} forced={forced}>
              {renderCard(top)}
            </TopCard>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border-strong text-center text-sm text-subtle">
              {empty ?? "You're all caught up"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showControls ? (
        <div className="mt-6 flex items-center gap-4">
          <button type="button" aria-label="Undo" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))} className="flex size-11 items-center justify-center rounded-full border border-border-strong text-warning transition-transform active:scale-90 disabled:opacity-30">
            <RefreshIcon size={18} />
          </button>
          <button type="button" aria-label={nopeLabel} disabled={!top} onClick={() => setForced("left")} className="flex size-14 items-center justify-center rounded-full border border-border-strong text-danger transition-transform hover:bg-danger-soft active:scale-90 disabled:opacity-30">
            <XIcon size={24} strokeWidth={2.6} />
          </button>
          <button type="button" aria-label={likeLabel} disabled={!top} onClick={() => setForced("right")} className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-90 disabled:opacity-30">
            <HeartIcon size={24} fill="currentColor" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
