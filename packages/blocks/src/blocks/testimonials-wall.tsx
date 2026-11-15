"use client";

import * as React from "react";
import { Avatar } from "@kineticui/ui";
import { Marquee } from "@kineticui/motion";
import { StarIcon } from "@kineticui/icons";

export type Testimonial = { quote: string; name: string; role: string; color?: string };

const defaults: Testimonial[] = [
  { quote: "We replaced three libraries with Kinetic and our bundle got smaller. The motion is just right.", name: "Maya Kapoor", role: "Design lead, Atlas", color: "#7C8CFF" },
  { quote: "The command palette alone saved us a sprint.", name: "Rohan Joshi", role: "Staff engineer, Ledger", color: "#F4A86A" },
  { quote: "Accessible out of the box. Our audit came back clean on the first try.", name: "Rosa Silva", role: "A11y lead, Northwind", color: "#F0A3D0" },
  { quote: "Copy-paste when we need control, npm when we don't. Exactly how it should work.", name: "Kemi Okafor", role: "CTO, Orbit", color: "#6EE7A0" },
  { quote: "Our designers stopped asking for 'more polish'. That says it all.", name: "Lena Fischer", role: "PM, Pulse", color: "#E8E8E3" },
  { quote: "Dark mode, accents, tokens — theming took ten minutes.", name: "Noah Kim", role: "Founder, Stride", color: "#C6F432" },
];

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex w-80 shrink-0 flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex gap-0.5 text-[#F5C451]">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} size={13} fill="currentColor" />
        ))}
      </span>
      <blockquote className="text-[15px] leading-relaxed text-foreground/90">“{t.quote}”</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Avatar alt={t.name} size="sm" color={t.color} />
        <span className="flex flex-col">
          <span className="text-sm font-medium">{t.name}</span>
          <span className="text-xs text-subtle">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/** Two counter-scrolling rows of testimonial cards with faded edges. */
export function TestimonialsWall({ title = "Teams ship faster with Kinetic", testimonials = defaults }: { title?: string; testimonials?: Testimonial[] }) {
  const half = Math.ceil(testimonials.length / 2);
  // Repeat short rows so each marquee track is wider than the viewport.
  const fill = (list: Testimonial[]) => Array.from({ length: Math.max(1, Math.ceil(6 / Math.max(1, list.length))) }, () => list).flat();
  return (
    <section className="flex flex-col items-center gap-12 overflow-hidden py-24">
      <div className="flex max-w-2xl flex-col items-center gap-3 px-6 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">Testimonials</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      </div>
      <div className="flex w-full flex-col gap-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <Marquee duration={40} pauseOnHover>
          {fill(testimonials.slice(0, half)).map((t, i) => (
            <Card key={`${t.name}-${i}`} t={t} />
          ))}
        </Marquee>
        <Marquee duration={46} reverse pauseOnHover>
          {fill(testimonials.slice(half)).map((t, i) => (
            <Card key={`${t.name}-${i}`} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
