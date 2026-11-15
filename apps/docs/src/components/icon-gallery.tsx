"use client";

import * as React from "react";
import { Icon, iconNames, type IconName } from "@kineticui/icons";
import { SearchInput, SegmentedControl, Slider, toast } from "@kineticui/ui";
import { cn } from "@kineticui/core";
import { CodeBlock } from "./code-block";

const pascal = (n: string) => n.split("-").map((p) => p[0]!.toUpperCase() + p.slice(1)).join("") + "Icon";

export function IconGallery() {
  const [q, setQ] = React.useState("");
  const [size, setSize] = React.useState(24);
  const [stroke, setStroke] = React.useState(2);
  const [copyAs, setCopyAs] = React.useState("jsx");
  const [selected, setSelected] = React.useState<IconName>("sparkle");
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const shown = iconNames.filter((n) => terms.every((t) => n.includes(t)));

  const copy = async (n: IconName) => {
    setSelected(n);
    const text = copyAs === "jsx" ? `<${pascal(n)} />` : copyAs === "name" ? n : `import { ${pascal(n)} } from "@kineticui/icons";`;
    await navigator.clipboard?.writeText(text).catch(() => {});
    toast.success(`Copied ${copyAs === "name" ? n : pascal(n)}`, { duration: 1500 });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-16 z-10 -mx-2 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background/90 p-3 backdrop-blur-xl">
        <SearchInput value={q} onValueChange={setQ} placeholder={`Search ${iconNames.length} icons…`} className="w-full sm:w-72" />
        <label className="flex w-40 flex-col gap-1 text-xs text-subtle">
          Size {size}px
          <Slider min={16} max={48} step={2} value={[size]} onValueChange={(v) => setSize(v[0]!)} aria-label="Icon size" />
        </label>
        <label className="flex w-40 flex-col gap-1 text-xs text-subtle">
          Stroke {stroke}
          <Slider min={1} max={3} step={0.25} value={[stroke]} onValueChange={(v) => setStroke(v[0]!)} aria-label="Stroke width" />
        </label>
        <SegmentedControl className="ml-auto" value={copyAs} defaultValue="jsx" onValueChange={setCopyAs} options={[{ value: "jsx", label: "JSX" }, { value: "import", label: "Import" }, { value: "name", label: "Name" }]} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
          {shown.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => void copy(n)}
              title={pascal(n)}
              className={cn(
                "group flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border p-2 transition-colors",
                selected === n ? "border-accent bg-accent-soft/40" : "border-border bg-surface hover:border-border-strong hover:bg-surface-raised",
              )}
            >
              <Icon name={n} size={size} strokeWidth={stroke} className="transition-transform group-hover:scale-110" />
              <span className="w-full truncate text-center text-[10px] text-subtle">{n}</span>
            </button>
          ))}
          {!shown.length ? <p className="col-span-full py-16 text-center text-subtle">No icons match “{q}”.</p> : null}
        </div>
        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-40">
          <div className="flex aspect-square items-center justify-center rounded-xl bg-background">
            <Icon name={selected} size={96} strokeWidth={stroke} />
          </div>
          <div className="font-mono text-sm">{pascal(selected)}</div>
          <CodeBlock code={`import { ${pascal(selected)} } from "@kineticui/icons";\n\n<${pascal(selected)} size={${size}} strokeWidth={${stroke}} />\n// or\n<Icon name="${selected}" />`} />
        </aside>
      </div>
    </div>
  );
}
