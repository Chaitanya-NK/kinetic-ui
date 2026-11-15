import type { Metadata } from "next";
import { byCategory, entries } from "@/lib/site";
import { thumb } from "@/lib/thumbs";
import { ComponentsSidebar } from "@/components/components-sidebar";
import { ComponentsBrowser, type BrowserCategory, type BrowserItem } from "@/components/components-browser";

export const metadata: Metadata = { title: "Components", description: `${entries.length} motion-first React components with live previews.` };

export default function ComponentsIndex() {
  const groups = byCategory();
  const categories: BrowserCategory[] = groups.map((g) => ({ id: g.id, label: g.label, count: g.items.length }));
  const items: BrowserItem[] = groups.flatMap((g) =>
    g.items.map((e) => ({ name: e.name, title: e.title, description: e.description, category: g.id, thumb: thumb("c", e.name) })),
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <div className="flex min-w-0 flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-widest text-accent">{entries.length} COMPONENTS</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Components</h1>
          <p className="max-w-2xl text-lg text-muted">
            Hover any card to try it live. Every component ships two ways: in the npm packages, and as source you copy with the CLI.
          </p>
        </header>
        <ComponentsBrowser items={items} categories={categories} />
      </div>
    </div>
  );
}
