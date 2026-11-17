"use client";

import * as React from "react";
import { Button, Input, Select, ThemeSwitch, toast } from "@kineticui/ui";

const columns = [
  { title: "Product", links: ["Components", "Blocks", "Templates", "Pricing", "Changelog"] },
  { title: "Developers", links: ["Documentation", "CLI", "Registry", "GitHub", "Status"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Licenses", "Security"] },
];

function Social({ d, label }: { d: string; label: string }) {
  return (
    <a href={`#${label.toLowerCase()}`} aria-label={label} className="flex size-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground">
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d={d} />
      </svg>
    </a>
  );
}

/** Full footer: brand + newsletter, four link columns, socials, status, theme switch and language. */
export function FooterColumns({ brand = "Kinetic" }: { brand?: string }) {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent font-bold text-accent-foreground">{brand[0]}</span>
              {brand}
            </span>
            <p className="max-w-xs text-sm text-muted">Motion-first components for teams who care about the details.</p>
            <form
              className="flex max-w-xs gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                toast({ title: "Subscribed", tone: "success" });
              }}
            >
              <Input type="email" placeholder="Email" aria-label="Email" wrapperClassName="flex-1" />
              <Button type="submit" variant="secondary">Join</Button>
            </form>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title} className="flex flex-col gap-3 text-sm">
              <span className="font-mono text-[11px] uppercase tracking-wider text-subtle">{c.title}</span>
              {c.links.map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="w-fit text-muted transition-colors hover:text-foreground">
                  {l}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-subtle">
            <span>© 2026 {brand} Labs</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" /> All systems normal
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Social label="GitHub" d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0022 12.2C22 6.6 17.5 2 12 2z" />
            <Social label="X" d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
            <Social label="LinkedIn" d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.85c0-1.15-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57v4.93h-4z" />
            <span className="mx-2 h-6 w-px bg-border" />
            <ThemeSwitch />
            <Select aria-label="Language" className="h-9 w-32" defaultValue="en" options={[{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }, { value: "es", label: "Español" }]} />
          </div>
        </div>
      </div>
    </footer>
  );
}
