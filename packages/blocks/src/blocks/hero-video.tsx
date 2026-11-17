"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button, Dialog, DialogContent, DialogTitle, VideoPlayer } from "@kineticui/ui";
import { ArrowRightIcon, PlayIcon } from "@kineticui/icons";

export type HeroVideoProps = {
  title?: string;
  description?: string;
  /** Muted looping background video. Falls back to an animated gradient. */
  backgroundSrc?: string;
  /** Full film opened by the play button. */
  videoSrc?: string;
  poster?: string;
};

/** Full-bleed cinematic hero: background loop, big type and a play button that opens the film in a dialog. */
export function HeroVideo({
  title = "Built for the way you move",
  description = "Meet Stride — the running shoe that learns your gait and adapts every mile.",
  backgroundSrc,
  videoSrc,
  poster,
}: HeroVideoProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <section className="relative isolate flex min-h-[720px] items-end overflow-hidden">
      {backgroundSrc ? (
        <video src={backgroundSrc} poster={poster} autoPlay muted loop playsInline className="absolute inset-0 -z-10 size-full object-cover" />
      ) : (
        <motion.div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,#1d2a4a,#0b0c0e_40%,#2a3a12_70%,#4a2a12)] bg-[length:300%_300%]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 sm:flex-row sm:items-end sm:justify-between">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 80, damping: 18 }} className="flex max-w-2xl flex-col gap-5">
          <h1 className="font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-8xl">{title}</h1>
          <p className="max-w-md text-lg text-muted">{description}</p>
          <div className="flex gap-3">
            <Button size="lg" className="rounded-full px-6">Pre-order <ArrowRightIcon size={16} /></Button>
            <Button size="lg" variant="secondary" className="rounded-full px-6">Find your size</Button>
          </div>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="group flex items-center gap-4 self-start text-left sm:self-auto"
        >
          <span className="relative flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <span className="absolute inset-0 rounded-full bg-accent/50 animate-ping" />
            <PlayIcon size={26} fill="currentColor" className="relative translate-x-0.5" />
          </span>
          <span className="flex flex-col">
            <span className="font-medium">Watch the film</span>
            <span className="font-mono text-xs text-subtle">1:42</span>
          </span>
        </motion.button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {videoSrc ? (
            <VideoPlayer src={videoSrc} poster={poster} title={title} />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-surface-raised text-sm text-subtle">Pass `videoSrc` to play your film here.</div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
