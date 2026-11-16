/**
 * Transport-agnostic MCP server for Kinetic UI.
 * `createKineticServer(source).handle(message)` answers one JSON-RPC message; the stdio bin and the
 * docs site's HTTP endpoint both wrap it. No dependencies, so `npx @kineticui/mcp` starts instantly.
 */

export type IndexItem = { name: string; type: string; title: string; description: string; categories: string[] };
export type RegistryItem = IndexItem & {
  dependencies: string[];
  registryDependencies: string[];
  files: { path: string; content: string; target?: string }[];
  /** Present on the docs site's own data. */
  exports?: string[];
  package?: string;
  meta?: { package?: string; exports?: string[] };
};

export type Source = {
  siteUrl: string;
  index(): Promise<IndexItem[]>;
  item(name: string): Promise<RegistryItem | null>;
  /** Optional extras the docs site can supply. */
  usage?(name: string): Promise<{ title?: string; note?: string; code: string }[] | null>;
};

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type JsonRpcMessage = { jsonrpc: "2.0"; id?: string | number | null; method?: string; params?: Record<string, unknown>; result?: unknown; error?: unknown };

const SERVER = { name: "kinetic-ui", title: "Kinetic UI", version: "0.1.1" };
const SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

const INSTRUCTIONS = `Kinetic UI is a motion-first React component library (Tailwind v4, Radix, motion/react) in the shadcn style.
Use search_components to find components or blocks, get_component for source and install commands, and get_setup once per project.
Prefer installing with the Kinetic CLI or shadcn so the source lands in the user's project; use the npm packages when the user wants upgrades from npm.
Blocks are full sections (pricing, dashboards, auth). Components live in @kineticui/ui, effects in @kineticui/motion.`;

