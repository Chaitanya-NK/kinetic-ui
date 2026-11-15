import { parseArgs } from "node:util";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

/**
 * Default registry. Change this after you deploy the docs site (or set
 * KINETIC_REGISTRY / "registry" in kinetic.json / --registry).
 */
const DEFAULT_REGISTRY = process.env.KINETIC_REGISTRY ?? "https://kinetic-ui.vercel.app/r";
const CONFIG_FILE = "kinetic.json";
const NAMESPACE = "@kineticui/";

type Config = {
  registry: string;
  componentsDir: string;
  css?: string;
};

type RegistryFile = { path: string; type: string; content: string; target?: string };
type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
};

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[22m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[22m`,
  green: (s: string) => `\x1b[32m${s}\x1b[39m`,
  lime: (s: string) => `\x1b[38;5;154m${s}\x1b[39m`,
  red: (s: string) => `\x1b[31m${s}\x1b[39m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[39m`,
};

const HELP = `
${c.lime("◆ kinetic")} ${c.dim("— motion-first components for Next.js + Tailwind v4")}

${c.bold("Usage")}
  npx @kineticui/cli init                Set up tokens and kinetic.json
  npx @kineticui/cli add <name...>       Copy components into your project
  npx @kineticui/cli list                Show every available component

${c.bold("Options")}
  --registry <url|dir>   Registry base URL or local folder
  --dir <path>           Where components are written (default components/kinetic)
  --overwrite            Replace files that already exist
  --dry-run              Show what would happen without writing
  --no-install           Skip installing npm dependencies
  -y, --yes              Accept defaults without prompting
  -h, --help             Show this help

${c.bold("Examples")}
  npx @kineticui/cli add button dialog dock
  npx @kineticui/cli add spotlight-card --overwrite
`;

function readConfig(cwd: string): Config | null {
  const p = join(cwd, CONFIG_FILE);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as Config;
}

function detectPackageManager(cwd: string): "pnpm" | "yarn" | "bun" | "npm" {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return "bun";
  return "npm";
}

function install(cwd: string, deps: string[], dryRun: boolean) {
  if (!deps.length) return;
  const pm = detectPackageManager(cwd);
  const args = pm === "npm" ? ["install", ...deps] : ["add", ...deps];
  console.log(`${c.dim("$")} ${pm} ${args.join(" ")}`);
  if (dryRun) return;
  const res = spawnSync(pm, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) throw new Error(`${pm} exited with code ${res.status}`);
}

async function fetchJson<T>(base: string, file: string): Promise<T> {
  if (/^https?:\/\//.test(base)) {
    const url = `${base.replace(/\/$/, "")}/${file}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not fetch ${url} (${res.status})`);
    return (await res.json()) as T;
  }
  const p = resolve(base, file);
  if (!existsSync(p)) throw new Error(`Not found in local registry: ${p}`);
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function normalise(name: string) {
  return name.replace(NAMESPACE, "").replace(/\.json$/, "").trim().toLowerCase();
}

async function resolveItems(registry: string, names: string[]) {
  const seen = new Map<string, RegistryItem>();
  const queue = names.map(normalise);
  while (queue.length) {
    const name = queue.shift()!;
    if (seen.has(name)) continue;
    const item = await fetchJson<RegistryItem>(registry, `${name}.json`);
    seen.set(name, item);
    for (const dep of item.registryDependencies ?? []) {
      if (dep.startsWith(NAMESPACE) || !dep.includes("/")) queue.push(normalise(dep));
    }
  }
  return [...seen.values()];
}

async function ask(question: string, fallback: string, yes: boolean) {
  if (yes || !process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${question} ${c.dim(`(${fallback})`)} `)).trim();
  rl.close();
  return answer || fallback;
}

function findCss(cwd: string) {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
    "src/styles/globals.css",
    "src/index.css",
    "app/app.css",
  ];
  return candidates.find((p) => existsSync(join(cwd, p)));
}

async function init(cwd: string, flags: Flags) {
  if (!existsSync(join(cwd, "package.json"))) {
    throw new Error("No package.json here. Run this inside your Next.js (or Vite) project.");
  }
  const hasSrc = existsSync(join(cwd, "src"));
  const componentsDir = await ask(
    "Where should components go?",
    flags.dir ?? (hasSrc ? "src/components/kinetic" : "components/kinetic"),
    flags.yes,
  );
  const css = await ask("Your global CSS file?", findCss(cwd) ?? "app/globals.css", flags.yes);
  const config: Config = { registry: flags.registry ?? DEFAULT_REGISTRY, componentsDir, css };

  if (!flags.dryRun) writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + "\n");
  console.log(`${c.green("✓")} Wrote ${CONFIG_FILE}`);

  const cssPath = join(cwd, css);
  const line = '@import "@kineticui/core/styles.css";';
  if (existsSync(cssPath)) {
    const current = readFileSync(cssPath, "utf8");
    if (!current.includes(line)) {
      const next = current.includes('@import "tailwindcss"')
        ? current.replace(/(@import "tailwindcss";?)/, `$1\n${line}`)
        : `@import "tailwindcss";\n${line}\n\n${current}`;
      if (!flags.dryRun) writeFileSync(cssPath, next);
      console.log(`${c.green("✓")} Added Kinetic tokens to ${css}`);
    } else {
      console.log(`${c.dim("•")} ${css} already imports Kinetic tokens`);
    }
  } else {
    console.log(`${c.yellow("!")} ${css} not found — add these lines to your global CSS:\n  @import "tailwindcss";\n  ${line}`);
  }

  if (flags.install) install(cwd, ["@kineticui/core"], flags.dryRun);
  console.log(`\n${c.lime("◆")} Ready. Try ${c.bold("npx @kineticui/cli add button")}`);
}

async function add(cwd: string, names: string[], flags: Flags) {
  if (!names.length) throw new Error("Name at least one component, e.g. `kinetic add button`");
  const config = readConfig(cwd) ?? {
    registry: DEFAULT_REGISTRY,
    componentsDir: existsSync(join(cwd, "src")) ? "src/components/kinetic" : "components/kinetic",
  };
  const registry = flags.registry ?? config.registry;
  const dir = flags.dir ?? config.componentsDir;
  if (!readConfig(cwd)) console.log(c.dim(`No ${CONFIG_FILE} found — using defaults. Run \`kinetic init\` to customise.`));

  const items = await resolveItems(registry, names);
  const deps = new Set<string>(["@kineticui/core"]);
  let written = 0;
  let skipped = 0;

  for (const item of items) {
    for (const d of item.dependencies ?? []) deps.add(d);
    for (const file of item.files) {
      const target = join(cwd, dir, file.target ?? file.path.split("/").pop()!);
      if (existsSync(target) && !flags.overwrite) {
        console.log(`${c.dim("•")} ${c.dim("skip")} ${target.replace(cwd + "/", "")} ${c.dim("(exists, use --overwrite)")}`);
        skipped++;
        continue;
      }
      if (!flags.dryRun) {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, file.content);
      }
      console.log(`${c.green("✓")} ${target.replace(cwd + "/", "")}`);
      written++;
    }
  }

  // De-duplicate by package name, keeping the version-pinned spec when there is one.
  const byName = new Map<string, string>();
  for (const spec of deps) {
    const name = spec.startsWith("@") ? "@" + spec.slice(1).split("@")[0] : spec.split("@")[0]!;
    if (!byName.has(name) || spec.includes("@", 1)) byName.set(name, spec);
  }
  if (flags.install) install(cwd, [...byName.values()], flags.dryRun);
  console.log(
    `\n${c.lime("◆")} Added ${items.map((i) => c.bold(i.name)).join(", ")} ${c.dim(`(${written} written, ${skipped} skipped)`)}`,
  );
}

async function list(cwd: string, flags: Flags) {
  const config = readConfig(cwd);
  const registry = flags.registry ?? config?.registry ?? DEFAULT_REGISTRY;
  const index = await fetchJson<{ items: { name: string; description?: string; categories?: string[] }[] }>(
    registry,
    "index.json",
  );
  const byCat = new Map<string, typeof index.items>();
  for (const it of index.items) {
    const cat = it.categories?.[0] ?? "other";
    byCat.set(cat, [...(byCat.get(cat) ?? []), it]);
  }
  for (const [cat, items] of byCat) {
    console.log(`\n${c.lime(cat.toUpperCase())}`);
    for (const it of items) console.log(`  ${c.bold(it.name.padEnd(20))} ${c.dim(it.description ?? "")}`);
  }
  console.log();
}

type Flags = {
  registry?: string;
  dir?: string;
  overwrite: boolean;
  dryRun: boolean;
  install: boolean;
  yes: boolean;
};

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      registry: { type: "string" },
      dir: { type: "string" },
      overwrite: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "no-install": { type: "boolean", default: false },
      yes: { type: "boolean", short: "y", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [command, ...rest] = positionals;
  if (values.help || !command) {
    console.log(HELP);
    return;
  }
  const flags: Flags = {
    registry: values.registry,
    dir: values.dir,
    overwrite: values.overwrite,
    dryRun: values["dry-run"],
    install: !values["no-install"],
    yes: values.yes,
  };
  const cwd = process.cwd();
  if (command === "init") await init(cwd, flags);
  else if (command === "add") await add(cwd, rest, flags);
  else if (command === "list" || command === "ls") await list(cwd, flags);
  else {
    console.log(`${c.red("✕")} Unknown command "${command}"`);
    console.log(HELP);
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(`${c.red("✕")} ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
