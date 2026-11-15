"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Avatar, Badge, Button, CodeBlock, TableOfContents } from "@kineticui/ui";
import { BookmarkIcon, ClockIcon, HeartIcon, LinkIcon, ShareIcon } from "@kineticui/icons";

const headings = [
  { id: "bp-why", label: "Why springs beat easing curves" },
  { id: "bp-tuning", label: "Tuning stiffness and damping" },
  { id: "bp-interrupt", label: "Interruptible by default", level: 3 as const },
  { id: "bp-reduced", label: "Respecting reduced motion" },
  { id: "bp-wrap", label: "Wrapping up" },
];

/** Long-form article: reading progress bar, sticky table of contents, author card, code sample, claps and share. */
export function BlogPost() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const [likes, setLikes] = React.useState(248);
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  return (
    <article ref={ref} className="relative">
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-accent" />
      <header className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pb-10 pt-16 text-center">
        <div className="flex justify-center gap-2"><Badge variant="soft">Engineering</Badge><Badge>Motion</Badge></div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Designing motion that feels physical, not decorative</h1>
        <p className="text-lg text-muted">How we tuned every spring in Kinetic UI so interfaces respond like real objects — and stay out of the way.</p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <Avatar alt="Lena Ortiz" color="#f9a8d4" />
          <div className="text-left">
            <div className="font-medium">Lena Ortiz</div>
            <div className="flex items-center gap-1.5 text-xs text-subtle">Nov 12, 2026 · <ClockIcon size={12} /> 8 min read</div>
          </div>
        </div>
      </header>
      <div className="mx-auto mb-12 aspect-[21/9] max-w-5xl overflow-hidden rounded-3xl px-6">
        <div className="relative size-full overflow-hidden rounded-3xl" style={{ background: "radial-gradient(circle at 30% 40%, var(--kn-accent), transparent 45%), radial-gradient(circle at 75% 60%, #7dd3fc, transparent 40%), var(--kn-surface-raised)" }}>
          <motion.div animate={{ x: [0, 120, 0] }} transition={{ duration: 3, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1] }} className="absolute left-[30%] top-1/2 size-16 -translate-y-1/2 rounded-2xl bg-background/80 shadow-overlay backdrop-blur" />
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-12 px-6 pb-24 lg:grid-cols-[1fr_220px]">
        <div className="flex max-w-2xl flex-col gap-6 text-[17px] leading-8 text-muted [&_h2]:mt-6 [&_h2]:scroll-mt-20 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:scroll-mt-20 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground">
          <p><span className="float-left mr-2 mt-1 font-display text-6xl font-bold leading-none text-accent">M</span>otion is the part of an interface people feel before they read anything. A menu that opens with a tiny overshoot reads as responsive; the same menu on a linear fade reads as slow, even when it is faster.</p>
          <h2 id="bp-why">Why springs beat easing curves</h2>
          <p>Easing curves are defined by duration. Springs are defined by physics — stiffness, damping and mass — so they settle naturally from whatever velocity they start with. That makes them the right default for anything a user can grab, flick or interrupt.</p>
          <blockquote className="border-l-2 border-accent pl-5 font-display text-xl italic text-foreground">If a user can interrupt it, it should be a spring.</blockquote>
          <h2 id="bp-tuning">Tuning stiffness and damping</h2>
          <p>We use three presets across the library. Snappy for small controls, smooth for panels and gentle for page-level transitions.</p>
          <CodeBlock files={[{ name: "springs.ts", language: "ts", code: `export const springs = {\n  snappy: { type: "spring", stiffness: 500, damping: 30 },\n  smooth: { type: "spring", stiffness: 380, damping: 32 },\n  gentle: { type: "spring", stiffness: 120, damping: 20 },\n} as const;` }]} />
          <h3 id="bp-interrupt">Interruptible by default</h3>
          <p>Because springs carry velocity, reversing a drawer halfway through its open animation simply redirects it. No jump, no queued animation.</p>
          <h2 id="bp-reduced">Respecting reduced motion</h2>
          <p>Every component checks the user&apos;s reduced-motion preference and swaps movement for opacity. Nothing important is ever communicated by motion alone.</p>
          <h2 id="bp-wrap">Wrapping up</h2>
          <p>Good motion is invisible: it explains where things came from and where they went, then gets out of the way.</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-border py-4">
            <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={() => { setLiked(!liked); setLikes((l) => l + (liked ? -1 : 1)); }} className={`flex h-9 items-center gap-2 rounded-full border px-4 text-sm ${liked ? "border-danger/50 bg-danger-soft text-danger" : "border-border-strong"}`}>
              <HeartIcon size={15} fill={liked ? "currentColor" : "none"} /> {likes}
            </motion.button>
            <Button variant="ghost" size="sm" onClick={() => setSaved(!saved)}><BookmarkIcon size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</Button>
            <Button variant="ghost" size="sm" onClick={() => void navigator.clipboard?.writeText(location.href)}><LinkIcon size={15} /> Copy link</Button>
            <Button variant="ghost" size="sm" className="ml-auto"><ShareIcon size={15} /> Share</Button>
          </div>
          <div className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
            <Avatar alt="Lena Ortiz" color="#f9a8d4" size="lg" />
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">Written by Lena Ortiz</span>
              <span className="leading-6">Design engineer at Kinetic. Writes about motion, type and the small details that make interfaces feel alive.</span>
            </div>
          </div>
        </div>
        <aside className="hidden lg:block"><TableOfContents headings={headings} className="sticky top-10" /></aside>
      </div>
    </article>
  );
}
