import "server-only";
import registry from "@/generated/registry.json";

export type RegistryEntry = {
  name: string;
  type: "registry:ui" | "registry:block";
  height?: number;
  title: string;
  description: string;
  categories: string[];
  dependencies: string[];
  registryDependencies: string[];
  package: string;
  exports: string[];
  source: string;
  files: { path: string; target: string; content: string }[];
};

/** Full registry including source code. Server-only so it never ships to the browser. */
const everything = registry as RegistryEntry[];
export const fullEntries = everything.filter((e) => e.type !== "registry:block");
export const fullBlocks = everything.filter((e) => e.type === "registry:block");

export function getEntry(slug: string) {
  return fullEntries.find((e) => e.name === slug);
}

export function getBlock(slug: string) {
  return fullBlocks.find((e) => e.name === slug);
}
