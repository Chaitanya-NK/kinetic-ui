import Link from "next/link";
import { Button } from "@kineticui/ui";
import { Command } from "@/components/code-block";
import { HomeShowcase } from "@/components/home-showcase";
import { HeroMotion } from "@/components/hero-motion";
import { byCategory, entries } from "@/lib/site";

export default function Home() {
  return (
    <>
      <HeroMotion>
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 pb-20 pt-24 text-center sm:pt-32">
          <Link
            href="/components/dock"
            className="flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 py-1 pl-1 pr-3 text-sm text-muted backdrop-blur transition-colors hover:text-foreground"
          >
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">NEW</span>
            The Dock is here →
          </Link>
          <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-7xl">
            Components
            <br />
            that move.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {entries.length} motion-first React components for Next.js and Tailwind v4. Install from npm, or copy the source with one
            command — same code either way.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/components">Browse components</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Get started</Link>
            </Button>
          </div>
          <div className="w-full max-w-md">
            <Command command="npx @kineticui/cli add dock" />
          </div>
        </div>
      </HeroMotion>

      <HomeShowcase />

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <span className="font-mono text-xs tracking-widest text-accent">EVERYTHING INCLUDED</span>
          <h2 className="font-display text-4xl font-semibold tracking-tight">Pick a category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {byCategory().map((c) => (
            <Link
              key={c.id}
              href={`/components/${c.items[0]!.name}`}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
            >
              <span className="flex items-baseline justify-between">
                <span className="font-display text-xl font-semibold">{c.label}</span>
                <span className="font-mono text-xs text-subtle">{c.items.length}</span>
              </span>
              <span className="text-sm leading-relaxed text-muted">{c.items.map((i) => i.title).join(" · ")}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
