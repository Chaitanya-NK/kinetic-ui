"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@kineticui/icons";

export type LightboxImage = { src: string; alt: string; caption?: string };

export type LightboxProps = {
  images: LightboxImage[];
  /** Thumbnail grid columns. */
  columns?: number;
  className?: string;
};

/** Image grid that opens a full-screen viewer with keyboard, swipe and thumbnails. */
export function Lightbox({ images, columns = 3, className }: LightboxProps) {
  const [index, setIndex] = React.useState<number | null>(null);
  const [dir, setDir] = React.useState(1);
  const open = index !== null;
  const go = React.useCallback(
    (d: number) => {
      setDir(d);
      setIndex((i) => (i === null ? i : (i + d + images.length) % images.length));
    },
    [images.length],
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = index !== null ? images[index] : null;

  return (
    <>
      <div className={cn("grid gap-2", className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            className="group aspect-square overflow-hidden rounded-xl bg-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img src={img.src} alt={img.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </button>
        ))}
      </div>
      <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm data-[state=open]:animate-[kn-fade_0.2s_ease-out]" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none">
            <DialogPrimitive.Title className="sr-only">{current?.alt ?? "Image"}</DialogPrimitive.Title>
            <div className="absolute left-5 top-5 font-mono text-xs text-white/60">
              {index !== null ? `${index + 1} / ${images.length}` : null}
            </div>
            <DialogPrimitive.Close aria-label="Close" className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <XIcon size={18} />
            </DialogPrimitive.Close>
            <div className="relative flex w-full max-w-4xl flex-1 items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                {current ? (
                  <motion.img
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -80 }}
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -80) go(1);
                      else if (info.offset.x > 80) go(-1);
                    }}
                    className="max-h-[75vh] max-w-full cursor-grab rounded-xl object-contain active:cursor-grabbing"
                  />
                ) : null}
              </AnimatePresence>
              <button type="button" aria-label="Previous" onClick={() => go(-1)} className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronLeftIcon size={20} />
              </button>
              <button type="button" aria-label="Next" onClick={() => go(1)} className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                <ChevronRightIcon size={20} />
              </button>
            </div>
            {current?.caption ? <p className="text-sm text-white/80">{current.caption}</p> : null}
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => {
                    setDir(i > (index ?? 0) ? 1 : -1);
                    setIndex(i);
                  }}
                  className={cn("size-14 shrink-0 overflow-hidden rounded-lg transition-opacity", i === index ? "ring-2 ring-accent" : "opacity-50 hover:opacity-100")}
                >
                  <img src={img.src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
