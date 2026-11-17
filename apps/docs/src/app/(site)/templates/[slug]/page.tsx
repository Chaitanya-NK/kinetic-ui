import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert, Badge, Breadcrumb } from "@kineticui/ui";
import { BlockPreview } from "@/components/block-view";
import { Command } from "@/components/code-block";
import { blocks, entries } from "@/lib/site";
import { getTemplate, templateCategoryLabel, templates } from "@/lib/templates";

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  return t ? { title: `${t.title} template`, description: t.description } : {};
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();
  const kinds = new Map([...entries, ...blocks].map((e) => [e.name, e]));
  const replacesHome = t.files.some((f) => f.target === "app/page.tsx");
  const pages = t.files.filter((f) => f.type !== "registry:component");
  const ownFiles = t.files.filter((f) => f.type === "registry:component");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Templates", href: "/templates" }, { label: t.title }]} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h1>
          <Badge variant="outline">{templateCategoryLabel[t.category] ?? t.category}</Badge>
        </div>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">{t.description}</p>
      </div>

      <BlockPreview
        slug={t.name}
        src={`/template-preview/${t.name}`}
        height={820}
        files={t.files.map((f) => ({ name: f.type === "registry:component" ? `components/kinetic/${f.target}` : f.target, code: f.content }))}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Install</h2>
          <Command command={`npx @kineticui/cli add ${t.name}${replacesHome ? " --overwrite" : ""}`} />
          {replacesHome ? (
            <p className="text-sm text-muted">
              This replaces <code className="font-mono text-foreground">app/page.tsx</code>, so start from a fresh app or drop <code className="font-mono">--overwrite</code> to keep your existing files.
            </p>
          ) : null}
          {t.notes ? <Alert tone="info" title="After installing">{t.notes}</Alert> : null}
          <p className="text-sm text-muted">
            New to Kinetic? Run <code className="font-mono text-foreground">npx @kineticui/cli init</code> first to add the theme to your global CSS. See{" "}
            <Link href="/docs#installation" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">installation</Link>.
          </p>

          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">What you get</h2>
          <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {pages.map((f) => (
              <li key={f.target} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-foreground">{f.target}</span>
                <span className="ml-auto text-xs text-subtle">{f.type === "registry:file" ? "route" : f.target.endsWith("layout.tsx") ? "layout" : "page"}</span>
              </li>
            ))}
            {ownFiles.map((f) => (
              <li key={f.target} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="font-mono text-foreground">components/kinetic/{f.target}</span>
                <span className="ml-auto text-xs text-subtle">template component</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">Built from</h2>
          <div className="flex flex-wrap gap-2">
            {t.uses.map((u) => {
              const e = kinds.get(u);
              const href = e ? `/${e.type === "registry:block" ? "blocks" : "components"}/${u}` : undefined;
              return href ? (
                <Link key={u} href={href} className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-foreground">
                  {u}
                </Link>
              ) : (
                <span key={u} className="rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-subtle">{u}</span>
              );
            })}
          </div>
          {t.dependencies.length ? (
            <>
              <h3 className="mt-2 text-sm font-medium">Extra npm packages</h3>
              <p className="font-mono text-xs text-muted">{t.dependencies.join(", ")}</p>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
