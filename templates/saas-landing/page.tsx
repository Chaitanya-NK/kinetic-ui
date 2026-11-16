"use client";

import { FaqSection, FeaturesBento, FooterBigCta, HeroGradientMesh, LogoCloud, PricingTable, TestimonialsWall } from "@kineticui/blocks";
import { BrowserMockup, GradientText, ScrollShowcase } from "@kineticui/motion";
import { Badge, Button, Navbar, Sparkline } from "@kineticui/ui";

const nav = [
  { label: "Product", href: "#features" },
  { label: "Customers", href: "#customers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Home() {
  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      <Navbar
        logo={<span className="font-display text-lg font-semibold tracking-tight">Aurora</span>}
        items={nav}
        actions={<Button size="sm" className="rounded-full">Start free</Button>}
      />

      <HeroGradientMesh
        eyebrow="Introducing Aurora 2.0"
        title="Design at the speed of thought"
        description="Generate on-brand layouts from a sentence, then fine-tune every pixel together in real time."
      />

      <LogoCloud />

      <section id="features" className="scroll-mt-24">
        <FeaturesBento />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <ScrollShowcase
          title={
            <div className="flex flex-col items-center gap-3">
              <Badge variant="outline">Live workspace</Badge>
              <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Every number your team cares about, <GradientText>one screen away</GradientText>
              </h2>
            </div>
          }
        >
          <BrowserMockup url="app.aurora.dev/overview" className="rounded-none border-0 shadow-none">
            <ProductShot />
          </BrowserMockup>
        </ScrollShowcase>
      </section>

      <section id="customers" className="scroll-mt-24">
        <TestimonialsWall title="Teams ship faster with Aurora" />
      </section>

      <section id="pricing" className="scroll-mt-24 py-12">
        <PricingTable />
      </section>

      <section id="faq" className="scroll-mt-24 py-12">
        <FaqSection />
      </section>

      <FooterBigCta brand="Aurora" email="hello@aurora.dev" />
    </main>
  );
}

/** A lightweight dashboard picture for the showcase. Replace with a real screenshot. */
function ProductShot() {
  const stats = [
    { label: "Active projects", value: "128", trend: [4, 6, 5, 8, 9, 12, 14] },
    { label: "Designs shipped", value: "2,904", trend: [10, 12, 9, 14, 18, 17, 22] },
    { label: "Avg. review time", value: "3.2h", trend: [9, 8, 8, 6, 5, 5, 4] },
  ];
  return (
    <div className="grid aspect-[16/9] grid-cols-[160px_1fr] text-sm">
      <aside className="flex flex-col gap-1 border-r border-border bg-surface p-4">
        <span className="mb-3 font-display font-semibold">Aurora</span>
        {["Overview", "Projects", "Library", "Reviews", "Settings"].map((t, i) => (
          <span key={t} className={i === 0 ? "rounded-lg bg-accent px-2.5 py-1.5 text-accent-foreground" : "px-2.5 py-1.5 text-muted"}>{t}</span>
        ))}
      </aside>
      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3">
              <span className="text-xs text-subtle">{s.label}</span>
              <span className="font-display text-xl font-semibold">{s.value}</span>
              <Sparkline data={s.trend} height={28} />
            </div>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-2 rounded-xl border border-border bg-surface p-4">
          {[42, 58, 46, 70, 64, 82, 76, 90, 72, 96, 88, 100].map((h, i) => (
            <span key={i} className="flex-1 rounded-md bg-accent" style={{ height: `${h}%`, opacity: 0.3 + i * 0.06 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
