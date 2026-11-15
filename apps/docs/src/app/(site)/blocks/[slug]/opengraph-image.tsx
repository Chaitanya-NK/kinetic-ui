import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { blocks } from "@/lib/site";

export const alt = "Kinetic UI";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return blocks.map((e) => ({ slug: e.name }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = blocks.find((x) => x.name === slug);
  if (!e) return ogImage({ kicker: "Kinetic UI", title: "Components that move.", accentWord: "move" });
  return ogImage({ kicker: `Block · ${e.categories[0]}`, title: e.title, description: e.description });
}
