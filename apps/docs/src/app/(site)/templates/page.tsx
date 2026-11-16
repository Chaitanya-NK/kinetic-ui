import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@kineticui/ui";
import { Command } from "@/components/code-block";
import { templateCategoryLabel, templates } from "@/lib/templates";
import { thumb } from "@/lib/thumbs";

export const metadata: Metadata = {
  title: "Templates",
  description: "Starter templates built from Kinetic blocks: SaaS landing page, portfolio, dashboard, AI chatbot and docs site. One command to install.",
};

export default function TemplatesIndex() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <span className="font-mono text-xs tracking-widest text-accent">{templates.length} TEMPLATES</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Templates</h1>
        <p className="max-w-2xl text-lg text-muted">
          Whole pages and apps assembled from Kinetic blocks. One command copies the pages into your app router and every component they use into
          your project. Change the copy and ship.
        </p>
        <div className="max-w-xl">
          <Command command="npx @kineticui/cli add saas-landing --overwrite" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((t, i) => (
          <Link
            key={t.name}
            href={`/templates/${t.name}`}
            className={`group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <div className={`pointer-events-none relative overflow-hidden border-b border-border bg-background ${i === 0 ? "aspect-[16/7]" : "aspect-[16/10]"}`} aria-hidden>
              {thumb("t", t.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb("t", t.name)!} alt="" loading={i < 2 ? "eager" : "lazy"} className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
              ) : (
                <iframe src={`/template-preview/${t.name}`} title="" tabIndex={-1} loading="lazy" className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4]" />
              )}
            </div>
            <div className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-semibold tracking-tight">{t.title}</span>
                <Badge variant="outline" size="sm">{templateCategoryLabel[t.category] ?? t.category}</Badge>
                <span className="ml-auto text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent">→</span>
              </div>
              <p className="text-sm text-muted">{t.description}</p>
              <p className="font-mono text-xs text-subtle">
                {t.files.filter((f) => f.type === "registry:page").length} page{t.files.filter((f) => f.type === "registry:page").length > 1 ? "s" : ""} · {t.uses.length} blocks &amp; components
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
