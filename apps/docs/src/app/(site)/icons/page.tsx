import type { Metadata } from "next";
import { iconNames } from "@kineticui/icons";
import { IconGallery } from "@/components/icon-gallery";

export const metadata: Metadata = { title: "Icons", description: `${iconNames.length} original stroke icons for React.` };

export default function IconsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs tracking-widest text-accent">{iconNames.length} ICONS</span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Icons</h1>
        <p className="max-w-2xl text-lg text-muted">
          Original 24 px stroke icons, drawn on one grid so they sit together. Tree-shakable React components from <code className="font-mono text-foreground">@kineticui/icons</code>. Click one to copy it.
        </p>
      </header>
      <IconGallery />
    </div>
  );
}
