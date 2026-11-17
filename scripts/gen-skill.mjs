#!/usr/bin/env node
/**
 * Writes the Kinetic UI Agent Skill, generated from the registry so it never goes stale:
 *   skills/kinetic-ui/                    SKILL.md + references/ (committed, for people browsing the repo)
 *   apps/docs/public/r/skill/manifest.json  every file with its content, for `kinetic skill`
 *   apps/docs/public/kinetic-ui-skill.zip   upload to claude.ai (Customize → Skills → Upload a skill)
 *   apps/docs/public/r/skill/kinetic-ui.mdc a Cursor project rule
 * Runs after build-registry.mjs and gen-props.mjs.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kinetic-ui.chaitanya-nk.com").replace(/\/$/, "");
const registry = JSON.parse(readFileSync(join(root, "apps/docs/src/generated/registry.json"), "utf8"));
const templates = existsSync(join(root, "apps/docs/src/generated/templates.json")) ? JSON.parse(readFileSync(join(root, "apps/docs/src/generated/templates.json"), "utf8")) : [];
const props = JSON.parse(readFileSync(join(root, "apps/docs/src/generated/props.json"), "utf8"));
const version = JSON.parse(readFileSync(join(root, "packages/ui/package.json"), "utf8")).version;
const css = readFileSync(join(root, "packages/core/styles.css"), "utf8");

const comps = registry.filter((r) => r.type !== "registry:block");
const blocks = registry.filter((r) => r.type === "registry:block");
const byCat = (list) => {
  const m = new Map();
  for (const r of list) {
    const c = r.categories[0] ?? "other";
    (m.get(c) ?? m.set(c, []).get(c)).push(r);
  }
  return [...m].sort((a, b) => a[0].localeCompare(b[0]));
};

/* ---------------------------------------------------------------- SKILL.md */

const description =
  "Build interfaces with Kinetic UI, the motion-first React component library for Next.js and Tailwind CSS v4 (@kineticui/*). Use when a project imports @kineticui packages or has a components/kinetic folder, or when asked to build pages, forms, dashboards, AI chat or animated UI with Kinetic UI.";

