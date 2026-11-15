import Link from "next/link";
import propsData from "@/generated/props.json";
import { a11y } from "@/lib/a11y";
import { thumb } from "@/lib/thumbs";

type Prop = { name: string; type: string; required: boolean; default: string | null; description: string };
type Comp = { name: string; props: Prop[]; extends: string[] };
const allProps = propsData as Record<string, Comp[]>;

const nativeLabel = (ext: string[]) => {
  const n = ext.find((e) => /HTMLAttributes/.test(e));
  if (!n) return null;
  const el = n.replace(/HTMLAttributes$/, "").toLowerCase();
  return el ? `<${el}>` : "element";
};

export function ApiReference({ slug }: { slug: string }) {
  const comps = (allProps[slug] ?? []).filter((c) => c.props.length || c.extends.length);
  if (!comps.length) return null;
  return (
    <section id="api" className="flex scroll-mt-24 flex-col gap-6">
      <h2 className="font-display text-2xl font-semibold tracking-tight">API reference</h2>
      {comps.map((c) => {
        const native = nativeLabel(c.extends);
        return (
          <div key={c.name} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <code className="font-mono text-base font-semibold text-foreground">{`<${c.name} />`}</code>
              {native ? <span className="text-xs text-subtle">Also accepts every native {native} attribute.</span> : null}
            </div>
            {c.props.length ? (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="hidden grid-cols-[minmax(140px,0.9fr)_minmax(0,1.4fr)_minmax(90px,0.6fr)] gap-4 border-b border-border bg-surface px-4 py-2.5 text-xs font-medium text-subtle md:grid">
                  <span>Prop</span>
                  <span>Type</span>
                  <span>Default</span>
                </div>
                <div className="divide-y divide-border">
                  {c.props.map((p) => (
                    <div key={p.name} className="grid gap-1.5 px-4 py-3 text-sm md:grid-cols-[minmax(140px,0.9fr)_minmax(0,1.4fr)_minmax(90px,0.6fr)] md:gap-4">
                      <div className="flex items-start gap-1.5">
                        <code className="font-mono text-[13px] text-accent">{p.name}</code>
                        {p.required ? <span className="rounded bg-warning-soft px-1 font-mono text-[10px] text-warning">required</span> : null}
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <code className="break-words font-mono text-[12px] leading-5 text-muted">{p.type}</code>
                        {p.description ? <span className="text-[13px] leading-relaxed text-subtle">{p.description}</span> : null}
                      </div>
                      <div className="font-mono text-[12px] text-muted">
                        <span className="mr-1 text-subtle md:hidden">Default:</span>
                        {p.default ?? <span className="text-subtle">—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

export function Accessibility({ slug }: { slug: string }) {
  const n = a11y[slug];
  if (!n) return null;
  return (
    <section id="accessibility" className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="font-display text-2xl font-semibold tracking-tight">Keyboard &amp; accessibility</h2>
      {n.primitive ? (
        <p className="text-sm text-muted">
          Built on <span className="font-medium text-foreground">{n.primitive}</span>, so focus management and ARIA roles follow the WAI-ARIA pattern for this widget.
        </p>
      ) : null}
      {n.keys?.length ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          {n.keys.map(([k, d]) => (
            <div key={k} className="flex items-center gap-4 border-b border-border px-4 py-2.5 text-sm last:border-0">
              <span className="flex min-w-40 flex-wrap gap-1">
                {k.split(" / ").map((part) => <kbd key={part} className="rounded-md border border-border-strong bg-surface px-1.5 py-0.5 font-mono text-[11px]">{part}</kbd>)}
              </span>
              <span className="text-muted">{d}</span>
            </div>
          ))}
        </div>
      ) : null}
      {n.note ? <p className="text-sm text-subtle">{n.note}</p> : null}
      <p className="text-sm text-subtle">Animations respect <code className="font-mono text-muted">prefers-reduced-motion</code>.</p>
    </section>
  );
}

export function Related({ items }: { items: { name: string; title: string; description: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl font-semibold tracking-tight">Related</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((r) => {
          const src = thumb("c", r.name);
          return (
            <Link key={r.name} href={`/components/${r.name}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent">
              <div className="aspect-[16/10] overflow-hidden bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
              </div>
              <span className="px-3 py-2 text-sm font-medium">{r.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
