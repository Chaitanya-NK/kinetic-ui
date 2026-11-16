import manifest from "./thumbs.json";

const c = new Set(manifest.components);
const b = new Set(manifest.blocks);
const t = new Set((manifest as { templates?: string[] }).templates ?? []);

/** Static thumbnail for a component (`c`), block (`b`) or template (`t`), or null if none has been generated yet (see scripts/gen-thumbs.mjs). */
export function thumb(kind: "c" | "b" | "t", slug: string): string | null {
  return (kind === "c" ? c : kind === "b" ? b : t).has(slug) ? `/thumbs/${kind}/${slug}.webp` : null;
}
