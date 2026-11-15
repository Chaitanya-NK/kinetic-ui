"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { createTheme, themePresets, type ThemePreset, type ThemeSeed } from "@kineticui/core";
import { Button } from "@kineticui/ui";
import { BorderBeam, Marquee, NumberTicker } from "@kineticui/motion";
import { ArrowRightIcon, CheckIcon, Icon, type IconName } from "@kineticui/icons";
import { ThemePreview } from "@/components/theme-editor";
import { CopyButton } from "@/components/code-block";

export function Kicker({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs tracking-widest text-accent">{children}</span>;
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay, type: "spring", stiffness: 140, damping: 22 }} className={className}>
      {children}
    </motion.div>
  );
}

export function StatsBand({ counts }: { counts: { components: number; blocks: number; icons: number; themes: number } }) {
  const items = [
    [counts.components, "components", "Forms, editors, data, AI, media and more"],
    [counts.blocks, "blocks", "Dashboards, pricing, blogs and full app screens"],
    [counts.icons, "icons", "Original 24 px strokes on one grid"],
    [counts.themes, "themes", "Plus a live editor that exports CSS"],
  ] as const;
  const stack = ["React 19", "Next.js 16", "Tailwind CSS v4", "Radix", "Motion", "TypeScript"];
  return (
    <section className="border-b border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {items.map(([n, label, hint]) => (
          <div key={label} className="flex flex-col gap-1 bg-background px-6 py-8 sm:px-8">
            <span className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"><NumberTicker value={n} /></span>
            <span className="font-medium">{label}</span>
            <span className="text-sm text-subtle">{hint}</span>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-5 font-mono text-xs text-subtle">
        <span className="text-muted">Built with</span>
        {stack.map((s) => <span key={s}>{s}</span>)}
      </div>
    </section>
  );
}

export type BlockCard = { name: string; title: string; src: string };

