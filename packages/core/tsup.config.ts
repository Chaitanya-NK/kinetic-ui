import { defineConfig } from "tsup";

export default defineConfig([
  {
    // Server-safe utilities: cn(), tokens, hooks. No "use client" so cn() works in Server Components.
    entry: { index: "src/index.ts" },
    format: ["esm"],
    dts: true,
    clean: true,
    sourcemap: true,
    external: ["react"],
  },
  {
    // ThemeProvider uses React context, so it ships as a client module.
    entry: { theme: "src/theme.tsx" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    external: ["react"],
    banner: { js: '"use client";' },
  },
]);
