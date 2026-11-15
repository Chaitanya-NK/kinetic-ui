import Link from "next/link";
import { cn } from "@kineticui/core";
import { byCategory } from "@/lib/site";

export function ComponentsSidebar({ active }: { active?: string }) {
  return (
    <aside className="hidden lg:block">
      <nav aria-label="Components" className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-6 overflow-y-auto pb-10 pr-2 text-sm [scrollbar-color:var(--kn-border-strong)_transparent] [scrollbar-width:thin]">
        <div className="flex flex-col gap-1">
          <span className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">Getting started</span>
          <Link href="/docs" className="rounded-lg px-3 py-1.5 text-muted hover:text-foreground">Introduction</Link>
          <Link href="/docs#installation" className="rounded-lg px-3 py-1.5 text-muted hover:text-foreground">Installation</Link>
          <Link href="/docs#theming" className="rounded-lg px-3 py-1.5 text-muted hover:text-foreground">Theming</Link>
        </div>
        {byCategory().map((cat) => (
          <div key={cat.id} className="flex flex-col gap-0.5">
            <span className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">{cat.label}</span>
            {cat.items.map((e) => (
              <Link
                key={e.name}
                href={`/components/${e.name}`}
                aria-current={active === e.name ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 transition-colors",
                  active === e.name ? "bg-accent-soft font-medium text-accent-soft-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {e.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
