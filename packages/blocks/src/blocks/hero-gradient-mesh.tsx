"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@kineticui/ui";
import { ShinyText } from "@kineticui/motion";
import { ArrowRightIcon, PlayIcon } from "@kineticui/icons";

const blobs = [
  { c: "var(--kn-accent)", x: ["-10%", "15%", "-10%"], y: ["-10%", "10%", "-10%"], s: 520, d: 18, pos: "left-[10%] top-[5%]" },
  { c: "#7C8CFF", x: ["10%", "-15%", "10%"], y: ["0%", "15%", "0%"], s: 480, d: 22, pos: "right-[5%] top-[15%]" },
  { c: "#F0A3D0", x: ["0%", "10%", "0%"], y: ["10%", "-10%", "10%"], s: 420, d: 20, pos: "bottom-[0%] left-[30%]" },
];

/** Hero over a slowly drifting, blurred gradient mesh with a shimmering headline. */
export function HeroGradientMesh({
  eyebrow = "Introducing Aurora",
  title = "Design at the speed of thought",
  description = "Generate on-brand layouts from a sentence, then fine-tune every pixel together in real time.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative isolate flex min-h-[720px] items-center justify-center overflow-hidden px-6 py-24">
      <div className="absolute inset-0 -z-10" aria-hidden>
        {blobs.map((b, i) => (
          <motion.span
            key={i}
            className={`absolute rounded-full opacity-40 blur-[110px] ${b.pos}`}
            style={{ width: b.s, height: b.s, background: b.c }}
            animate={{ x: b.x, y: b.y }}
            transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,var(--kn-background)_75%)]" />
      </div>
      <div className="flex max-w-3xl flex-col items-center gap-7 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {eyebrow}
        </motion.span>
        <motion.h1 initial={{ opacity: 0, filter: "blur(12px)", y: 12 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.8 }} className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl">
          <ShinyText>{title}</ShinyText>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-xl text-lg leading-relaxed text-muted">
          {description}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="rounded-full px-6">
            Try Aurora free <ArrowRightIcon size={16} />
          </Button>
          <Button size="lg" variant="ghost" className="rounded-full">
            <PlayIcon size={15} fill="currentColor" /> Watch the film
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
