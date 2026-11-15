"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Button, SearchInput } from "@kineticui/ui";
import { ArrowRightIcon, HomeIcon } from "@kineticui/icons";

/** 404 page: oversized digits that follow the cursor in parallax, search, and helpful links. */
export function Error404({ links = [{ label: "Documentation", href: "#docs" }, { label: "Components", href: "#components" }, { label: "Status", href: "#status" }] }: { links?: { label: string; href: string }[] }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const back = { x: useTransform(sx, (v) => v * -20), y: useTransform(sy, (v) => v * -20) };
  const front = { x: useTransform(sx, (v) => v * 30), y: useTransform(sy, (v) => v * 30) };

  return (
    <section
      className="relative flex min-h-[680px] flex-col items-center justify-center gap-8 overflow-hidden px-6 py-20 text-center"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
    >
      <div className="relative select-none font-display text-[150px] font-bold leading-none tracking-tighter sm:text-[220px]" aria-hidden>
        <motion.span style={back} className="absolute inset-0 text-accent/20 blur-sm">404</motion.span>
        <motion.span style={front} className="relative block bg-gradient-to-b from-foreground to-foreground/20 bg-clip-text text-transparent">404</motion.span>
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">This page drifted off</h1>
        <p className="text-muted">The link may be broken or the page may have moved. Try searching, or head back home.</p>
      </div>
      <SearchInput className="w-full max-w-sm" placeholder="Search the site" shortcut={null} />
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <a href="/"><HomeIcon size={15} /> Back home</a>
        </Button>
        <Button variant="secondary" onClick={() => history.back()}>Go back</Button>
      </div>
      <nav aria-label="Helpful links" className="flex flex-wrap justify-center gap-5 text-sm text-muted">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="group flex items-center gap-1 hover:text-foreground">
            {l.label} <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        ))}
      </nav>
    </section>
  );
}
