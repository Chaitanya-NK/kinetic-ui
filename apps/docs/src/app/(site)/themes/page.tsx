import type { Metadata } from "next";
import { ThemeEditor } from "@/components/theme-editor";

export const metadata: Metadata = { title: "Themes", description: "Preset themes and a live editor that exports Kinetic UI CSS variables." };

export default function ThemesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-accent">THEME EDITOR</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Make it yours</h1>
        <p className="max-w-2xl text-lg text-muted">
          Start from a preset or three seed colours, fine-tune any token, check contrast and watch real components update. Export CSS
          variables, or use a preset directly with <code className="font-mono text-foreground">data-theme=&quot;midnight&quot;</code>.
        </p>
      </header>
      <ThemeEditor />
    </div>
  );
}
