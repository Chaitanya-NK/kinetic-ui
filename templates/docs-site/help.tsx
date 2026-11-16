"use client";

import { HelpCenter } from "@kineticui/blocks";
import { SiteNav } from "./site-nav";

export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav active="/help" />
      <div className="pt-24">
        <HelpCenter />
      </div>
    </div>
  );
}
