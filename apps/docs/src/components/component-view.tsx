"use client";

import * as React from "react";
import { motion } from "motion/react";
import { themePresets, type ThemePreset } from "@kineticui/core";
import { Select, Tabs, TabsContent, TabsList, TabsTrigger, Tooltip } from "@kineticui/ui";
import { DotBackground } from "@kineticui/motion";
import { ExternalLinkIcon, MonitorIcon, MoonIcon, RotateCcwIcon, SmartphoneIcon, SunIcon, TabletIcon } from "@kineticui/icons";
import { demos } from "@/demos";
import { CodeBlock, Command } from "./code-block";

const widths = [
  { id: "full", label: "Full width", icon: MonitorIcon, px: null },
  { id: "tablet", label: "Tablet (768px)", icon: TabletIcon, px: 768 },
  { id: "mobile", label: "Mobile (375px)", icon: SmartphoneIcon, px: 375 },
] as const;
const presetIds = Object.keys(themePresets) as ThemePreset[];

function Swatch({ bg, accent }: { bg: string; accent: string }) {
  return (
    <span className="relative flex size-4 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/15" style={{ background: bg }} aria-hidden>
      <span className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: accent }} />
    </span>
  );
}

const themeOptions = [
  { value: "default", label: <span className="flex items-center gap-2"><Swatch bg="#0a0a0b" accent="#c6f432" />Kinetic</span> },
  ...presetIds.map((p) => ({
    value: p,
    label: <span className="flex items-center gap-2"><Swatch bg={themePresets[p].seed.background} accent={themePresets[p].seed.accent} />{themePresets[p].label}</span>,
  })),
];

function ToolButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip content={label}>
      <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={`flex size-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-surface-overlay text-foreground" : "text-subtle hover:bg-surface-raised hover:text-foreground"}`}>
        {children}
      </button>
    </Tooltip>
  );
}

export function Preview({ slug, code }: { slug: string; code: string }) {
  const Demo = demos[slug];
  const [run, setRun] = React.useState(0);
  const [width, setWidth] = React.useState<(typeof widths)[number]["id"]>("full");
  const [mode, setMode] = React.useState<"dark" | "light">("dark");
  const [preset, setPreset] = React.useState<ThemePreset | "default">("default");
  const px = widths.find((w) => w.id === width)!.px;
  // A preset carries its own light/dark mode; the toggle applies to the default theme.
  const scheme = preset === "default" ? mode : themePresets[preset].seed.mode;

  return (
    <Tabs defaultValue="preview">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <Select
            aria-label="Preview theme"
            value={preset}
            onValueChange={(v) => setPreset(v as ThemePreset | "default")}
            options={themeOptions}
            className="h-8 w-[132px] rounded-lg border-transparent bg-transparent px-2.5 text-xs hover:bg-surface-raised data-[state=open]:bg-surface-raised"
            contentClassName="w-44"
          />
          <ToolButton label={mode === "dark" ? "Light mode" : "Dark mode"} onClick={() => { setPreset("default"); setMode(mode === "dark" ? "light" : "dark"); }}>
            {scheme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
          </ToolButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          {widths.map((w) => (
            <ToolButton key={w.id} label={w.label} active={width === w.id} onClick={() => setWidth(w.id)}>
              <w.icon size={15} />
            </ToolButton>
          ))}
          <span className="mx-0.5 h-5 w-px bg-border" />
          <ToolButton label="Replay" onClick={() => setRun((r) => r + 1)}>
            <motion.span key={run} initial={{ rotate: 0 }} animate={{ rotate: run ? -360 : 0 }} transition={{ duration: 0.5 }} className="flex"><RotateCcwIcon size={15} /></motion.span>
          </ToolButton>
          <Tooltip content="Open full screen">
            <a href={`/demo/${slug}`} target="_blank" rel="noreferrer" aria-label="Open full screen" className="flex size-8 items-center justify-center rounded-lg text-subtle hover:bg-surface-raised hover:text-foreground">
              <ExternalLinkIcon size={15} />
            </a>
          </Tooltip>
        </div>
      </div>
      <TabsContent value="preview">
        <div className="flex justify-center rounded-2xl border border-border bg-surface/40 p-0 data-[narrow=true]:p-4" data-narrow={!!px}>
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            data-theme={preset === "default" ? undefined : preset}
            className={`${scheme} relative flex min-h-[360px] w-full items-center justify-center overflow-hidden bg-background p-8 text-foreground [container-type:inline-size] sm:p-12 ${px ? "rounded-xl border border-border-strong" : "rounded-2xl"}`}
            style={{ maxWidth: px ?? undefined, colorScheme: scheme }}
          >
            <DotBackground className="opacity-25" />
            <div key={run} className="relative flex w-full items-center justify-center">{Demo ? <Demo /> : <p className="text-muted">Preview coming soon.</p>}</div>
          </motion.div>
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={code} />
      </TabsContent>
    </Tabs>
  );
}

export function InstallTabs({ name, pkg, exports, registryUrl }: { name: string; pkg: string; exports: string[]; registryUrl: string }) {
  const importLine = `import { ${exports.slice(0, 4).join(", ")}${exports.length > 4 ? ", …" : ""} } from "${pkg}";`;
  return (
    <Tabs defaultValue="cli">
      <TabsList>
        <TabsTrigger value="cli">Kinetic CLI</TabsTrigger>
        <TabsTrigger value="npm">npm package</TabsTrigger>
        <TabsTrigger value="shadcn">shadcn CLI</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Copies the source into your project so you can edit every line.</p>
        <Command command={`npx @kineticui/cli add ${name}`} />
      </TabsContent>
      <TabsContent value="npm" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Install the package and import it. Updates arrive with <code className="font-mono text-foreground">npm update</code>.</p>
        <Command command={`npm i ${pkg} @kineticui/core`} />
        <CodeBlock code={importLine} />
      </TabsContent>
      <TabsContent value="shadcn" className="flex flex-col gap-3">
        <p className="text-sm text-muted">Already using shadcn/ui? Kinetic’s registry is compatible.</p>
        <Command command={`npx shadcn@latest add ${registryUrl}/${name}.json`} />
      </TabsContent>
    </Tabs>
  );
}