const skill = `---
name: kinetic-ui
description: ${description}
---

# Kinetic UI

Kinetic UI (v${version}) is a motion-first, accessible React library: ${comps.length} components, ${blocks.length} blocks and ${templates.length} templates on Tailwind CSS v4, Radix and motion/react. Follow these conventions so new code looks and behaves like the rest of the library.

## 1. Use what exists before writing UI

1. Look the need up in \`references/components.md\` (every component, its import and install command). Prefer a full **block** or **template** (\`references/blocks-and-templates.md\`) when the user wants a whole section or page.
2. If the Kinetic UI MCP server is connected, \`search_components\` and \`get_component\` give the same data with full source.
3. Only build something custom when nothing fits, and build it from Kinetic primitives and tokens.

Do not add another UI kit (MUI, Chakra, Ant) or icon set alongside it.

## 2. Install the way the project already does

Check the project first:

- **\`components/kinetic/\` exists, or \`kinetic.json\`** → the project copies source. Add with \`npx @kineticui/cli add <name>\` and import from \`@/components/kinetic/<name>\`. Edits to those files are expected.
- **\`@kineticui/ui\` in package.json** → the project uses npm. Import from the package listed in the reference (\`@kineticui/ui\`, \`@kineticui/motion\`, \`@kineticui/blocks\`, \`@kineticui/icons\`).
- **Neither** → set it up once: \`npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons\`, then in the global CSS:

\`\`\`css
@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";
\`\`\`

Never mix both styles for the same component. To pull upstream fixes into copied components, run \`npx @kineticui/cli diff\` and \`npx @kineticui/cli update\` (merges, keeps local edits).

## 3. Style with tokens, never raw colours

Every colour comes from \`--kn-*\` CSS variables exposed as Tailwind colours, so light mode, accent presets and full themes work automatically. Do not write hex values, \`gray-*\`, \`zinc-*\`, \`white\` or \`black\` for UI chrome.

| Use | Classes |
| --- | --- |
| Page and surfaces | \`bg-background\`, \`bg-surface\` (cards), \`bg-surface-raised\` (popovers, inputs), \`bg-surface-overlay\` (hover) |
| Text | \`text-foreground\`, \`text-muted\` (secondary), \`text-subtle\` (hints, captions) |
| Borders | \`border-border\`, \`border-border-strong\` (hover, emphasis) |
| Brand | \`bg-accent text-accent-foreground\` (primary actions), \`text-accent\`, \`bg-accent-soft text-accent-soft-foreground\` |
| Status | \`success\`, \`warning\`, \`danger\`, \`info\` and their \`-soft\` backgrounds |
| Focus | \`focus-visible:ring-2 focus-visible:ring-ring\` |
| Elevation | \`shadow-overlay\` for floating layers |

Full list in \`references/tokens.md\`. Theme with \`<ThemeProvider>\` from \`@kineticui/core/theme\` (modes, accents \`lime | blue | orange | rose | mint\`, themes \`midnight | sunset | paper | mono | forest | ocean\`) or \`data-theme\` / \`data-accent\` on any element.

Typography: \`font-display\` (Space Grotesk; install \`@fontsource-variable/space-grotesk\` and import it once, otherwise it falls back to the system font) for headings with \`tracking-tight\`, the default sans (Inter) for body, \`font-mono\` (JetBrains Mono) for code, kbd and small uppercase eyebrows (\`font-mono text-xs uppercase tracking-widest text-accent\`). Corners are generous: \`rounded-xl\` for controls, \`rounded-2xl\` for cards. Merge classes with \`cn()\` from \`@kineticui/core\`.

## 4. Motion rules

- Use \`motion/react\` (not framer-motion imports) and springs (\`type: "spring"\`, stiffness 200 to 400, damping 20 to 35) for UI movement. Easing token: \`ease-kn-out\`.
- Every animation must respect reduced motion: \`const reduced = useReducedMotion()\` from \`@kineticui/core\`, then skip or shorten movement.
- Reach for an existing effect before writing one: \`@kineticui/motion\` has text effects, magnetic and tilt cards, marquees, beams, aurora, particles, globe, liquid glass, holo cards and more.
- Animate transform and opacity, not layout properties, except with \`layout\` animations.

## 5. Component conventions

- **State**: controlled or uncontrolled. \`value\` / \`defaultValue\` / \`onValueChange\`, \`open\` / \`defaultOpen\` / \`onOpenChange\`, \`checked\` / \`onCheckedChange\`.
- **Button**: \`variant="primary | secondary | outline | ghost | soft | destructive | link"\`, \`size="sm | md | lg | icon | icon-sm"\`, \`loading\`, and \`asChild\` to render a link: \`<Button asChild><a href="/start">Start</a></Button>\`.
- **Inputs**: wrap with \`<Field label hint error htmlFor>\`. \`Input\` takes \`leading\`, \`trailing\`, \`invalid\` and \`wrapperClassName\` (for layout such as \`flex-1 min-w-0\`).
- **Forms**: \`Form\`, \`FormField\`, \`FormSubmit\` from \`@kineticui/ui/form\` with react-hook-form (and zod via \`@hookform/resolvers\`).
- **Feedback**: render \`<Toaster />\` once, then \`toast("Saved")\`, \`toast.success(...)\`, \`toast.error(...)\`, \`toast.loading(...)\`.
- **Overlays**: \`Dialog\`, \`DialogTrigger\`, \`DialogContent size="sm | md | lg | xl"\`, \`DialogHeader\`, \`DialogTitle\`. Every overlay needs a title, visible or \`sr-only\`.
- **Icons**: \`@kineticui/icons\` (\`<ArrowRightIcon size={16} />\`). Never use emoji as icons.
- Client components start with \`"use client"\` when they use state, effects or motion.

## 6. Accessibility is part of done

Components handle keyboard and ARIA themselves; keep it intact. Give icon-only buttons an \`aria-label\`, label every field, keep focus rings, use real buttons and links, and check text contrast against \`bg-surface\`. Accessibility notes per component are in the docs (${site}/components/<name>).

## 7. Example

\`\`\`tsx
"use client";
import { Badge, Button, Card, Field, Input, toast } from "@kineticui/ui";
import { ArrowRightIcon } from "@kineticui/icons";

export function Invite() {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <Badge variant="soft" dot>Beta</Badge>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">Invite your team</h2>
        <p className="mt-1 text-sm text-muted">They get access as soon as they accept.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Invite sent");
        }}
      >
        <Field label="Email" htmlFor="invite" className="min-w-0 flex-1">
          <Input id="invite" type="email" required placeholder="maya@kinetic.dev" />
        </Field>
        <Button type="submit" className="self-end">
          Send <ArrowRightIcon size={16} />
        </Button>
      </form>
    </Card>
  );
}
\`\`\`

## Reference files

- \`references/components.md\`: every component by category, with imports and install commands
- \`references/props.md\`: props for the core components
- \`references/tokens.md\`: every colour, animation and easing token
- \`references/blocks-and-templates.md\`: ready-made sections and whole pages

More: ${site}/docs · full LLM reference ${site}/llms-full.txt · MCP server ${site}/mcp
`;

