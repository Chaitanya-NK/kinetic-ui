"use client";

import * as React from "react";
import { Marquee } from "@kineticui/motion";

const defaults = [
  { name: "Northwind", style: "font-display font-bold tracking-tight" },
  { name: "ATLAS", style: "font-mono font-semibold tracking-[0.3em]" },
  { name: "ledger", style: "font-display font-semibold italic" },
  { name: "Orbit", style: "font-sans font-black tracking-tighter" },
  { name: "PULSE", style: "font-display font-medium tracking-[0.2em]" },
  { name: "stride", style: "font-sans font-bold lowercase" },
  { name: "Quanta", style: "font-mono font-bold" },
  { name: "Halcyon", style: "font-display font-light tracking-wide" },
];

/** "Trusted by" strip of placeholder wordmarks in an infinite, edge-faded marquee. Swap in your customers' SVG logos. */
export function LogoCloud({ title = "Trusted by product teams at", logos = defaults }: { title?: string; logos?: { name: string; style?: string; logo?: React.ReactNode }[] }) {
  return (
    <section className="flex flex-col items-center gap-8 py-16">
      <p className="text-sm text-subtle">{title}</p>
      <div className="w-full max-w-5xl [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <Marquee duration={30} gap="4rem">
          {logos.map((l) => (
            <span key={l.name} className={`flex h-10 shrink-0 items-center text-2xl text-muted grayscale transition-colors hover:text-foreground ${l.style ?? ""}`}>
              {l.logo ?? l.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
