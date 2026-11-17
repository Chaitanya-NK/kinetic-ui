import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge, Breadcrumb, CodeBlock } from "@kineticui/ui";
import { usage } from "@/lib/usage";
import { fullEntries, getEntry } from "@/lib/registry";
import { categories, entries, registryUrl, site } from "@/lib/site";
import { InstallTabs, Preview } from "@/components/component-view";
import { ComponentsSidebar } from "@/components/components-sidebar";
import { Accessibility, ApiReference, Related } from "@/components/api-reference";

export function generateStaticParams() {
  return fullEntries.map((e) => ({ slug: e.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  return entry ? { title: entry.title, description: entry.description, openGraph: { title: `${entry.title} · Kinetic UI`, description: entry.description }, twitter: { title: `${entry.title} · Kinetic UI`, description: entry.description } } : {};
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const index = fullEntries.findIndex((e) => e.name === slug);
  const prev = fullEntries[index - 1];
  const next = fullEntries[index + 1];
  const category = categories.find((c) => c.id === entry.categories[0]);
  const code = entry.files[0]?.content ?? "";
  const related = entries.filter((e) => e.categories[0] === entry.categories[0] && e.name !== slug).slice(0, 4);

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar active={slug} />
      <article className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Breadcrumb items={[{ label: "Components", href: "/components" }, { label: category?.label ?? "Other", href: "/components" }, { label: entry.title }]} />
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{entry.title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">{entry.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" size="sm">{entry.package}</Badge>
            {entry.dependencies
              .filter((d) => !d.startsWith("@kineticui"))
              .map((d) => (
                <Badge key={d} size="sm">{d.replace(/@\^?[\d.]+$/, "")}</Badge>
              ))}
          </div>
        </div>

        <Preview slug={slug} code={code} />

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Installation</h2>
          <InstallTabs name={slug} pkg={entry.package} exports={entry.exports} registryUrl={registryUrl} />
          {entry.registryDependencies.length ? (
            <p className="text-sm text-subtle">
              Also installs:{" "}
              {entry.registryDependencies.map((d, i) => {
                const n = d.replace("@kineticui/", "");
                return (
                  <span key={d}>
                    {i ? ", " : ""}
                    <Link href={`/components/${n}`} className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{n}</Link>
                  </span>
                );
              })}
            </p>
          ) : null}
        </section>

        {usage[slug] ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Usage</h2>
            {usage[slug]!.map((u, i) => (
              <div key={i} className="flex flex-col gap-2">
                {u.title ? <h3 className="font-medium">{u.title}</h3> : null}
                {u.note ? <p className="text-sm text-muted">{u.note}</p> : null}
                <CodeBlock files={{ name: u.title?.match(/\(([^)]+)\)/)?.[1] ?? "example.tsx", code: u.code }} maxHeight={520} />
              </div>
            ))}
          </section>
        ) : null}

        <ApiReference slug={slug} />

        <Accessibility slug={slug} />

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Exports</h2>
          <div className="flex flex-wrap gap-2">
            {entry.exports.map((x) => (
              <code key={x} className="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-sm">{x}</code>
            ))}
          </div>
          <p className="text-sm text-subtle">
            Source:{" "}
            <a href={`${site.github}/blob/main/${entry.source}`} className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{entry.source}</a>
          </p>
        </section>

        <Related items={related} />

        <nav aria-label="Pager" className="mt-6 grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={`/components/${prev.name}`} className="flex flex-col gap-1 rounded-2xl border border-border p-4 transition-colors hover:border-border-strong">
              <span className="text-xs text-subtle">← Previous</span>
              <span className="font-medium">{prev.title}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/components/${next.name}`} className="flex flex-col gap-1 rounded-2xl border border-border p-4 text-right transition-colors hover:border-border-strong">
              <span className="text-xs text-subtle">Next →</span>
              <span className="font-medium">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </article>
    </div>
  );
}
