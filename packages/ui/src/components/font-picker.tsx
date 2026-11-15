"use client";

import * as React from "react";
import { cn, useControllableState } from "@kineticui/core";
import { CheckIcon, SearchIcon } from "@kineticui/icons";

export type FontOption = { family: string; category: "sans" | "serif" | "mono" | "display" | "handwriting"; stack: string; google?: boolean };

export const defaultFonts: FontOption[] = [
  { family: "Inter", category: "sans", stack: "'Inter Variable', Inter, system-ui, sans-serif", google: true },
  { family: "System UI", category: "sans", stack: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { family: "Space Grotesk", category: "display", stack: "'Space Grotesk Variable', 'Space Grotesk', sans-serif", google: true },
  { family: "Poppins", category: "sans", stack: "Poppins, sans-serif", google: true },
  { family: "Manrope", category: "sans", stack: "Manrope, sans-serif", google: true },
  { family: "DM Sans", category: "sans", stack: "'DM Sans', sans-serif", google: true },
  { family: "Playfair Display", category: "serif", stack: "'Playfair Display', Georgia, serif", google: true },
  { family: "Lora", category: "serif", stack: "Lora, Georgia, serif", google: true },
  { family: "Georgia", category: "serif", stack: "Georgia, 'Times New Roman', serif" },
  { family: "Fraunces", category: "display", stack: "Fraunces, Georgia, serif", google: true },
  { family: "JetBrains Mono", category: "mono", stack: "'JetBrains Mono Variable', 'JetBrains Mono', monospace", google: true },
  { family: "IBM Plex Mono", category: "mono", stack: "'IBM Plex Mono', monospace", google: true },
  { family: "Menlo", category: "mono", stack: "Menlo, Consolas, monospace" },
  { family: "Caveat", category: "handwriting", stack: "Caveat, cursive", google: true },
];

export type FontPickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (family: string, font: FontOption) => void;
  fonts?: FontOption[];
  /** Load Google Fonts on demand so previews render in the real face. */
  loadGoogleFonts?: boolean;
  previewText?: string;
  className?: string;
};

const loaded = new Set<string>();
function loadGoogle(family: string) {
  if (typeof document === "undefined" || loaded.has(family)) return;
  loaded.add(family);
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600&display=swap`;
  document.head.appendChild(l);
}

/** Font chooser with category filter, search, live preview text and optional on-demand Google Fonts loading. */
export function FontPicker({ value, defaultValue = "Inter", onValueChange, fonts = defaultFonts, loadGoogleFonts = false, previewText = "The quick brown fox jumps over the lazy dog", className }: FontPickerProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: (f: string) => onValueChange?.(f, fonts.find((x) => x.family === f)!) });
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<FontOption["category"] | "all">("all");
  const [text, setText] = React.useState(previewText);
  const [size, setSize] = React.useState(20);
  const list = fonts.filter((f) => (cat === "all" || f.category === cat) && f.family.toLowerCase().includes(q.toLowerCase()));

  React.useEffect(() => {
    if (loadGoogleFonts) list.filter((f) => f.google).forEach((f) => loadGoogle(f.family));
  }, [loadGoogleFonts, list]);

  return (
    <div className={cn("flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <div className="flex gap-2">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-lg bg-background px-3">
            <SearchIcon size={14} className="text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fonts" aria-label="Search fonts" className="flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" />
          </label>
          <input type="range" min={14} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Preview size" className="w-24 accent-[var(--kn-accent)]" />
        </div>
        <div className="flex flex-wrap gap-1">
          {(["all", "sans", "serif", "display", "mono", "handwriting"] as const).map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cn("h-7 rounded-full px-3 text-xs capitalize", cat === c ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface-raised")}>
              {c}
            </button>
          ))}
        </div>
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Preview text" className="h-8 rounded-lg bg-background px-3 text-xs text-muted outline-none" />
      </div>
      <ul role="listbox" aria-label="Fonts" className="max-h-80 overflow-y-auto p-1.5">
        {list.map((f) => (
          <li key={f.family}>
            <button
              type="button"
              role="option"
              aria-selected={current === f.family}
              onClick={() => setCurrent(f.family)}
              className={cn("flex w-full flex-col gap-1 rounded-xl p-3 text-left transition-colors", current === f.family ? "bg-accent-soft/50" : "hover:bg-surface-raised")}
            >
              <span className="flex items-center gap-2 text-xs text-subtle">
                {f.family}
                <span className="rounded bg-surface-overlay px-1.5 font-mono text-[9px] uppercase">{f.category}</span>
                {current === f.family ? <CheckIcon size={14} className="ml-auto text-accent" /> : null}
              </span>
              <span className="truncate text-foreground" style={{ fontFamily: f.stack, fontSize: size }}>
                {text || f.family}
              </span>
            </button>
          </li>
        ))}
        {!list.length ? <li className="py-10 text-center text-sm text-subtle">No fonts found</li> : null}
      </ul>
    </div>
  );
}
