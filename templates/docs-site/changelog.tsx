"use client";

import { ChangelogPage } from "@kineticui/blocks";
import { SiteNav } from "./site-nav";

export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav active="/changelog" />
      <div className="pt-24">
        <ChangelogPage />
      </div>
    </div>
  );
}