const tools = [
  {
    name: "search_components",
    title: "Search components",
    description: "Find Kinetic UI components and blocks by keyword or intent, e.g. 'pricing table', 'drag to reorder', 'chat with streaming'. Returns the best matches with names, descriptions and categories.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What the user wants to build." },
        type: { type: "string", enum: ["all", "component", "block"], description: "Limit to components or full-page blocks." },
        limit: { type: "number", description: "Max results (default 10)." },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_components",
    title: "List components",
    description: "List every Kinetic UI component or block, optionally filtered by category (e.g. forms, ai, data, effects, marketing, navigation, overlay).",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["all", "component", "block"] },
        category: { type: "string", description: "Category name. Omit to list categories with counts." },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_component",
    title: "Get component",
    description: "Full details for one component or block: description, install commands, npm import, dependencies, usage examples and the complete source code.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Registry name, e.g. 'sortable-list' or 'pricing-table'." },
        includeSource: { type: "boolean", description: "Include the source code (default true)." },
      },
      required: ["name"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_install_command",
    title: "Install command",
    description: "Shell command that adds one or more components to the user's project, via the Kinetic CLI, the shadcn CLI, or npm.",
    inputSchema: {
      type: "object",
      properties: {
        names: { type: "array", items: { type: "string" }, description: "Registry names." },
        method: { type: "string", enum: ["kinetic", "shadcn", "npm"], description: "Default kinetic." },
        packageManager: { type: "string", enum: ["npm", "pnpm", "yarn", "bun"] },
      },
      required: ["names"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_setup",
    title: "Project setup",
    description: "One-time setup for a project: required packages, the stylesheet import, fonts, theme presets and accent colours.",
    inputSchema: { type: "object", properties: { framework: { type: "string", enum: ["next", "vite", "remix", "other"] } } },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
] as const;

const text = (t: string) => ({ content: [{ type: "text", text: t }] });

function score(q: string, it: IndexItem) {
  const words = q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  if (!words.length) return 0;
  const name = it.name.toLowerCase(), title = it.title.toLowerCase(), desc = it.description.toLowerCase(), cat = it.categories.join(" ").toLowerCase();
  let s = 0;
  if (name === q.toLowerCase().replace(/\s+/g, "-")) s += 50;
  for (const w of words) {
    const stem = w.replace(/(ing|es|s)$/, "");
    if (name.includes(stem)) s += 10;
    if (title.includes(stem)) s += 8;
    if (cat.includes(stem)) s += 4;
    if (desc.includes(stem)) s += 3;
  }
  return s;
}

const kindOf = (it: IndexItem) => (it.type === "registry:block" ? "block" : "component");
const pkgOf = (it: RegistryItem) => it.package ?? it.meta?.package ?? (it.type === "registry:block" ? "@kineticui/blocks" : it.files[0]?.path.includes("motion") ? "@kineticui/motion" : "@kineticui/ui");
const exportsOf = (it: RegistryItem) => it.exports ?? it.meta?.exports ?? [...(it.files[0]?.content ?? "").matchAll(/export\s+(?:const|function)\s+([A-Z]\w*)/g)].map((m) => m[1]!);

function installCmd(names: string[], method: string, pm: string, site: string) {
  const x = pm === "pnpm" ? "pnpm dlx" : pm === "yarn" ? "yarn dlx" : pm === "bun" ? "bunx" : "npx";
  if (method === "shadcn") return `${x} shadcn@latest add ${names.map((n) => `${site}/r/${n}.json`).join(" ")}`;
  if (method === "npm") {
    const add = pm === "npm" ? "npm i" : `${pm} add`;
    return `${add} @kineticui/core @kineticui/ui @kineticui/motion @kineticui/icons`;
  }
  return `${x} @kineticui/cli add ${names.join(" ")}`;
}

export function createKineticServer(source: Source) {
  async function callTool(name: string, args: Record<string, unknown>) {
    const site = source.siteUrl.replace(/\/$/, "");
    if (name === "search_components") {
      const q = String(args.query ?? "");
      const type = String(args.type ?? "all");
      const limit = Math.min(50, Number(args.limit ?? 10));
      const hits = (await source.index())
        .filter((i) => type === "all" || kindOf(i) === type)
        .map((i) => [score(q, i), i] as const)
        .filter(([s]) => s > 0)
        .sort((a, b) => b[0] - a[0])
        .slice(0, limit);
      if (!hits.length) return text(`No Kinetic UI items matched "${q}". Try list_components to browse categories.`);
      return text(
        `Top matches for "${q}":\n\n` +
          hits.map(([, i]) => `- **${i.name}** (${kindOf(i)}, ${i.categories.join(", ")}): ${i.description}`).join("\n") +
          `\n\nCall get_component with a name for source and install steps.`,
      );
    }
    if (name === "list_components") {
      const type = String(args.type ?? "all");
      const items = (await source.index()).filter((i) => type === "all" || kindOf(i) === type);
      const cat = args.category ? String(args.category).toLowerCase() : null;
      if (!cat) {
        const counts = new Map<string, number>();
        items.forEach((i) => i.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
        return text(`${items.length} items. Categories:\n\n` + [...counts].sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${c} (${n})`).join("\n") + `\n\nCall list_components with a category to see its items.`);
      }
      const inCat = items.filter((i) => i.categories.some((c) => c.toLowerCase() === cat));
      if (!inCat.length) return text(`No items in category "${cat}".`);
      return text(inCat.map((i) => `- **${i.name}** (${kindOf(i)}): ${i.description}`).join("\n"));
    }
    if (name === "get_component") {
      const n = String(args.name ?? "").trim().toLowerCase().replace(/\s+/g, "-");
      const it = await source.item(n);
      if (!it) {
        const close = (await source.index()).map((i) => [score(n.replace(/-/g, " "), i), i.name] as const).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0]).slice(0, 5).map(([, x]) => x);
        return { ...text(`No component named "${n}".${close.length ? ` Did you mean: ${close.join(", ")}?` : ""}`), isError: true };
      }
      const exps = exportsOf(it);
      const pkg = pkgOf(it);
      const usage = (await source.usage?.(it.name)) ?? [];
      const parts = [
        `# ${it.title} (${it.name})`,
        it.description,
        `Docs: ${site}/${it.type === "registry:block" ? "blocks" : "components"}/${it.name}`,
        `## Install\n\nCopy the source into the project (recommended):\n\n\`\`\`bash\n${installCmd([it.name], "kinetic", "npm", site)}\n\`\`\`\n\nOr with shadcn:\n\n\`\`\`bash\n${installCmd([it.name], "shadcn", "npm", site)}\n\`\`\`\n\nOr from npm:\n\n\`\`\`tsx\nimport { ${exps.slice(0, 6).join(", ")} } from "${pkg}";\n\`\`\``,
        it.dependencies.length ? `npm dependencies: ${it.dependencies.join(", ")}` : "",
        it.registryDependencies.length ? `Also installs: ${it.registryDependencies.map((d) => d.replace("@kineticui/", "")).join(", ")}` : "",
        `Exports: ${exps.join(", ")}`,
        ...usage.map((u) => `## ${u.title ?? "Usage"}\n${u.note ? `\n${u.note}\n` : ""}\n\`\`\`tsx\n${u.code}\n\`\`\``),
        args.includeSource === false ? "" : `## Source (${it.files[0]?.target ?? it.name + ".tsx"})\n\n\`\`\`tsx\n${it.files[0]?.content ?? ""}\n\`\`\``,
      ];
      return text(parts.filter(Boolean).join("\n\n"));
    }
    if (name === "get_install_command") {
      const names = Array.isArray(args.names) ? args.names.map(String) : [];
      if (!names.length) return { ...text("Pass at least one component name."), isError: true };
      const all = new Set((await source.index()).map((i) => i.name));
      const unknown = names.filter((x) => !all.has(x));
      if (unknown.length) return { ...text(`Unknown: ${unknown.join(", ")}. Use search_components to find the right names.`), isError: true };
      return text(installCmd(names, String(args.method ?? "kinetic"), String(args.packageManager ?? "npm"), site));
    }
    if (name === "get_setup") {
      const fw = String(args.framework ?? "next");
      const cssFile = fw === "next" ? "app/globals.css" : "src/index.css";
      return text(`# Kinetic UI setup (${fw})

Requires React 18+ and Tailwind CSS v4.

1. Install the packages (or copy individual components with the CLI in step 6):

\`\`\`bash
npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons
\`\`\`

2. In ${cssFile}:

\`\`\`css
@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";
\`\`\`

3. Theming. Dark is the default. Wrap the app in ThemeProvider (client component):

\`\`\`tsx
import { ThemeProvider } from "@kineticui/core/theme";
import { Toaster } from "@kineticui/ui";

<ThemeProvider defaultMode="dark" defaultAccent="lime">{children}<Toaster /></ThemeProvider>
\`\`\`

4. Accent presets: lime, blue, orange, rose, mint. Full themes: midnight, sunset, paper, mono, forest, ocean (\`defaultTheme\` on the provider, or \`data-theme\` on any element). Override tokens in CSS (\`--kn-accent\`, \`--kn-accent-foreground\`…) or generate one with createTheme / themeToCss from @kineticui/core, or the editor at ${site}/themes.

5. Fonts used by the defaults: Space Grotesk (display), Inter (body), JetBrains Mono (code).

6. Add components: \`npx @kineticui/cli add <name>\`. Files land in components/kinetic (or src/components/kinetic) and npm dependencies are installed for you.

Forms need react-hook-form (plus zod and @hookform/resolvers for schemas) and import from "@kineticui/ui/form".`);
    }
    return { ...text(`Unknown tool: ${name}`), isError: true };
  }

  async function handle(msg: JsonRpcMessage): Promise<JsonRpcMessage | null> {
    const isRequest = msg.id !== undefined && msg.id !== null && typeof msg.method === "string";
    const reply = (result: unknown): JsonRpcMessage => ({ jsonrpc: "2.0", id: msg.id ?? null, result: result as Json });
    const fail = (code: number, message: string): JsonRpcMessage => ({ jsonrpc: "2.0", id: msg.id ?? null, error: { code, message } });
    if (!msg.method) return null; // responses from the client: nothing to do
    try {
      switch (msg.method) {
        case "initialize": {
          const asked = String(msg.params?.protocolVersion ?? "");
          return reply({
            protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],
            capabilities: { tools: { listChanged: false } },
            serverInfo: { ...SERVER, websiteUrl: source.siteUrl },
            instructions: INSTRUCTIONS,
          });
        }
        case "ping":
          return reply({});
        case "tools/list":
          return reply({ tools });
        case "tools/call": {
          const name = String(msg.params?.name ?? "");
          const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
          try {
            return reply(await callTool(name, args));
          } catch (e) {
            return reply({ ...text(`Kinetic UI registry error: ${(e as Error).message}`), isError: true });
          }
        }
        case "resources/list":
          return reply({ resources: [] });
        case "prompts/list":
          return reply({ prompts: [] });
        default:
          if (!isRequest) return null; // notifications such as notifications/initialized
          return fail(-32601, `Method not found: ${msg.method}`);
      }
    } catch (e) {
      return isRequest ? fail(-32603, (e as Error).message) : null;
    }
  }

  return { handle, tools, callTool };
}

/** A Source that reads the public registry over HTTP, with in-memory caching. */
export function httpSource(siteUrl = "https://kinetic-ui.chaitanya-nk.com"): Source {
  const base = siteUrl.replace(/\/$/, "");
  let idx: Promise<IndexItem[]> | null = null;
  const items = new Map<string, Promise<RegistryItem | null>>();
  const get = async (url: string): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
    return r.json();
  };
  return {
    siteUrl: base,
    index: () => (idx ??= get(`${base}/r/index.json`).then((d) => (d?.items ?? []) as IndexItem[]).catch((e) => ((idx = null), Promise.reject(e)))),
    item: (name) => {
      if (!/^[a-z0-9-]+$/.test(name)) return Promise.resolve(null);
      if (!items.has(name)) items.set(name, get(`${base}/r/${name}.json`) as Promise<RegistryItem | null>);
      return items.get(name)!;
    },
  };
}
