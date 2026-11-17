import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/merge.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
