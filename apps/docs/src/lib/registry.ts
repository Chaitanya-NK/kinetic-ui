import "server-only";
import registry from "@/generated/registry.json";

export type RegistryEntry = {
  name: string;
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
export const fullEntries = registry as RegistryEntry[];

export function getEntry(slug: string) {
  return fullEntries.find((e) => e.name === slug);
}
