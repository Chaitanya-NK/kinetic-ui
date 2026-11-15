# @kineticui/core

Design tokens, theme presets, `ThemeProvider` and utilities for Kinetic UI.

```bash
npm i @kineticui/core
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@kineticui/core/styles.css";
```

```tsx
"use client";
import { ThemeProvider } from "@kineticui/core/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultMode="dark" defaultAccent="lime">{children}</ThemeProvider>;
}
```

**Theme presets:** `midnight`, `sunset`, `paper`, `mono`, `forest`, `ocean`. Use `<ThemeProvider defaultTheme="midnight">` or `data-theme="paper"` on any element.

**Your own theme:**

```ts
import { createTheme, themeToCss } from "@kineticui/core";
const css = themeToCss(createTheme({ mode: "dark", background: "#0b1020", foreground: "#e6ebff", accent: "#ff5a1f" }));
```

Also exports `cn()`, `contrast()`, `themeToStyle()` and hooks such as `useMounted()`.

Docs: https://kinetic-ui.vercel.app

Part of [Kinetic UI](https://github.com/Chaitanya-NK/kinetic-ui). MIT licensed.
