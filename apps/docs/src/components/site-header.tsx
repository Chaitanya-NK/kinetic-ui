"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme, type ThemeAccent } from "@kineticui/core/theme";
import { cn } from "@kineticui/core";
import { Button, CommandPalette, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, Kbd } from "@kineticui/ui";
import { BoltIcon, CodeIcon, GridIcon, LayersIcon, HomeIcon, MoonIcon, SearchIcon, SunIcon } from "@kineticui/icons";
import { useState } from "react";
import { Logo } from "./logo";
import { blocks, entries, site } from "@/lib/site";

const nav = [
  { href: "/docs", label: "Docs" },
  { href: "/components", label: "Components" },
  { href: "/blocks", label: "Blocks" },
  { href: "/icons", label: "Icons" },
];

const accents: { id: ThemeAccent; hex: string }[] = [
  { id: "lime", hex: "#C6F432" },
  { id: "blue", hex: "#7C8CFF" },
  { id: "orange", hex: "#F4A86A" },
  { id: "rose", hex: "#F0A3D0" },
  { id: "mint", hex: "#6EE7A0" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedMode, setMode, accent, setAccent } = useTheme();
  const [open, setOpen] = useState(false);

  const commands = [
    { id: "home", label: "Home", group: "Pages", icon: <HomeIcon />, onSelect: () => router.push("/") },
    { id: "docs", label: "Getting started", group: "Pages", icon: <BoltIcon />, onSelect: () => router.push("/docs") },
    { id: "all", label: "All components", group: "Pages", icon: <GridIcon />, onSelect: () => router.push("/components") },
    ...entries.map((e) => ({
      id: e.name,
      label: e.title,
      group: "Components",
      keywords: [e.name, e.categories[0] ?? ""],
      icon: <CodeIcon />,
      onSelect: () => router.push(`/components/${e.name}`),
    })),
    { id: "all-blocks", label: "All blocks", group: "Pages", icon: <LayersIcon />, onSelect: () => router.push("/blocks") },
    ...blocks.map((e) => ({
      id: `block-${e.name}`,
      label: e.title,
      group: "Blocks",
      keywords: [e.name, "block", e.categories[0] ?? ""],
      icon: <LayersIcon />,
      onSelect: () => router.push(`/blocks/${e.name}`),
    })),
    {
      id: "theme",
      label: resolvedMode === "dark" ? "Switch to light mode" : "Switch to dark mode",
      group: "Theme",
      icon: resolvedMode === "dark" ? <SunIcon /> : <MoonIcon />,
      onSelect: () => setMode(resolvedMode === "dark" ? "light" : "dark"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
            <Logo />
            Kinetic UI
            <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[10px] font-normal text-muted">v0.1</span>
          </Link>
          <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn("transition-colors hover:text-foreground", pathname.startsWith(n.href) ? "text-foreground" : "text-muted")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden h-9 items-center gap-6 rounded-[10px] border border-border bg-surface px-3 text-sm text-subtle transition-colors hover:text-muted sm:flex"
          >
            <span className="flex items-center gap-2">
              <SearchIcon size={14} /> Search components
            </span>
            <Kbd>⌘K</Kbd>
          </button>
          <Button variant="ghost" size="icon-sm" aria-label="Search" className="sm:hidden" onClick={() => setOpen(true)}>
            <SearchIcon size={16} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Theme">
                <span className="size-4 rounded-full" style={{ background: accents.find((a) => a.id === accent)?.hex }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mode</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={resolvedMode} onValueChange={(v) => setMode(v as "dark" | "light")}>
                <DropdownMenuRadioItem value="dark"><MoonIcon /> Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="light"><SunIcon /> Light</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Accent</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={accent} onValueChange={(v) => setAccent(v as ThemeAccent)}>
                {accents.map((a) => (
                  <DropdownMenuRadioItem key={a.id} value={a.id} className="capitalize">
                    <span className="size-3.5 rounded-full" style={{ background: a.hex }} /> {a.id}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="secondary" size="sm">
            <a href={site.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
      <CommandPalette items={commands} open={open} onOpenChange={setOpen} placeholder="Search components, pages, actions…" />
    </header>
  );
}
