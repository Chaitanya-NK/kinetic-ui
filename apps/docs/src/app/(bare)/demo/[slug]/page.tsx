import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fullEntries, getEntry } from "@/lib/registry";
import { DemoStage } from "@/components/demo-stage";

export function generateStaticParams() {
  return fullEntries.map((e) => ({ slug: e.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEntry(slug);
  return e ? { title: `${e.title} demo`, robots: { index: false } } : {};
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getEntry(slug)) notFound();
  return (
    <main id="main">
      <DemoStage slug={slug} />
    </main>
  );
}
