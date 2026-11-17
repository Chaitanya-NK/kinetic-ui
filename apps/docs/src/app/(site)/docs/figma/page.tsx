import type { Metadata } from "next";
import { Alert } from "@kineticui/ui";
import { ComponentsSidebar } from "@/components/components-sidebar";

export const metadata: Metadata = {
  title: "Figma kit",
  description: "A Figma plugin that builds the Kinetic UI kit in your file: colour variables with dark and light modes, text styles, every icon and the core components.",
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-3xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

const contents = [
  ["Variables", "Every colour token in a Kinetic UI collection with Dark and Light modes, plus radius and spacing. Same names and values as the CSS."],
  ["Styles", "13 text styles across Space Grotesk, Inter and JetBrains Mono, and the overlay shadow."],
  ["Icons", "All 348 icons from @kineticui/icons as components, ready to swap into any instance."],
  ["Components", "Button, Badge, Field, Checkbox, Radio, Switch, Select, Tabs, Segmented control, Avatar, Alert, Toast, Tooltip, Progress, Kbd, Card, Dialog and Dynamic Island, as variant sets."],
];

const steps = [
  ["Download the plugin", "Use the button above, then unzip it anywhere."],
  ["Open a new file", "In the Figma desktop app, create a new design file. The kit adds Cover, Foundations, Icons and Components pages."],
  ["Import it", "Menu → Plugins → Development → Import plugin from manifest…, then choose manifest.json from the unzipped folder."],
  ["Run it", "Menu → Plugins → Development → Kinetic UI Kit. It takes a few seconds."],
  ["Share it", "Publish the file as a library (Assets → Publish) so your team can use the components and variables in their own files."],
];

export default function FigmaPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <ComponentsSidebar />
      <article className="flex min-w-0 max-w-3xl flex-col gap-6 leading-relaxed text-muted">
        <span className="font-mono text-xs tracking-widest text-accent">GETTING STARTED</span>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-foreground">Figma kit</h1>
        <p className="text-lg">
          Design with the same tokens, type, icons and components you ship. The kit is a small Figma plugin that builds everything in your file,
          generated from the library&apos;s own source, so it never drifts from the code.
        </p>
        <a
          href="/kinetic-ui-figma-kit.zip"
          download
          className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform active:scale-95"
        >
          Download the Figma kit
        </a>

        <H2 id="contents">What you get</H2>
        <div className="grid gap-4 sm:grid-cols-2">
          {contents.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold text-foreground">{t}</p>
              <p className="mt-1 text-sm">{d}</p>
            </div>
          ))}
        </div>

        <H2 id="install">Set it up</H2>
        <ol className="flex flex-col gap-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent-soft-foreground">{i + 1}</span>
              <span>
                <span className="block font-semibold text-foreground">{t}</span>
                <span className="text-sm">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <Alert tone="info" title="Fonts">
          The kit uses Space Grotesk, Inter and JetBrains Mono, all free on Google Fonts. If one isn&apos;t available in Figma, the plugin falls back
          to a similar font and tells you which one to install.
        </Alert>

        <H2 id="themes">Light mode and themes</H2>
        <p>
          Every component is bound to the Kinetic UI variables. Select a frame, open the variable mode menu in the right panel and pick{" "}
          <b className="text-foreground">Light</b>: everything inside re-themes. To match a custom theme, edit the variable values; the names line up
          with the <code className="font-mono text-foreground">--kn-*</code> CSS variables, so a developer can copy them straight across.
        </p>

        <H2 id="source">Built from the source</H2>
        <p>
          The plugin lives in{" "}
          <a href="https://github.com/Chaitanya-NK/kinetic-ui/tree/main/figma" className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
            figma/
          </a>{" "}
          in the repository. It reads the tokens from the core stylesheet and the icons from the icon package when it&apos;s built, and CI fails if
          the published plugin falls behind either one.
        </p>
      </article>
    </div>
  );
}
