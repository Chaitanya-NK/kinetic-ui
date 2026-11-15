import Link from "next/link";
import type { Metadata } from "next";
import { blocks, blocksByCategory } from "@/lib/site";
import { thumb } from "@/lib/thumbs";

export const metadata: Metadata = { title: "Blocks" };

export default function BlocksIndex() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-accent">{blocks.length} BLOCKS</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Blocks</h1>
        <p className="max-w-2xl text-lg text-muted">
          Full sections and screens assembled from Kinetic components. Copy one into your app and change the copy, or import it from <code className="font-mono text-foreground">@kineticui/blocks</code>.
        </p>
      </header>
      {blocksByCategory().map((cat) => (
        <section key={cat.id} id={cat.id} className="flex scroll-mt-24 flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{cat.label}</h2>
            <p className="text-sm text-muted">{cat.description}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cat.items.map((b) => (
              <Link key={b.name} href={`/blocks/${b.name}`} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent">
                <div className="pointer-events-none relative aspect-[16/10] overflow-hidden border-b border-border bg-background" aria-hidden>
                  {thumb("b", b.name) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb("b", b.name)!} alt="" loading="lazy" className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
                  ) : (
                    <iframe src={`/preview/${b.name}`} title="" tabIndex={-1} loading="lazy" className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4]" />
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <span className="flex items-center justify-between font-medium">
                    {b.title}
                    <span className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</span>
                  </span>
                  <span className="text-sm text-muted">{b.description}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
