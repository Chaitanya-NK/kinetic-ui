"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Badge, Button, Input } from "@kineticui/ui";
import { RssIcon } from "@kineticui/icons";

type Release = { version: string; date: string; title: string; summary: string; items: { kind: "new" | "improved" | "fixed"; text: string }[]; hue: string };
const releases: Release[] = [
  { version: "1.4.0", date: "Nov 14, 2026", title: "Mixed components", summary: "Share sheets, filter builders, upload queues and passkey sign-in.", hue: "#C6F432", items: [{ kind: "new", text: "ShareSheet with QR code and access settings" }, { kind: "new", text: "FilterBuilder with applyFilters() helper" }, { kind: "improved", text: "CommentThread supports @mentions" }, { kind: "fixed", text: "BulkActionBar shortcuts ignored inside inputs" }] },
  { version: "1.3.0", date: "Nov 2, 2026", title: "Display & feedback", summary: "World map, org chart, skeleton set and a What's New dialog.", hue: "#7dd3fc", items: [{ kind: "new", text: "WorldMap with pulsing markers and arcs" }, { kind: "new", text: "Skeleton presets for cards, tables and dashboards" }, { kind: "improved", text: "CookieConsent bar and modal variants" }] },
  { version: "1.2.0", date: "Oct 20, 2026", title: "Editors", summary: "Rich text, Markdown and a lightweight code editor.", hue: "#f9a8d4", items: [{ kind: "new", text: "RichTextEditor with floating toolbar" }, { kind: "new", text: "CodeEditor with auto-indent and bracket pairing" }, { kind: "fixed", text: "Caret jumping while typing fast" }] },
];
const kindVariant = { new: "solid", improved: "info", fixed: "warning" } as const;

/** Changelog page: sticky version rail, release cards with banners and typed entries, filters and an email subscribe. */
export function ChangelogPage() {
  const [filter, setFilter] = React.useState<"all" | "new" | "improved" | "fixed">("all");
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight">Changelog</h1>
          <p className="text-muted">New components, improvements and fixes, every two weeks.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="flex gap-2">
          {subscribed ? <span className="text-sm text-accent">Subscribed. See you next release.</span> : (
            <>
              <Input type="email" required placeholder="you@company.com" aria-label="Email" className="w-52" />
              <Button type="submit">Subscribe</Button>
            </>
          )}
          <Button variant="ghost" size="icon" aria-label="RSS feed"><RssIcon size={16} /></Button>
        </form>
      </div>
      <div className="flex gap-2">
        {(["all", "new", "improved", "fixed"] as const).map((f) => <Button key={f} size="sm" variant={filter === f ? "primary" : "secondary"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>)}
      </div>
      <ol className="flex flex-col gap-14">
        {releases.map((r) => {
          const items = r.items.filter((i) => filter === "all" || i.kind === filter);
          if (!items.length) return null;
          return (
            <motion.li key={r.version} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} className="grid gap-6 md:grid-cols-[160px_1fr]">
              <div className="flex flex-col gap-1 md:sticky md:top-8 md:h-fit">
                <span className="font-mono text-sm text-accent">v{r.version}</span>
                <span className="text-sm text-subtle">{r.date}</span>
              </div>
              <div className="flex flex-col gap-5">
                <div className="relative aspect-[16/6] overflow-hidden rounded-2xl border border-border bg-surface">
                  <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 25% 50%, ${r.hue}, transparent 55%)` }} />
                  <span className="absolute bottom-4 left-5 font-display text-3xl font-semibold text-foreground">{r.title}</span>
                </div>
                <p className="text-muted">{r.summary}</p>
                <ul className="flex flex-col gap-2.5">
                  {items.map((i) => (
                    <li key={i.text} className="flex items-start gap-3 text-sm">
                      <Badge size="sm" variant={kindVariant[i.kind]} className="mt-0.5 w-16 justify-center capitalize">{i.kind}</Badge>
                      {i.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
