"use client";

import * as React from "react";
import { cn, useReducedMotion } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type CarouselProps = {
  children: React.ReactNode[];
  /** Slides visible at once (desktop). */
  perView?: number;
  /** Autoplay interval in ms. Pauses on hover/focus. */
  autoplay?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  gap?: number;
  label?: string;
  className?: string;
};

/** Scroll-snap carousel: native touch swiping, arrows, dots and optional autoplay. */
export function Carousel({ children, perView = 1, autoplay, loop = true, showArrows = true, showDots = true, gap = 16, label = "Carousel", className }: CarouselProps) {
  const track = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion();
  const count = children.length;
  const maxIndex = Math.max(0, count - perView);

  const go = React.useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const next = loop ? (i > maxIndex ? 0 : i < 0 ? maxIndex : i) : Math.max(0, Math.min(maxIndex, i));
      const slide = el.children[next] as HTMLElement | undefined;
      if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: reduced ? "auto" : "smooth" });
    },
    [loop, maxIndex, reduced],
  );

  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
      setIndex(Math.round(el.scrollLeft / (w + gap)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [gap]);

  React.useEffect(() => {
    if (!autoplay || paused || reduced) return;
    const t = window.setInterval(() => go(index + 1), autoplay);
    return () => window.clearInterval(t);
  }, [autoplay, paused, reduced, index, go]);

  const arrow = "absolute top-1/2 z-[1] flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-surface-overlay/90 shadow-overlay backdrop-blur transition-opacity hover:bg-surface-raised disabled:pointer-events-none disabled:opacity-0";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div ref={track} tabIndex={0} role="group" aria-label="Slides" className="flex snap-x snap-mandatory overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-ring overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ gap }}>
        {children.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="shrink-0 snap-start"
            style={{ width: `calc((100% - ${gap * (perView - 1)}px) / ${perView})` }}
          >
            {child}
          </div>
        ))}
      </div>
      {showArrows ? (
        <>
          <button type="button" aria-label="Previous slide" disabled={!loop && index === 0} onClick={() => go(index - 1)} className={cn(arrow, "-left-3")}>
            <ChevronLeftIcon size={18} />
          </button>
          <button type="button" aria-label="Next slide" disabled={!loop && index >= maxIndex} onClick={() => go(index + 1)} className={cn(arrow, "-right-3")}>
            <ChevronRightIcon size={18} />
          </button>
        </>
      ) : null}
      {showDots ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === index ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-muted")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
