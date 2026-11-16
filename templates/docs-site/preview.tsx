"use client";

import * as React from "react";
import { ChangelogPage, DocsLayout, HelpCenter } from "@kineticui/blocks";
import { SiteNav } from "./site-nav";

const pages: Record<string, React.ComponentType> = { "/docs": DocsLayout, "/help": HelpCenter, "/changelog": ChangelogPage };

export default function Preview() {
  const [path, setPath] = React.useState("/docs");
  const Page = pages[path]!;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav active={path} onNavigate={setPath} />
      <div className="pt-24"><Page /></div>
    </div>
  );
}
