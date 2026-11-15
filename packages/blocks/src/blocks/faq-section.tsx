"use client";

import * as React from "react";
import { Accordion, AccordionItem, Button, SearchInput } from "@kineticui/ui";
import { ChatIcon } from "@kineticui/icons";

export type Faq = { q: string; a: string };

const defaults: Faq[] = [
  { q: "Is Kinetic free to use?", a: "Yes. Every component is MIT licensed. Use it in personal and commercial projects without attribution." },
  { q: "Do I install from npm or copy the code?", a: "Either. The npm packages and the copy-paste registry are built from the same source, so you can mix both in one app." },
  { q: "Does it work with the Next.js App Router?", a: "Yes. Interactive components are marked \"use client\" and utilities like cn() stay server-safe." },
  { q: "How do I change the colours?", a: "Override the --kn-* CSS variables or switch the accent with data-accent on <html>. Light and dark themes are built in." },
  { q: "Is it accessible?", a: "Interactive primitives are built on Radix with full keyboard support, and every animation respects prefers-reduced-motion." },
  { q: "Can I use it without Tailwind?", a: "The components are styled with Tailwind CSS v4 classes, so Tailwind is required for now." },
];

/** Searchable FAQ with a two-column layout and a contact card. */
export function FaqSection({ faqs = defaults }: { faqs?: Faq[] }) {
  const [q, setQ] = React.useState("");
  const shown = faqs.filter((f) => !q || (f.q + f.a).toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col gap-5 lg:sticky lg:top-10 lg:self-start">
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered</h2>
        <p className="text-lg text-muted">Can&apos;t find what you need? Our team replies within a day.</p>
        <SearchInput value={q} onValueChange={setQ} placeholder="Search questions" shortcut={null} />
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <ChatIcon size={18} />
          </span>
          <div className="flex-1">
            <div className="font-medium">Still stuck?</div>
            <div className="text-sm text-muted">Chat with a human.</div>
          </div>
          <Button size="sm" variant="secondary">Contact us</Button>
        </div>
      </div>
      <div>
        {shown.length ? (
          <Accordion type="single" collapsible defaultValue={shown[0]?.q}>
            {shown.map((f) => (
              <AccordionItem key={f.q} value={f.q} title={f.q}>
                {f.a}
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-subtle">No questions match “{q}”.</p>
        )}
      </div>
    </section>
  );
}
