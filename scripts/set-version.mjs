// Usage: npm run version:set -- 0.2.0
// Sets one version across every published package, their @kineticui/* dependency ranges and the docs header badge.
import { readFileSync, writeFileSync } from "node:fs";
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

console.log(`✓ Set ${packages.length} packages to ${version}. Run npm install to refresh the lockfile, then update CHANGELOG.md.`);
