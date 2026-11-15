import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge, Breadcrumb } from "@kineticui/ui";
import { fullBlocks, getBlock } from "@/lib/registry";
import { blockCategories, registryUrl, site } from "@/lib/site";
import { BlockPreview } from "@/components/block-view";
import { blockComponentName } from "@/components/block-names";
import { Command, CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kineticui/ui";

export function generateStaticParams() {
  return fullBlocks.map((e) => ({ slug: e.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBlock(slug);
  return b ? { title: b.title, description: b.description } : {};
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const block = getBlock(slug);
  if (!block) notFound();
  const i = fullBlocks.findIndex((b) => b.name === slug);
  const prev = fullBlocks[i - 1];
  const next = fullBlocks[i + 1];
  const category = blockCategories.find((c) => c.id === block.categories[0]);
  const comp = blockComponentName(slug);
  const uses = block.registryDependencies.map((d) => d.replace("@kineticui/", ""));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Blocks", href: "/blocks" }, { label: category?.label ?? "Other", href: `/blocks#${category?.id ?? ""}` }, { label: block.title }]} />
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{block.title}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">{block.description}</p>
        {uses.length ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-subtle">
            Built with
            {uses.map((u) => (
              <Link key={u} href={`/components/${u}`}>
                <Badge variant="outline" size="sm" className="hover:border-accent">{u}</Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <BlockPreview slug={slug} code={block.files[0]?.content ?? ""} height={block.height} />

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Installation</h2>
        <Tabs defaultValue="cli">
          <TabsList>
            <TabsTrigger value="cli">Kinetic CLI</TabsTrigger>
            <TabsTrigger value="npm">npm package</TabsTrigger>
            <TabsTrigger value="shadcn">shadcn CLI</TabsTrigger>
          </TabsList>
          <TabsContent value="cli" className="flex flex-col gap-3">
            <p className="text-sm text-muted">Copies the block and every component it uses into your project.</p>
            <Command command={`npx @kineticui/cli add ${slug}`} />
          </TabsContent>
          <TabsContent value="npm" className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Import it as-is. Add <code className="font-mono text-foreground">@source &quot;../node_modules/@kineticui&quot;;</code> to your CSS so Tailwind sees its classes.
            </p>
            <Command command="npm i @kineticui/blocks @kineticui/ui @kineticui/core" />
            <CodeBlock code={`import { ${comp} } from "@kineticui/blocks";\n\nexport default function Page() {\n  return <${comp} />;\n}`} />
          </TabsContent>
          <TabsContent value="shadcn" className="flex flex-col gap-3">
            <p className="text-sm text-muted">Works with the shadcn CLI too.</p>
            <Command command={`npx shadcn@latest add ${registryUrl}/${slug}.json`} />
          </TabsContent>
        </Tabs>
        <p className="text-sm text-subtle">
          Source: <a href={`${site.github}/blob/main/${block.source}`} className="text-accent hover:underline">{block.source}</a>
        </p>
      </section>

      <nav aria-label="Pager" className="grid gap-4 sm:grid-cols-2">
        {prev ? (
          <Link href={`/blocks/${prev.name}`} className="flex flex-col gap-1 rounded-2xl border border-border p-4 transition-colors hover:border-border-strong">
            <span className="text-xs text-subtle">← Previous</span>
            <span className="font-medium">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/blocks/${next.name}`} className="flex flex-col gap-1 rounded-2xl border border-border p-4 text-right transition-colors hover:border-border-strong">
            <span className="text-xs text-subtle">Next →</span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
