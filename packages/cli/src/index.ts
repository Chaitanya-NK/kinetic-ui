import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { merge3, unifiedDiff } from "./merge";

/**
 * Default registry. Change this after you deploy the docs site (or set
 * KINETIC_REGISTRY / "registry" in kinetic.json / --registry).
 */
const DEFAULT_REGISTRY = process.env.KINETIC_REGISTRY ?? "https://kinetic-ui.chaitanya-nk.com/r";
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
  meta?: { template?: boolean; notes?: string };
};

/** Pages and loose files (templates) are written relative to the project root; everything else goes in the components folder. */
const ROOT_TYPES = new Set(["registry:page", "registry:file"]);

function targetFor(cwd: string, dir: string, file: RegistryFile) {
  const name = file.target ?? file.path.split("/").pop()!;
  if (!ROOT_TYPES.has(file.type)) return join(cwd, dir, name);
  // create-next-app with --src-dir puts the app router under src/app.
  const rooted = name.replace(/^~\//, "");
  if (/^(app|pages)\//.test(rooted) && !existsSync(join(cwd, rooted.split("/")[0]!)) && existsSync(join(cwd, "src"))) return join(cwd, "src", rooted);
  return join(cwd, rooted);
}

/** Templates import components as "@/components/kinetic/x". Point that at the configured folder. */
function fixImports(content: string, cwd: string, dir: string, target: string) {
  if (!content.includes("@/components/kinetic/")) return content;
  const normal = dir.replace(/\\/g, "/").replace(/\/$/, "");
  if (normal === "components/kinetic" || normal === "src/components/kinetic") return content; // the default "@/*" alias already matches
  let rel = relative(dirname(target), join(cwd, dir)).split(sep).join("/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return content.replaceAll("@/components/kinetic/", `${rel}/`);
}

/* ------------------------------------------------------------------ lockfile
 * .kinetic/lock.json records what `add` wrote, and .kinetic/base/ keeps a copy of each file exactly
 * as it was installed. That copy is the common ancestor that lets `update` merge upstream changes
 * into files you've edited. Commit the .kinetic folder with the rest of your code.
 */

const LOCK_DIR = ".kinetic";
type LockFile = { version: 1; items: Record<string, { files: string[]; updatedAt: string }> };

const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const rel = (cwd: string, p: string) => relative(cwd, p).split(sep).join("/");

function readLock(cwd: string): LockFile {
  const p = join(cwd, LOCK_DIR, "lock.json");
  if (!existsSync(p)) return { version: 1, items: {} };
  return JSON.parse(readFileSync(p, "utf8")) as LockFile;
}

function writeLock(cwd: string, lock: LockFile) {
  mkdirSync(join(cwd, LOCK_DIR), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(lock.items).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(join(cwd, LOCK_DIR, "lock.json"), JSON.stringify({ version: 1, items: sorted }, null, 2) + "\n");
}

const basePath = (cwd: string, file: string) => join(cwd, LOCK_DIR, "base", file);
function readBase(cwd: string, file: string) {
  const p = basePath(cwd, file);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}
function writeBase(cwd: string, file: string, content: string) {
  const p = basePath(cwd, file);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

function record(cwd: string, lock: LockFile, item: string, files: { file: string; content: string }[]) {
  const prev = new Set(lock.items[item]?.files ?? []);
  for (const f of files) {
    writeBase(cwd, f.file, f.content);
    prev.add(f.file);
  }
  lock.items[item] = { files: [...prev].sort(), updatedAt: new Date().toISOString() };
}

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
  npx @kineticui/cli add <name...>       Copy components, blocks or templates into your project
  npx @kineticui/cli list                Show every available component
  npx @kineticui/cli diff [name...]      See what changed upstream since you added a component
  npx @kineticui/cli update [name...]    Pull upstream fixes in, keeping your own edits

${c.bold("Options")}
  --registry <url|dir>   Registry base URL or local folder
  --dir <path>           Where components are written (default components/kinetic)
  --overwrite            Replace files that already exist
  --force                update: replace files you edited when there's no record to merge from
  --summary              diff: list changed files without printing the diff
  --dry-run              Show what would happen without writing
  --no-install           Skip installing npm dependencies
  -y, --yes              Accept defaults without prompting
  -h, --help             Show this help

${c.bold("Examples")}
  npx @kineticui/cli add button dialog dock
  npx @kineticui/cli add spotlight-card --overwrite
  npx @kineticui/cli add saas-landing --overwrite   ${c.dim("# replaces app/page.tsx")}
  npx @kineticui/cli diff                           ${c.dim("# everything you've installed")}
  npx @kineticui/cli update button dock
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
  const lock = readLock(cwd);
  let written = 0;
  let skipped = 0;

  for (const item of items) {
    for (const d of item.dependencies ?? []) deps.add(d);
    const done: { file: string; content: string }[] = [];
    for (const file of item.files) {
      const target = targetFor(cwd, dir, file);
      const content = fixImports(file.content, cwd, dir, target);
      if (existsSync(target) && !flags.overwrite) {
        // Already there and identical: still worth tracking so diff/update can follow it.
        if (readFileSync(target, "utf8") === content) done.push({ file: rel(cwd, target), content });
        console.log(`${c.dim("•")} ${c.dim("skip")} ${rel(cwd, target)} ${c.dim("(exists, use --overwrite)")}`);
        skipped++;
        continue;
      }
      if (!flags.dryRun) {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);
      }
      done.push({ file: rel(cwd, target), content });
      console.log(`${c.green("✓")} ${rel(cwd, target)}`);
      written++;
    }
    if (done.length) record(cwd, lock, item.name, done);
  }
  if (!flags.dryRun) writeLock(cwd, lock);

  if (flags.install) install(cwd, dedupe(deps), flags.dryRun);
  const requested = new Set(names.map(normalise));
  console.log(
    `\n${c.lime("◆")} Added ${items.filter((i) => requested.has(i.name)).map((i) => c.bold(i.name)).join(", ")} ${c.dim(`(${items.length} items, ${written} files written, ${skipped} skipped)`)}`,
  );
  for (const t of items.filter((i) => i.meta?.template && requested.has(i.name))) {
    const pages = t.files.filter((f) => f.type === "registry:page").map((f) => f.target);
    console.log(`${c.lime("◆")} ${t.title ?? t.name} pages: ${pages.map((p) => c.bold(p ?? "")).join(", ")}`);
    if (skipped && t.files.some((f) => f.target === "app/page.tsx")) console.log(c.yellow(`  app/page.tsx already existed. Re-run with --overwrite to replace it.`));
    if (t.meta?.notes) console.log(`  ${t.meta.notes}`);
  }
}

/** De-duplicate npm specs by package name, keeping the version-pinned spec when there is one. */
function dedupe(deps: Iterable<string>) {
  const byName = new Map<string, string>();
  for (const spec of deps) {
    const name = spec.startsWith("@") ? "@" + spec.slice(1).split("@")[0] : spec.split("@")[0]!;
    if (!byName.has(name) || spec.includes("@", 1)) byName.set(name, spec);
  }
  return [...byName.values()];
}

function projectConfig(cwd: string, flags: Flags) {
  const config = readConfig(cwd) ?? {
    registry: DEFAULT_REGISTRY,
    componentsDir: existsSync(join(cwd, "src")) ? "src/components/kinetic" : "components/kinetic",
  };
  return { registry: flags.registry ?? config.registry, dir: flags.dir ?? config.componentsDir };
}

/**
 * Which items to check. Named ones if given; otherwise everything in the lockfile, plus anything in
 * the components folder that matches a registry name (for projects set up before the lockfile).
 */
async function installedItems(cwd: string, registry: string, dir: string, names: string[]) {
  if (names.length) return names.map(normalise);
  const lock = readLock(cwd);
  const found = new Set(Object.keys(lock.items));
  const index = await fetchJson<{ items: { name: string }[] }>(registry, "index.json");
  for (const { name } of index.items) {
    if (["tsx", "ts"].some((ext) => existsSync(join(cwd, dir, `${name}.${ext}`)))) found.add(name);
  }
  return [...found].sort();
}

type FileState = "same" | "upstream" | "local" | "both" | "untracked" | "new";
type FileCheck = { item: string; file: string; target: string; state: FileState; local: string | null; base: string | null; upstream: string };

async function check(cwd: string, flags: Flags, names: string[]) {
  const { registry, dir } = projectConfig(cwd, flags);
  const wanted = await installedItems(cwd, registry, dir, names);
  if (!wanted.length) throw new Error("Nothing installed yet. Add something with `kinetic add <name>`.");
  const out: { item: RegistryItem; files: FileCheck[] }[] = [];
  for (const name of wanted) {
    const item = await fetchJson<RegistryItem>(registry, `${name}.json`);
    const files: FileCheck[] = item.files.map((f) => {
      const target = targetFor(cwd, dir, f);
      const file = rel(cwd, target);
      const upstream = fixImports(f.content, cwd, dir, target);
      const local = existsSync(target) ? readFileSync(target, "utf8") : null;
      const base = readBase(cwd, file);
      let state: FileState;
      if (local === null) state = "new";
      else if (local === upstream) state = "same";
      else if (base === null) state = "untracked";
      else if (base === local) state = "upstream";
      else if (base === upstream) state = "local";
      else state = "both";
      return { item: name, file, target, state, local, base, upstream };
    });
    out.push({ item, files });
  }
  return out;
}

const label: Record<FileState, string> = {
  same: c.dim("up to date"),
  upstream: c.lime("update available"),
  local: c.dim("only your edits"),
  both: c.yellow("update available, you edited it too"),
  untracked: c.yellow("differs from upstream (no install record)"),
  new: c.lime("new file upstream"),
};

function printDiff(from: string, to: string) {
  for (const h of unifiedDiff(from, to)) {
    console.log(c.dim(h.header));
    for (const l of h.lines) console.log(l.kind === "+" ? c.green(`+${l.text}`) : l.kind === "-" ? c.red(`-${l.text}`) : c.dim(` ${l.text}`));
  }
}

async function diff(cwd: string, names: string[], flags: Flags) {
  const results = await check(cwd, flags, names);
  let pending = 0;
  for (const { item, files } of results) {
    const changed = files.filter((f) => f.state !== "same" && f.state !== "local");
    console.log(`\n${c.bold(item.name)} ${changed.length ? "" : c.dim("up to date")}`);
    for (const f of files) {
      const markers = f.local?.includes("\n<<<<<<< ") || f.local?.startsWith("<<<<<<< ");
      if (markers) console.log(`  ${f.file}  ${c.red("has unresolved merge conflicts")}`);
      if (f.state === "same" || (markers && f.state === "local")) continue;
      console.log(`  ${f.file}  ${label[f.state]}`);
      if (flags.summary || f.state === "local") continue;
      // Show what upstream changed: base → upstream when we know the base, else your file → upstream.
      const from = f.base ?? f.local ?? "";
      if (f.state === "untracked") console.log(c.dim("  (comparing your file with upstream; your own edits show as removed lines)"));
      printDiff(from, f.upstream);
    }
    pending += changed.length;
  }
  console.log(
    pending
      ? `\n${c.lime("◆")} ${pending} file${pending === 1 ? "" : "s"} can be updated. Run ${c.bold(`kinetic update${names.length ? " " + names.join(" ") : ""}`)}`
      : `\n${c.lime("◆")} Everything is up to date.`,
  );
}

async function update(cwd: string, names: string[], flags: Flags) {
  const results = await check(cwd, flags, names);
  const lock = readLock(cwd);
  const deps = new Set<string>();
  let updated = 0, conflicts = 0, kept = 0;

  for (const { item, files } of results) {
    const recorded: { file: string; content: string }[] = [];
    for (const f of files) {
      let next: string | null = null;
      let note = "";
      if (f.state === "same" || f.state === "local") {
        recorded.push({ file: f.file, content: f.upstream });
        continue;
      } else if (f.state === "new" || f.state === "upstream") {
        next = f.upstream;
        note = f.state === "new" ? "added" : "updated";
      } else if (f.state === "both") {
        const m = merge3(f.base!, f.local!, f.upstream, { yours: "your version", theirs: `kinetic ${item.name}` });
        next = m.text;
        note = m.conflicts ? c.yellow(`merged with ${m.conflicts} conflict${m.conflicts === 1 ? "" : "s"}`) : "merged, your edits kept";
        conflicts += m.conflicts;
      } else if (f.state === "untracked") {
        if (!flags.force) {
          console.log(`${c.yellow("!")} ${f.file} ${c.dim("differs from upstream and was added before Kinetic kept install records, so there's nothing to merge from. Check `kinetic diff " + item.name + "`, then re-run with --force to replace it (a backup is kept).")}`);
          kept++;
          continue;
        }
        if (!flags.dryRun) {
          const backup = join(cwd, LOCK_DIR, "backup", `${f.file}.${Date.now()}`);
          mkdirSync(dirname(backup), { recursive: true });
          copyFileSync(f.target, backup);
        }
        next = f.upstream;
        note = `replaced ${c.dim(`(backup in ${LOCK_DIR}/backup)`)}`;
      }
      if (next === null) continue;
      if (!flags.dryRun) {
        mkdirSync(dirname(f.target), { recursive: true });
        writeFileSync(f.target, next);
      }
      // The new common ancestor is upstream, so the next update only merges what changes after today.
      recorded.push({ file: f.file, content: f.upstream });
      console.log(`${c.green("✓")} ${f.file} ${c.dim("—")} ${note}`);
      updated++;
    }
    for (const d of item.dependencies ?? []) deps.add(d);
    if (recorded.length) record(cwd, lock, item.name, recorded);
  }

  if (!flags.dryRun) writeLock(cwd, lock);
  if (updated && flags.install && deps.size) install(cwd, dedupe(deps), flags.dryRun);
  console.log(`\n${c.lime("◆")} ${updated ? `Updated ${updated} file${updated === 1 ? "" : "s"}.` : "Nothing to update."}${kept ? ` ${kept} skipped.` : ""}`);
  if (conflicts) {
    console.log(c.yellow(`  ${conflicts} conflict${conflicts === 1 ? "" : "s"} to resolve: search for "<<<<<<<" and keep the lines you want.`));
    process.exitCode = 1;
  }
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
  // Size the name column to the longest name so descriptions always line up with a gap.
  const width = Math.max(...index.items.map((it) => it.name.length)) + 2;
  for (const [cat, items] of byCat) {
    console.log(`\n${c.lime(cat.toUpperCase())}`);
    for (const it of items) console.log(`  ${c.bold(it.name.padEnd(width))}${c.dim(it.description ?? "")}`);
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
  force: boolean;
  summary: boolean;
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
      force: { type: "boolean", default: false },
      summary: { type: "boolean", default: false },
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
    force: values.force,
    summary: values.summary,
  };
  const cwd = process.cwd();
  if (command === "init") await init(cwd, flags);
  else if (command === "add") await add(cwd, rest, flags);
  else if (command === "list" || command === "ls") await list(cwd, flags);
  else if (command === "diff") await diff(cwd, rest, flags);
  else if (command === "update" || command === "upgrade") await update(cwd, rest, flags);
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
