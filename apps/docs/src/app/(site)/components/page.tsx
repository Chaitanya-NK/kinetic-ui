import Link from "next/link";
import type { Metadata } from "next";
import { byCategory, entries } from "@/lib/site";
import { ComponentsSidebar } from "@/components/components-sidebar";

export const metadata: Metadata = { title: "Components" };

export default function ComponentsIndex() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <div className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-xs tracking-widest text-accent">{entries.length} COMPONENTS</span>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Components</h1>
          <p className="max-w-2xl text-lg text-muted">
            Every component ships two ways: as part of the npm packages, and as source you copy with the CLI. Same code, your choice.
          </p>
        </header>
        {byCategory().map((cat) => (
          <section key={cat.id} className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{cat.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cat.items.map((e) => (
                <Link
                  key={e.name}
                  href={`/components/${e.name}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent"
                >
                  <span className="flex items-center justify-between font-medium">
                    {e.title}
                    <span className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{e.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
