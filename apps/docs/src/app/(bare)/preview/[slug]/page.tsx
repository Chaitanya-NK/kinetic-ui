import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fullBlocks, getBlock } from "@/lib/registry";
import { BlockRenderer } from "@/components/block-renderer";

export function generateStaticParams() {
  return fullBlocks.map((e) => ({ slug: e.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = getBlock(slug);
  return b ? { title: `${b.title} preview`, robots: { index: false } } : {};
}

/** Bare page rendered inside the block preview iframe (and openable full-screen). */
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getBlock(slug)) notFound();
  return (
    <main id="main" className="min-h-screen">
      <BlockRenderer slug={slug} />
    </main>
  );
}
