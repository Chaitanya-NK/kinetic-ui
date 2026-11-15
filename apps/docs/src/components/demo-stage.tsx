"use client";

import { DotBackground } from "@kineticui/motion";
import { demos } from "@/demos";

/** One component demo, centred on its own page. Used for thumbnails, hover previews and "open full screen". */
export function DemoStage({ slug }: { slug: string }) {
  const Demo = demos[slug];
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-8 sm:p-12">
      <DotBackground className="opacity-25" />
      <div data-demo-root className="relative flex w-full items-center justify-center">{Demo ? <Demo /> : <p className="text-muted">Preview coming soon.</p>}</div>
    </div>
  );
}
