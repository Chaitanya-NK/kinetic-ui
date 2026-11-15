import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "motion", "@kineticui/core", "@kineticui/icons", "@kineticui/motion", "@kineticui/ui"],
  banner: { js: '"use client";' },
});
