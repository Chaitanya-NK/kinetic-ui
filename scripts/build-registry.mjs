#!/usr/bin/env node
/**
 * Builds the copy-paste registry from the SAME source files that are
 * published to npm, so both channels always ship identical code.
 *
 *   packages/ui/src/components/*.tsx   ─┐
 *   packages/motion/src/*.tsx          ─┼─> apps/docs/public/r/<name>.json   (shadcn-compatible)
 *   registry.meta.json (titles, etc.)  ─┘    apps/docs/public/r/index.json
 *                                            apps/docs/src/generated/registry.json (for the docs UI)
 *
 * Dependencies are detected from import statements:
 *   "./x"                -> registryDependencies "@kineticui/x"
 *   "radix-ui", "motion" -> dependencies
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "apps/docs/public/r");
const genDir = join(root, "apps/docs/src/generated");
const meta = JSON.parse(readFileSync(join(root, "registry.meta.json"), "utf8"));

const sources = [
  { dir: "packages/ui/src/components", pkg: "@kineticui/ui", type: "registry:ui" },
  { dir: "packages/motion/src", pkg: "@kineticui/motion", type: "registry:ui" },
  { dir: "packages/blocks/src/blocks", pkg: "@kineticui/blocks", type: "registry:block" },
];

/*
 * Blocks import from "@kineticui/ui" / "@kineticui/motion" (that's how the npm
 * package works). In the copy-paste registry every file sits in one folder, so
 * those imports are rewritten to per-file relative imports, which also makes
 * the CLI install the components a block needs.
 */
const exportOwner = {};
for (const { dir, type } of sources) {
  if (type !== "registry:ui") continue;
  for (const file of readdirSync(join(root, dir))) {
    if (!file.endsWith(".tsx")) continue;
    const code = readFileSync(join(root, dir, file), "utf8");
    for (const m of code.matchAll(/export\s+(?:declare\s+)?(?:const|function|type|interface|class)\s+(\w+)/g)) exportOwner[m[1]] = file.replace(/\.tsx$/, "");
  }
}
function localizeImports(code) {
  return code.replace(/import\s*(type\s*)?\{([^}]+)\}\s*from\s*["']@kineticui\/(?:ui|motion)["'];?/g, (_all, typeOnly, names) => {
    const byFile = {};
    for (const raw of names.split(",").map((n) => n.trim()).filter(Boolean)) {
      const bare = raw.replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      const owner = exportOwner[bare];
      if (!owner) throw new Error(`build-registry: no component exports "${bare}"`);
      (byFile[owner] ??= []).push(raw);
    }
    return Object.entries(byFile)
      .map(([f, list]) => `import ${typeOnly ? "type " : ""}{ ${list.join(", ")} } from "./${f}";`)
      .join("\n");
  });
}

// Pin dependency versions from the source package.json files.
const versions = {};
for (const p of ["packages/ui", "packages/motion", "packages/blocks"]) {
  const pj = JSON.parse(readFileSync(join(root, p, "package.json"), "utf8"));
  Object.assign(versions, pj.dependencies);
}
const IGNORE = new Set(["react", "react-dom"]);

function parseImports(code) {
  const specs = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const registryDependencies = new Set();
  const dependencies = new Set();
  for (const s of specs) {
    if (s.startsWith("./")) registryDependencies.add(`@kineticui/${basename(s).replace(/\.tsx?$/, "")}`);
    else if (!IGNORE.has(s)) {
      const pkg = s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0];
      dependencies.add(versions[pkg] ? `${pkg}@${versions[pkg]}` : pkg);
    }
  }
  return { registryDependencies: [...registryDependencies], dependencies: [...dependencies] };
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(genDir, { recursive: true });

const index = [];
const docs = [];
const missingMeta = [];

const seen = new Set();
for (const { dir, pkg, type } of sources) {
  if (!existsSync(join(root, dir))) continue;
  for (const file of readdirSync(join(root, dir)).sort()) {
    if (!file.endsWith(".tsx")) continue;
    const name = file.replace(/\.tsx$/, "");
    if (seen.has(name)) throw new Error(`build-registry: duplicate item name "${name}"`);
    seen.add(name);
    const raw = readFileSync(join(root, dir, file), "utf8");
    const content = type === "registry:block" ? localizeImports(raw) : raw;
    const m = meta[name];
    if (!m) missingMeta.push(name);
    const { registryDependencies, dependencies } = parseImports(content);
    const exports = [...content.matchAll(/export\s+(?:const|function)\s+([A-Z]\w*)/g)].map((x) => x[1]);
    const item = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name,
      type,
      title: m?.title ?? name,
      description: m?.description ?? "",
      categories: [m?.category ?? "other"],
      dependencies,
      registryDependencies,
      files: [{ path: `registry/kinetic/${file}`, type, target: file, content }],
    };
    writeFileSync(join(outDir, `${name}.json`), JSON.stringify(item, null, 2));
    index.push({ name, type, title: item.title, description: item.description, categories: item.categories, ...(m?.height ? { height: m.height } : {}) });
    docs.push({ ...item, package: pkg, exports, source: `${dir}/${file}`, ...(m?.height ? { height: m.height } : {}) });
  }
}

writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify({ name: "kineticui", homepage: "https://github.com/Chaitanya-NK/kinetic-ui", items: index }, null, 2),
);
writeFileSync(join(genDir, "registry.json"), JSON.stringify(docs, null, 2));
// Lightweight list (no source code) for client-side navigation and search.
writeFileSync(join(genDir, "index.json"), JSON.stringify(index, null, 2));

console.log(`✓ Registry: ${index.length} items → apps/docs/public/r`);
if (missingMeta.length) console.warn(`! No metadata in registry.meta.json for: ${missingMeta.join(", ")}`);
