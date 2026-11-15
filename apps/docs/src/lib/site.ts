import index from "@/generated/index.json";

export const site = {
  name: "Kinetic UI",
  description:
    "Motion-first React components for Next.js and Tailwind CSS v4. Install from npm or copy the code with one command.",
  github: "https://github.com/Chaitanya-NK/kinetic-ui",
  npmScope: "@kineticui",
  /** Public URL of the deployed docs site. Set NEXT_PUBLIC_SITE_URL on Vercel. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kinetic-ui.vercel.app",
};

export const registryUrl = `${site.url}/r`;

export type IndexEntry = { name: string; type: "registry:ui" | "registry:block"; title: string; description: string; categories: string[]; height?: number };

const all = index as IndexEntry[];
/** Light list of every component — safe to use in client components. */
export const entries = all.filter((e) => e.type !== "registry:block");
/** Blocks: full sections and screens. */
export const blocks = all.filter((e) => e.type === "registry:block");

export const blockCategories: { id: string; label: string; description: string }[] = [
  { id: "app", label: "Application", description: "Auth, onboarding, settings, dashboards and full app shells." },
  { id: "marketing", label: "Marketing sections", description: "Heroes, features, pricing, testimonials, FAQ and footers." },
  { id: "screens", label: "Screens", description: "Error pages, inbox, file manager, commerce and account flows." },
  { id: "widgets", label: "Widgets", description: "Small mixed-component cards you can drop anywhere." },
];

export function blocksByCategory() {
  return blockCategories.map((c) => ({ ...c, items: blocks.filter((b) => b.categories[0] === c.id) })).filter((c) => c.items.length);
}

export const categories: { id: string; label: string }[] = [
  { id: "foundations", label: "Foundations" },
  { id: "forms", label: "Forms" },
  { id: "navigation", label: "Navigation" },
  { id: "data", label: "Data display" },
  { id: "ai", label: "AI" },
  { id: "collaboration", label: "Collaboration" },
  { id: "social", label: "Feedback & social" },
  { id: "media", label: "Media" },
  { id: "mobile", label: "Mobile" },
  { id: "contact", label: "Contact" },
  { id: "feedback", label: "Feedback" },
  { id: "overlay", label: "Overlay" },
  { id: "signature", label: "Signature" },
  { id: "effects", label: "Effects" },
];

export function byCategory() {
  return categories
    .map((c) => ({ ...c, items: entries.filter((e) => e.categories[0] === c.id) }))
    .filter((c) => c.items.length);
}
