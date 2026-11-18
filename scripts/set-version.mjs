// Usage: npm run version:set -- 0.2.0
// Sets one version across every published package, their @kineticui/* dependency ranges and the docs header badge.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? "")) {
  console.error("Usage: npm run version:set -- <semver>   e.g. 0.2.0 or 1.0.0-beta.1");
  process.exit(1);
}
const root = fileURLToPath(new URL("..", import.meta.url));
const packages = ["core", "icons", "motion", "ui", "blocks", "cli", "mcp"];

for (const p of packages) {
  const file = `${root}packages/${p}/package.json`;
  const pkg = JSON.parse(readFileSync(file, "utf8"));
  pkg.version = version;
  for (const field of ["dependencies", "peerDependencies", "devDependencies"]) {
    for (const dep of Object.keys(pkg[field] ?? {})) if (dep.startsWith("@kineticui/")) pkg[field][dep] = `^${version}`;
  }
  writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

// The MCP server reports its version to clients.
const mcpCore = `${root}packages/mcp/src/core.ts`;
writeFileSync(mcpCore, readFileSync(mcpCore, "utf8").replace(/(const SERVER = \{[^}]*version: ")[^"]+(")/, `$1${version}$2`));

// The docs show "v<major>.<minor>" in the header and on the homepage.
const siteFile = `${root}apps/docs/src/lib/site.ts`;
const [major, minor] = version.split(".");
writeFileSync(siteFile, readFileSync(siteFile, "utf8").replace(/version: "[^"]*"/, `version: "${major}.${minor}"`));

// Committed generated files carry the version too: the Agent Skill (skills/ and its zip) and the
// Figma plugin (figma/code.js and its zip). Rebuild them so CI's up-to-date check passes.
const run = (label, script) => {
  const r = spawnSync(process.execPath, [script], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) console.warn(`! Couldn't rebuild ${label}. Run \`node ${script}\` before committing.`);
};
if (existsSync(`${root}apps/docs/src/generated/registry.json`)) run("the Agent Skill", "scripts/gen-skill.mjs");
else console.warn("! Run `npm run registry` before committing, to refresh the Agent Skill.");
if (existsSync(`${root}packages/icons/dist/index.js`)) run("the Figma plugin", "figma/build.mjs");
else console.warn("! Run `npm run build:packages && npm run figma` before committing, to refresh the Figma plugin.");

console.log(`✓ Set ${packages.length} packages to ${version}. Run npm install to refresh the lockfile, then update CHANGELOG.md.`);
