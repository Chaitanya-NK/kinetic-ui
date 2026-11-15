import manifest from "./thumbs.json";

const c = new Set(manifest.components);
const b = new Set(manifest.blocks);

/** Static thumbnail for a component (`c`) or block (`b`), or null if none has been generated yet (see scripts/gen-thumbs.mjs). */
export function thumb(kind: "c" | "b", slug: string): string | null {
  return (kind === "c" ? c : b).has(slug) ? `/thumbs/${kind}/${slug}.webp` : null;
}
