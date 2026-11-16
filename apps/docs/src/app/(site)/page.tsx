import { templates } from "@/lib/templates";
import { iconNames } from "@kineticui/icons";
import { HomeShowcase } from "@/components/home-showcase";
import { Hero } from "@/components/home/hero";
import { BlocksMarquee, CategoryTiles, FinalCta, IconsStrip, StatsBand, TemplatesShowcase, ThemesShowcase, TwoWays, type BlockCard, type CategoryTile } from "@/components/home/sections";
import { blocks, byCategory, entries } from "@/lib/site";
import { thumb } from "@/lib/thumbs";

const featuredIcons = [
  "sparkle", "bolt", "rocket", "palette", "layers", "code", "terminal", "command",
  "search", "bell", "heart", "star", "calendar", "camera", "music", "map-pin",
  "globe", "lock", "fingerprint", "shield-check", "cloud", "sun", "moon", "flame",
  "leaf", "wand", "brain", "atom", "trophy", "gem", "crown", "gift",
  "cart", "wallet", "chart", "pie-chart", "kanban", "git-branch", "database", "cpu",
  "bot", "mic", "headphones", "video", "image", "send", "chat", "mail",
];

// Lead each marquee row with the most visual blocks.
const featuredBlocks = [
  "dashboard-shell", "pricing-table", "ai-workspace", "analytics-funnel", "features-bento", "project-board", "billing-page", "hero-terminal", "contact-page", "status-page",
  "product-listing", "email-builder", "blog-index", "weather-widget", "music-player", "team-roles", "checkout-page", "order-tracking", "github-graph", "inbox-screen",
];

export default function Home() {
  const counts = { components: entries.length, blocks: blocks.length, icons: iconNames.length, themes: 6, templates: templates.length };

  const cards: BlockCard[] = [...featuredBlocks, ...blocks.map((b) => b.name).filter((n) => !featuredBlocks.includes(n))]
    .map((n) => blocks.find((b) => b.name === n))
    .filter((b): b is (typeof blocks)[number] => !!b)
    .map((b) => ({ name: b.name, title: b.title, src: thumb("b", b.name)! }))
    .filter((b) => b.src)
    .slice(0, 24);
  const rows: [BlockCard[], BlockCard[]] = [cards.filter((_, i) => i % 2 === 0), cards.filter((_, i) => i % 2 === 1)];

  const tiles: CategoryTile[] = byCategory().map((c) => ({
    id: c.id,
    label: c.label,
    count: c.items.length,
    href: `/components#${c.id}`,
    names: c.items.map((i) => i.title),
    thumbs: c.items.map((i) => thumb("c", i.name)).filter((s): s is string => !!s),
  }));

  return (
    <>
      <Hero counts={counts} />
      <StatsBand counts={counts} />
      <HomeShowcase />
      <BlocksMarquee rows={rows} total={counts.blocks} />
      <TemplatesShowcase
        items={templates.map((t) => ({ name: t.name, title: t.title, description: t.description, src: thumb("t", t.name), pages: t.files.filter((f) => f.type === "registry:page").length }))}
      />
      <ThemesShowcase />
      <TwoWays />
      <IconsStrip names={featuredIcons} total={counts.icons} />
      <CategoryTiles tiles={tiles} />
      <FinalCta components={counts.components} />
    </>
  );
}
