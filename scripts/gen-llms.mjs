#!/usr/bin/env node
/**
 * Writes LLM-friendly docs into apps/docs/public (llmstxt.org convention):
 *   /llms.txt          index with one line per component and block
 *   /llms-full.txt     everything an AI needs to use the library, without source code
 *   /md/<name>.md      one page per item, with source
 * Runs after build-registry.mjs and gen-props.mjs.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "apps/docs/public");
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kinetic-ui.chaitanya-nk.com").replace(/\/$/, "");
const registry = JSON.parse(readFileSync(join(root, "apps/docs/src/generated/registry.json"), "utf8"));
const templates = existsSync(join(root, "apps/docs/src/generated/templates.json")) ? JSON.parse(readFileSync(join(root, "apps/docs/src/generated/templates.json"), "utf8")) : [];
const props = JSON.parse(readFileSync(join(root, "apps/docs/src/generated/props.json"), "utf8"));
let usage = {};
try {
  usage = (await import(pathToFileURL(join(root, "apps/docs/src/lib/usage.ts")).href)).usage;
} catch {
  console.warn("! gen-llms: could not load usage snippets (needs Node 22.18+ for TypeScript imports)");
}

const comps = registry.filter((r) => r.type !== "registry:block");
const blocks = registry.filter((r) => r.type === "registry:block");
const docsUrl = (r) => `${site}/${r.type === "registry:block" ? "blocks" : "components"}/${r.name}`;
const byCat = (list) => {
  const m = new Map();
  for (const r of list) for (const c of r.categories) (m.get(c) ?? m.set(c, []).get(c)).push(r);
  return [...m].sort((a, b) => a[0].localeCompare(b[0]));
};

const intro = `# Kinetic UI

> Motion-first, accessible React components for Next.js and Tailwind CSS v4, built on Radix and motion/react. ${comps.length} components and ${blocks.length} blocks, shipped as npm packages (@kineticui/ui, @kineticui/motion, @kineticui/blocks) and as copy-paste source through a shadcn-compatible registry.

Install a component's source: \`npx @kineticui/cli add <name>\` (or \`npx shadcn@latest add ${site}/r/<name>.json\`).
Import from npm: \`npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons\`, then add \`@import "@kineticui/core/styles.css";\` after \`@import "tailwindcss";\` in your global CSS.
AI tools can also connect to the MCP server: hosted at ${site}/mcp, or locally with \`npx -y @kineticui/mcp\`.`;

// llms.txt
const index = [
  intro,
  "",
  "## Docs",
  "",
  `- [Getting started](${site}/docs): installation, theming, motion and accessibility`,
  `- [AI tools and MCP](${site}/docs/ai): connect Claude, Cursor or VS Code to the registry`,
  `- [Figma kit](${site}/docs/figma): a Figma plugin that builds the kit (variables, styles, icons, components) from the same tokens`,
  `- [Updating components](${site}/docs/updating): kinetic diff and kinetic update merge upstream fixes into copied components`,
  `- [Theme editor](${site}/themes): build a theme from three colours`,
  `- [Full reference for LLMs](${site}/llms-full.txt): every component's props, exports and usage in one file`,
  "",
  ...byCat(comps).flatMap(([cat, list]) => [`## Components: ${cat}`, "", ...list.map((r) => `- [${r.title}](${site}/md/${r.name}.md): ${r.description}`), ""]),
  "## Blocks",
  "",
  ...blocks.map((r) => `- [${r.title}](${site}/md/${r.name}.md): ${r.description}`),
  "",
  "## Templates",
  "",
  ...templates.map((t) => `- [${t.title}](${site}/templates/${t.name}): ${t.description} Install: \`npx @kineticui/cli add ${t.name}\``),
  "",
].join("\n");

// Per-item markdown
const propsTable = (name) => {
  const list = props[name] ?? [];
  return list
    .filter((c) => c.props?.length)
    .map(
      (c) =>
        `### ${c.name} props\n\n| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n` +
        c.props.map((p) => `| ${p.name}${p.required ? "" : "?"} | \`${String(p.type).replace(/\|/g, "\\|").replace(/\n/g, " ")}\` | ${p.default ?? ""} | ${(p.description ?? "").replace(/\n/g, " ")} |`).join("\n") +
        (c.extends?.length ? `\n\nAlso accepts: ${c.extends.join(", ")}` : ""),
    )
    .join("\n\n");
};
const install = (r) =>
  `\`\`\`bash\nnpx @kineticui/cli add ${r.name}\n# or\nnpx shadcn@latest add ${site}/r/${r.name}.json\n\`\`\`\n\nFrom npm:\n\n\`\`\`tsx\nimport { ${r.exports.slice(0, 8).join(", ")} } from "${r.package}";\n\`\`\``;
const usageMd = (name) =>
  (usage[name] ?? []).map((u) => `### ${u.title ?? "Usage"}\n\n${u.note ? `${u.note}\n\n` : ""}\`\`\`tsx\n${u.code}\n\`\`\``).join("\n\n");

const page = (r, withSource) =>
  [
    `# ${r.title}`,
    `> ${r.description}`,
    `Docs: ${docsUrl(r)} · Package: ${r.package} · Category: ${r.categories.join(", ")}`,
    `## Install\n\n${install(r)}`,
    r.dependencies.length ? `npm dependencies: ${r.dependencies.join(", ")}` : "",
    r.registryDependencies.length ? `Uses: ${r.registryDependencies.map((d) => d.replace("@kineticui/", "")).join(", ")}` : "",
    usage[r.name] ? `## Usage\n\n${usageMd(r.name)}` : "",
    propsTable(r.name) ? `## API\n\n${propsTable(r.name)}` : "",
    withSource ? `## Source\n\n\`\`\`tsx\n${r.files[0].content}\n\`\`\`` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

const mdDir = join(pub, "md");
if (existsSync(mdDir)) rmSync(mdDir, { recursive: true });
mkdirSync(mdDir, { recursive: true });
for (const r of registry) writeFileSync(join(mdDir, `${r.name}.md`), page(r, true) + "\n");

const full = [intro, "", "---", "", ...comps.map((r) => page(r, false)), "", "# Blocks", "", ...blocks.map((r) => page(r, false))].join("\n\n");

writeFileSync(join(pub, "llms.txt"), index);
writeFileSync(join(pub, "llms-full.txt"), full + "\n");
console.log(`✓ llms.txt, llms-full.txt (${Math.round(full.length / 1024)} KB) and ${registry.length} /md pages`);
