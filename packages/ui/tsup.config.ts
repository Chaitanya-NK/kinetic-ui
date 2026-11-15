import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "motion",
    "radix-ui",
    "cmdk",
    "class-variance-authority",
    "@kineticui/core",
    "@kineticui/icons",
  ],
  banner: { js: '"use client";' },
});