/* ---------------------------------------------------------------- references */

const importLine = (r) => `\`import { ${r.exports.slice(0, 6).join(", ")}${r.exports.length > 6 ? ", …" : ""} } from "${r.package}"\``;

const components = [
  `# Kinetic UI components (v${version})`,
  "",
  `${comps.length} components. Install source with \`npx @kineticui/cli add <name>\`, or import from npm as shown.`,
  "",
  ...byCat(comps).flatMap(([cat, list]) => [
    `## ${cat}`,
    "",
    ...list.map((r) => `- **${r.name}**: ${r.description} ${importLine(r)}`),
    "",
  ]),
].join("\n");

const core = ["button", "badge", "input", "select", "checkbox", "switch", "radio-group", "slider", "tabs", "dialog", "sheet", "popover", "tooltip", "dropdown-menu", "toast", "card", "avatar", "accordion", "segmented-control", "combobox", "date-picker", "data-table", "command-palette", "empty-state", "progress", "skeleton", "alert"];
const propRef = [
  "# Props for core components",
  "",
  `Generated from source. Everything else is documented at ${site}/components/<name>.`,
  "",
  ...core.flatMap((name) => {
    const list = (props[name] ?? []).filter((c) => c.props?.length);
    if (!list.length) return [];
    return [
      `## ${name}`,
      "",
      ...list.flatMap((c) => [
        `**${c.name}**${c.extends?.length ? ` (also accepts ${c.extends.join(", ")})` : ""}`,
        "",
        ...c.props.map((p) => `- \`${p.name}${p.required ? "" : "?"}\`: \`${String(p.type).replace(/\s+/g, " ")}\`${p.default ? ` = ${p.default}` : ""}${p.description ? `. ${p.description.replace(/\n/g, " ")}` : ""}`),
        "",
      ]),
    ];
  }),
].join("\n");

