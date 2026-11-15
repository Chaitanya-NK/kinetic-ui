"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { XIcon } from "@kineticui/icons";

export type WhatsNewSlide = { title: string; body: React.ReactNode; media?: React.ReactNode; tag?: string };

export type WhatsNewProps = {
  slides: WhatsNewSlide[];
  /** Version string; once seen it's stored so the dialog doesn't re-open. */
  version: string;
  /** Force open (controlled). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Auto-open for users who haven't seen this version. */
  autoOpen?: boolean;
  storageKey?: string;
  cta?: { label: string; onClick: () => void };
};

/** "What's new" release dialog: swipeable feature slides with media, dots, keyboard nav and seen-version memory. */
export function WhatsNew({ slides, version, open: controlled, onOpenChange, autoOpen = true, storageKey = "kn-whats-new", cta }: WhatsNewProps) {
  const [inner, setInner] = React.useState(false);
  const open = controlled ?? inner;
  const [i, setI] = React.useState(0);
  const [dir, setDir] = React.useState(1);
  const setOpen = (o: boolean) => {
    if (controlled === undefined) setInner(o);
    onOpenChange?.(o);
    if (!o) {
      try {
        localStorage.setItem(storageKey, version);
      } catch {
        /* ignore */
      }
    }
  };

  React.useEffect(() => {
    if (!autoOpen || controlled !== undefined) return;
    try {
      if (localStorage.getItem(storageKey) !== version) setInner(true);
    } catch {
      /* ignore */
    }
  }, [autoOpen, controlled, storageKey, version]);

  React.useEffect(() => {
    if (open) setI(0);
  }, [open]);

  const go = (n: number) => {
    if (n < 0 || n >= slides.length) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };
  const s = slides[i]!;
  const last = i === slides.length - 1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.2s]" />
        <DialogPrimitive.Content
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(i + 1);
            if (e.key === "ArrowLeft") go(i - 1);
          }}
          className="fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border-strong bg-surface-raised shadow-overlay outline-none data-[state=open]:animate-[kn-dialog-in_0.3s_var(--ease-kn-spring)]"
        >
          <DialogPrimitive.Close aria-label="Close" className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-black/50">
            <XIcon size={15} />
          </DialogPrimitive.Close>
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={i}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(i + 1);
                if (info.offset.x > 60) go(i - 1);
              }}
            >
              <div className="aspect-[16/9] overflow-hidden bg-[linear-gradient(135deg,var(--kn-accent-soft),var(--kn-surface))]">{s.media}</div>
              <div className="flex flex-col gap-2 p-6 pb-2">
                <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">{s.tag ?? `New in ${version}`}</span>
                <DialogPrimitive.Title className="font-display text-2xl font-semibold tracking-tight">{s.title}</DialogPrimitive.Title>
                <DialogPrimitive.Description asChild>
                  <div className="text-sm leading-relaxed text-muted">{s.body}</div>
                </DialogPrimitive.Description>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-3 p-6 pt-4">
            <div className="flex gap-1.5">
              {slides.map((_, k) => (
                <button key={k} type="button" aria-label={`Slide ${k + 1}`} onClick={() => go(k)} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-accent" : "w-1.5 bg-border-strong")} />
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              {i > 0 ? <button type="button" onClick={() => go(i - 1)} className="h-9 rounded-lg px-3 text-sm text-muted hover:text-foreground">Back</button> : null}
              <button
                type="button"
                onClick={() => {
                  if (!last) return go(i + 1);
                  cta?.onClick();
                  setOpen(false);
                }}
                className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground"
              >
                {last ? cta?.label ?? "Got it" : "Next"}
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
