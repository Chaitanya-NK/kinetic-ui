import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/templates";
import { TemplatePreview } from "@/templates/previews";

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  return t ? { title: `${t.title} preview`, robots: { index: false } } : {};
}

/** Full-page live preview of a starter template, shown in an iframe on its docs page. */
export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getTemplate(slug)) notFound();
  return <TemplatePreview slug={slug} />;
}