export function BlocksMarquee({ rows, total }: { rows: [BlockCard[], BlockCard[]]; total: number }) {
  return (
    <section className="mt-28 flex flex-col gap-10">
      <Reveal className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Kicker>{total} BLOCKS</Kicker>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Whole screens, not just buttons.</h2>
          <p className="max-w-xl text-muted">Dashboards, billing, pricing, blogs, checkout, status pages. Drop one in, change the copy, ship it.</p>
        </div>
        <Button asChild variant="outline"><Link href="/blocks">Browse all blocks <ArrowRightIcon size={15} /></Link></Button>
      </Reveal>
      <div className="flex flex-col gap-5">
        {rows.map((row, i) => (
          <Marquee key={i} reverse={i === 1} duration={i ? 70 : 60} pauseOnHover gap="1.25rem">
            {row.map((b) => (
              <Link key={b.name} href={`/blocks/${b.name}`} className="group flex w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-accent sm:w-[420px]">
                <div className="aspect-[16/10] overflow-hidden bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.src} alt="" loading="lazy" className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
                <span className="flex items-center justify-between px-4 py-3 text-sm font-medium">
                  {b.title}
                  <ArrowRightIcon size={14} className="text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </span>
              </Link>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}

const presetOrder: ThemePreset[] = ["midnight", "sunset", "paper", "forest", "ocean", "mono"];
const kineticDark: ThemeSeed = { mode: "dark", background: "#0a0a0b", foreground: "#f4f4f5", accent: "#c6f432" };

export function ThemesShowcase() {
  const [id, setId] = React.useState<ThemePreset | "kinetic">("midnight");
  const [auto, setAuto] = React.useState(true);
  React.useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setId((cur) => presetOrder[(presetOrder.indexOf(cur as ThemePreset) + 1) % presetOrder.length]!), 2800);
    return () => clearInterval(t);
  }, [auto]);
  const seed = id === "kinetic" ? kineticDark : themePresets[id].seed;
  const tokens = React.useMemo(() => createTheme(seed), [seed]);
  const pick = (p: ThemePreset | "kinetic") => { setAuto(false); setId(p); };

  return (
    <section className="mx-auto mt-28 grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Reveal className="flex flex-col gap-5">
        <Kicker>THEMING</Kicker>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Six themes. One editor. <span className="text-accent">Zero config.</span></h2>
        <p className="text-muted">Every component reads the same CSS variables, so one attribute restyles everything. Start from a preset or three colours; the editor derives the rest, checks contrast and exports CSS.</p>
        <div className="flex flex-wrap gap-2">
          {(["kinetic", ...presetOrder] as const).map((p) => {
            const s = p === "kinetic" ? kineticDark : themePresets[p].seed;
            const active = id === p;
            return (
              <button key={p} type="button" aria-pressed={active} onClick={() => pick(p)} className={`flex h-9 items-center gap-2 rounded-full border px-3 text-sm capitalize transition-colors ${active ? "border-accent bg-accent-soft/40 text-foreground" : "border-border text-muted hover:border-border-strong hover:text-foreground"}`}>
                <span className="flex size-4 overflow-hidden rounded-full ring-1 ring-border-strong" style={{ background: s.background }}>
                  <span className="mt-auto h-1/2 w-full" style={{ background: s.accent }} />
                </span>
                {p === "kinetic" ? "Kinetic" : themePresets[p].label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[#0D0D10] py-2 pl-4 pr-2 font-mono text-[13px] text-[#D4D4D8]">
            <span className="truncate"><span className="text-[#8A8A93]">&lt;html </span>data-theme=&quot;<span className="text-accent">{id === "kinetic" ? "default" : id}</span>&quot;<span className="text-[#8A8A93]">&gt;</span></span>
            <CopyButton text={`data-theme="${id === "kinetic" ? "default" : id}"`} />
          </div>
          <Link href="/themes" className="flex w-fit items-center gap-1 text-sm text-accent hover:underline">Open the theme editor <ArrowRightIcon size={14} /></Link>
        </div>
      </Reveal>
      <Reveal delay={0.1} className="relative">
        <div className="absolute -inset-2 rounded-[40px] sm:-inset-6 opacity-60 blur-3xl transition-colors duration-700" style={{ background: tokens.accent, opacity: 0.12 }} />
        <div className="relative">
          <ThemePreview tokens={tokens} mode={seed.mode} />
        </div>
      </Reveal>
    </section>
  );
}

export function IconsStrip({ names, total }: { names: string[]; total: number }) {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <div className="grid items-center gap-10 rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="flex flex-col gap-4">
          <Kicker>{total} ICONS</Kicker>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Icons drawn for this library.</h2>
          <p className="text-muted">Original 24 px strokes on one grid, so they sit together. Tree-shakable React components with size and stroke props.</p>
          <Button asChild variant="outline" className="w-fit"><Link href="/icons">Browse icons <ArrowRightIcon size={15} /></Link></Button>
        </Reveal>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {names.map((n, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.03 + Math.floor(i / 8) * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.15, rotate: -6 }}
              title={n}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Icon name={n as IconName} size={22} strokeWidth={1.75} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TwoWays() {
  const ways = [
    {
      id: "npm",
      title: "Install the packages",
      tag: "npm",
      body: "Import and go. Updates arrive with npm update, and everything is typed.",
      code: `npm i @kineticui/ui @kineticui/core\n\nimport { Button, toast } from "@kineticui/ui";`,
      points: ["Versioned updates", "Tree-shakable", "Zero setup beyond one CSS import"],
    },
    {
      id: "cli",
      title: "Copy the source",
      tag: "CLI",
      body: "shadcn-style: the file lands in your repo and its dependencies install with it. Change anything.",
      code: `npx @kineticui/cli add pricing-table\n\n✓ components/kinetic/pricing-table.tsx\n✓ components/kinetic/button.tsx`,
      points: ["Own every line", "Works with the shadcn CLI too", "Pulls in what it depends on"],
    },
  ];
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <Reveal className="mb-10 flex flex-col gap-2 text-center">
        <Kicker>TWO WAYS, ONE SOURCE</Kicker>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Use it like a library, or own it like your code.</h2>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 [&>*]:min-w-0">
        {ways.map((w, i) => (
          <Reveal key={w.id} delay={i * 0.08} className="flex min-w-0 flex-col gap-5 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">{w.title}</h3>
              <span className="rounded-full border border-border-strong px-2.5 py-0.5 font-mono text-xs text-muted">{w.tag}</span>
            </div>
            <p className="text-muted">{w.body}</p>
            <div className="relative min-w-0 rounded-2xl border border-border bg-[#0D0D10] p-4 pr-12 font-mono text-[13px] leading-6 text-[#D4D4D8]">
              <pre className="overflow-x-auto whitespace-pre">{w.code}</pre>
              <div className="absolute right-2 top-2"><CopyButton text={w.code.split("\n")[0]!} /></div>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {w.points.map((p) => <li key={p} className="flex items-center gap-2"><CheckIcon size={14} className="text-accent" />{p}</li>)}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export type CategoryTile = { id: string; label: string; count: number; href: string; names: string[]; thumbs: string[] };

export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-4 sm:px-6">
      <Reveal className="mb-8 flex flex-col gap-2">
        <Kicker>EVERYTHING INCLUDED</Kicker>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Pick a category</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((c, i) => (
          <Reveal key={c.id} delay={(i % 4) * 0.05}>
            <Link href={c.href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-accent">
              <div className="relative h-36 overflow-hidden border-b border-border bg-background">
                {c.thumbs.slice(0, 3).map((src, k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute w-[62%] rounded-lg border border-border-strong shadow-overlay transition-transform duration-500 ease-out"
                    style={{ left: `${6 + k * 16}%`, top: `${14 + k * 10}%`, zIndex: k, transform: `rotate(${(k - 1) * 4}deg)` }}
                  />
                ))}
                <span className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <span className="flex items-baseline justify-between">
                  <span className="font-display text-lg font-semibold">{c.label}</span>
                  <span className="font-mono text-xs text-subtle">{c.count}</span>
                </span>
                <span className="line-clamp-2 text-sm text-muted">{c.names.join(" · ")}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FinalCta({ components }: { components: number }) {
  const lines = ["npx @kineticui/cli init", "npx @kineticui/cli add button dialog toast"];
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 4), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="mx-auto my-28 max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-6 py-16 text-center sm:px-12">
        <BorderBeam duration={8} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-accent/15 blur-[100px]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Build something that <span className="text-accent">moves.</span></h2>
          <p className="text-lg text-muted">{components} components, free and MIT licensed. Two commands to your first one.</p>
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#0D0D10] p-4 text-left font-mono text-[13px] leading-7 text-[#D4D4D8]">
            {lines.map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                <span className="text-[#8A8A93]">$</span>
                <span>{l}</span>
                <AnimatePresence>{step > i ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="text-success"><CheckIcon size={13} strokeWidth={3} /></motion.span> : null}</AnimatePresence>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link href="/docs">Get started <ArrowRightIcon size={16} /></Link></Button>
            <Button asChild size="lg" variant="outline"><a href="https://github.com/Chaitanya-NK/kinetic-ui" target="_blank" rel="noreferrer">Star on GitHub</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
