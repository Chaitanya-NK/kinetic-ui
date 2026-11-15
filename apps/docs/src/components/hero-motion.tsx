"use client";

import { GridBackground } from "@kineticui/motion";

export function HeroMotion({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <GridBackground />
      <div className="relative">{children}</div>
    </section>
  );
}