const colors = [...css.matchAll(/--color-([a-z-]+):\s*var\((--kn-[a-z-]+)\)/g)].map((m) => [m[1], m[2]]);
const anims = [...css.matchAll(/--animate-([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]);
const eases = [...css.matchAll(/--ease-([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]]);
const tokens = [
  "# Design tokens",
  "",
  "Colours are CSS variables that switch with light mode, accents and themes. Use them through the Tailwind names (`bg-surface`, `text-muted`, `border-border`).",
  "",
  "## Colours",
  "",
  "| Tailwind name | Variable |",
  "| --- | --- |",
  ...colors.map(([n, v]) => `| \`${n}\` | \`${v}\` |`),
  "",
  "## Animations",
  "",
  ...anims.map(([n, v]) => `- \`animate-${n}\`: \`${v.trim()}\``),
  "",
  "## Easing",
  "",
  ...eases.map(([n, v]) => `- \`ease-${n}\`: \`${v.trim()}\``),
  "",
  "## Themes",
  "",
  "- Light mode: the `light` class on `<html>` (ThemeProvider handles it).",
  "- Accents: `data-accent=\"lime | blue | orange | rose | mint\"`.",
  "- Full themes: `data-theme=\"midnight | sunset | paper | mono | forest | ocean\"`, on `<html>` or any section.",
  "- Custom: `createTheme({ mode, background, foreground, accent })` and `themeToCss()` from `@kineticui/core`, or the editor at " + site + "/themes.",
  "",
].join("\n");

const bt = [
  "# Blocks and templates",
  "",
  "## Blocks",
  "",
  `${blocks.length} full sections. Install with \`npx @kineticui/cli add <name>\` or import from \`@kineticui/blocks\`.`,
  "",
  ...byCat(blocks).flatMap(([cat, list]) => [`### ${cat}`, "", ...list.map((r) => `- **${r.name}**: ${r.description}`), ""]),
  "## Templates",
  "",
  "Whole pages or apps. `npx @kineticui/cli add <name>` writes them into the app router (use `--overwrite` to replace app/page.tsx).",
  "",
  ...templates.map((t) => `- **${t.name}**: ${t.description}`),
  "",
].join("\n");

const files = {
  "SKILL.md": skill,
  "references/components.md": components,
  "references/props.md": propRef,
  "references/tokens.md": tokens,
  "references/blocks-and-templates.md": bt,
};

/* ---------------------------------------------------------------- write */

const out = join(root, "skills/kinetic-ui");
rmSync(out, { recursive: true, force: true });
for (const [p, c] of Object.entries(files)) {
  mkdirSync(dirname(join(out, p)), { recursive: true });
  writeFileSync(join(out, p), c);
}

// Cursor reads project rules from .cursor/rules/*.mdc; one rule carries the same guidance.
const body = skill.replace(/^---[\s\S]*?---\n/, "");
const mdc = `---\ndescription: ${description}\nglobs: ["**/*.tsx", "**/*.jsx", "**/*.css"]\nalwaysApply: false\n---\n${body.replace(/`references\/([a-z-]+)\.md`/g, (_, n) => `${site}/r/skill/references/${n}.md`)}`;

const pub = join(root, "apps/docs/public/r/skill");
rmSync(pub, { recursive: true, force: true });
for (const [p, c] of Object.entries(files)) {
  mkdirSync(dirname(join(pub, p)), { recursive: true });
  writeFileSync(join(pub, p), c);
}
writeFileSync(join(pub, "kinetic-ui.mdc"), mdc);
writeFileSync(join(pub, "manifest.json"), JSON.stringify({ name: "kinetic-ui", version, files: Object.entries(files).map(([path, content]) => ({ path, content })), cursor: mdc }));

/* A tiny zip writer (deflate, no dependencies) for the claude.ai upload. */
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function zip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, text] of entries) {
    const data = Buffer.from(text), comp = deflateRawSync(data), nameBuf = Buffer.from(name), crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(0, 10); local.writeUInt32LE(crc, 14); local.writeUInt32LE(comp.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, comp);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(0, 12); central.writeUInt32LE(crc, 16); central.writeUInt32LE(comp.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28); central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + comp.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
writeFileSync(join(root, "apps/docs/public/kinetic-ui-skill.zip"), zip(Object.entries(files).map(([p, c]) => [`kinetic-ui/${p}`, c])));

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
console.log(`✓ Agent Skill: SKILL.md ${kb(skill)}, ${Object.keys(files).length - 1} references, zip + Cursor rule`);
