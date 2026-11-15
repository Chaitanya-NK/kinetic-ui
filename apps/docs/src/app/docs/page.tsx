import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@kineticui/ui";
import { CodeBlock, Command } from "@/components/code-block";
import { ComponentsSidebar } from "@/components/components-sidebar";

export const metadata: Metadata = { title: "Getting started" };

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-3xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <article className="flex max-w-3xl flex-col gap-6 leading-relaxed text-muted">
        <span className="font-mono text-xs tracking-widest text-accent">GETTING STARTED</span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">Introduction</h1>
        <p className="text-lg">
          Kinetic UI is a set of motion-first, accessible React components for Next.js and Tailwind CSS v4. Every component ships
          <strong className="text-foreground"> two ways from the same source</strong>:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="font-semibold text-foreground">npm packages</p>
            <p className="mt-1 text-sm">Install once, import anywhere, get fixes with <code className="font-mono">npm update</code>.</p>
          </div>
          <div className="rounded-2xl border border-accent bg-accent-soft/40 p-5">
            <p className="font-semibold text-foreground">Copy with the CLI</p>
            <p className="mt-1 text-sm">The source lands in your repo. Edit every line — it’s yours.</p>
          </div>
        </div>

        <H2 id="installation">Installation</H2>
        <p>Start with a Next.js app that uses Tailwind CSS v4 (<code className="font-mono text-foreground">npx create-next-app@latest</code> sets this up).</p>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">Option A — Kinetic CLI (copy the code)</h3>
        <Command command="npx @kineticui/cli init" />
        <p>This adds the design tokens to your global CSS and creates <code className="font-mono text-foreground">kinetic.json</code>. Then add components:</p>
        <Command command="npx @kineticui/cli add button dialog dock" />
        <p>Files are written to <code className="font-mono text-foreground">components/kinetic/</code> and any npm dependencies are installed for you.</p>

        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">Option B — npm packages</h3>
        <Command command="npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons" />
        <p>Add the tokens and tell Tailwind to scan the packages, in your global CSS:</p>
        <CodeBlock
          code={`@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";`}
        />
        <p>Then import and use:</p>
        <CodeBlock
          code={`import { Button } from "@kineticui/ui";
import { SpotlightCard } from "@kineticui/motion";
import { BoltIcon } from "@kineticui/icons";

export default function Page() {
  return (
    <SpotlightCard>
      <BoltIcon />
      <Button>Get started</Button>
    </SpotlightCard>
  );
}`}
        />
        <Alert tone="info" title="Using shadcn/ui already?">
          The registry is shadcn-compatible: <code className="font-mono">npx shadcn add https://your-site/r/dock.json</code>.
        </Alert>

        <H2 id="theming">Theming</H2>
        <p>
          Dark is the default. Wrap your app in <code className="font-mono text-foreground">ThemeProvider</code> to switch modes and brand colours at
          runtime — every component reads from the same CSS variables.
        </p>
        <CodeBlock
          code={`// app/providers.tsx
"use client";
import { ThemeProvider } from "@kineticui/core/theme";
import { Toaster } from "@kineticui/ui";

export function Providers({ children }) {
  return (
    <ThemeProvider defaultMode="dark" defaultAccent="lime">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}`}
        />
        <p>Or override any token directly in CSS:</p>
        <CodeBlock
          code={`:root {
  --kn-accent: #ff5a1f;
  --kn-accent-foreground: #ffffff;
}`}
        />
        <p>
          Presets: <code className="font-mono text-foreground">lime</code>, <code className="font-mono text-foreground">blue</code>,{" "}
          <code className="font-mono text-foreground">orange</code>, <code className="font-mono text-foreground">rose</code>,{" "}
          <code className="font-mono text-foreground">mint</code> — try them from the colour dot in the header.
        </p>

        <H2 id="motion">Motion &amp; accessibility</H2>
        <p>
          Animations use spring physics and respect <code className="font-mono text-foreground">prefers-reduced-motion</code>. Interactive pieces are built on
          Radix primitives, so keyboard navigation, focus management and ARIA come for free.
        </p>
        <p>
          Next: <Link href="/components" className="text-accent hover:underline">browse all components →</Link>
        </p>
      </article>
    </div>
  );
}
