import { defineConfig } from "tsup";

export default defineConfig([
  // CLI entry with a shebang.
  { entry: ["src/index.ts"], format: ["esm"], platform: "node", target: "node20", clean: true, banner: { js: "#!/usr/bin/env node" } },
  // Transport-agnostic core, reused by the docs site's remote /mcp endpoint.
  { entry: ["src/core.ts"], format: ["esm"], platform: "neutral", target: "es2022", dts: true },
]);
