"use client";

import { DocsLayout } from "@kineticui/blocks";
import { SiteNav } from "./site-nav";

export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav active="/docs" />
      <div className="pt-24">
        <DocsLayout />
      </div>
    </div>
  );
}
