"use client";

import * as React from "react";
import * as Blocks from "@kineticui/blocks";

import { blockComponentName } from "./block-names";

export function BlockRenderer({ slug }: { slug: string }) {
  const Component = (Blocks as unknown as Record<string, React.ComponentType | undefined>)[blockComponentName(slug)];
  if (!Component) return <p className="p-10 text-muted">No component named {blockComponentName(slug)} in @kineticui/blocks.</p>;
  return <Component />;
}
