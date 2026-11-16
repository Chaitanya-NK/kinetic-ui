"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from "@kineticui/ui";
import { ArrowUpRightIcon, RefreshIcon } from "@kineticui/icons";
import { CodeBlock } from "./code-block";

const widths = { desktop: "100%", tablet: "768px", mobile: "390px" } as const;

export function BlockPreview({
  slug,
  code,
  files,
  src = `/preview/${slug}`,
  height = 720,
}: {
  slug: string;
  code?: string;
  /** Several files (templates): shown with a file switcher in the Code tab. */
  files?: { name: string; code: string }[];
  src?: string;
  height?: number;
}) {
  const [size, setSize] = React.useState<keyof typeof widths>("desktop");
  const [key, setKey] = React.useState(0);
  const [file, setFile] = React.useState(0);
  return (
    <Tabs defaultValue="preview">
      <div className="flex flex-wrap items-center gap-3">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <ToggleGroup type="single" value={size} onValueChange={(v) => v && setSize(v as keyof typeof widths)} aria-label="Preview width">
            <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
            <ToggleGroupItem value="tablet">Tablet</ToggleGroupItem>
            <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
          </ToggleGroup>
          <button type="button" aria-label="Reload preview" onClick={() => setKey((k) => k + 1)} className="flex size-9 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground">
            <RefreshIcon size={15} />
          </button>
          <a href={src} target="_blank" rel="noreferrer" aria-label="Open in new tab" className="flex size-9 items-center justify-center rounded-lg border border-border text-muted hover:text-foreground">
            <ArrowUpRightIcon size={15} />
          </a>
        </div>
      </div>
      <TabsContent value="preview">
        <div className="flex justify-center overflow-hidden rounded-2xl border border-border bg-surface/40 p-0">
          <iframe
            key={key}
            src={src}
            title={`${slug} preview`}
            loading="lazy"
            className={cn("block bg-background transition-[width] duration-300 ease-kn-out", size !== "desktop" && "border-x border-border")}
            style={{ width: widths[size], height }}
          />
        </div>
      </TabsContent>
      <TabsContent value="code" className="flex flex-col gap-3">
        {files && files.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Files">
            {files.map((f, i) => (
              <button
                key={f.name}
                type="button"
                role="tab"
                aria-selected={file === i}
                onClick={() => setFile(i)}
                className={cn("rounded-lg px-2.5 py-1 font-mono text-xs transition-colors", file === i ? "bg-accent text-accent-foreground" : "border border-border text-muted hover:text-foreground")}
              >
                {f.name}
              </button>
            ))}
          </div>
        ) : null}
        <CodeBlock code={files?.[file]?.code ?? code ?? ""} />
      </TabsContent>
    </Tabs>
  );
}
