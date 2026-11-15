"use client";

import * as React from "react";
import { Button } from "@kineticui/ui";
import { BorderBeam, GridBackground, Magnetic } from "@kineticui/motion";
import { ArrowRightIcon } from "@kineticui/icons";

/** Closing call-to-action in a glowing, beam-bordered panel. */
export function CtaBanner({
  title = "Ready to build something that moves?",
  description = "Join 12,000 developers shipping faster with Kinetic. Free forever for personal projects.",
  primary = "Get started free",
  secondary = "Talk to sales",
}: {
  title?: string;
  description?: string;
  primary?: string;
  secondary?: string;
}) {
  return (
    <section className="px-6 py-24">
      <div className="relative isolate mx-auto flex max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-[32px] border border-border-strong bg-surface px-6 py-20 text-center">
        <GridBackground className="-z-10 opacity-50" />
        <div className="absolute -bottom-40 left-1/2 -z-10 h-80 w-[600px] -translate-x-1/2 rounded-full bg-accent/25 blur-[100px]" />
        <BorderBeam duration={10} />
        <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h2>
        <p className="max-w-lg text-lg text-muted">{description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Button size="lg" className="rounded-full px-7">
              {primary} <ArrowRightIcon size={16} />
            </Button>
          </Magnetic>
          <Button size="lg" variant="ghost" className="rounded-full">{secondary}</Button>
        </div>
      </div>
    </section>
  );
}
