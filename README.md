# Kinetic UI

Motion-first, accessible React components for **Next.js** and **Tailwind CSS v4**.

Every component ships **two ways from one source**:

| | npm packages | Copy with the CLI |
|---|---|---|
| Install | `npm i @kineticui/ui` | `npx @kineticui/cli add dock` |
| You get | Import and go, updates via `npm update` | The source file in your repo, yours to edit |
| Best for | App teams who want things to just work | Designers and devs who customise everything |

Both channels are built from the same files in `packages/`, so they never drift apart. The registry is also **shadcn-compatible**.

## Packages

| Package | What's inside |
|---|---|
| [`@kineticui/core`](packages/core) | Design tokens (`styles.css`), `cn()`, hooks, `ThemeProvider` (`@kineticui/core/theme`) |
| [`@kineticui/ui`](packages/ui) | 26 component files: Button, Input, Dialog, Sheet, Tabs, Toast, Command Palette, Dock, OTP Input… |
| [`@kineticui/motion`](packages/motion) | 12 effects: Spotlight Card, Border Beam, Marquee, Typewriter, Confetti, Tilt Card… |
| [`@kineticui/icons`](packages/icons) | 70 original 24 px stroke icons as React components |
| [`@kineticui/cli`](packages/cli) | `kinetic init`, `kinetic add <name>`, `kinetic list` |

## Use it in your app

### Option A — CLI (copy the code)

```bash
npx @kineticui/cli init          # adds tokens to globals.css, writes kinetic.json
npx @kineticui/cli add button dialog dock
```

### Option B — npm

```bash
npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";
```

```tsx
import { Button } from "@kineticui/ui";
import { SpotlightCard } from "@kineticui/motion";

export default function Page() {
  return (
    <SpotlightCard>
      <Button>Get started</Button>
    </SpotlightCard>
  );
}
```

### Theming

```tsx
"use client";
import { ThemeProvider } from "@kineticui/core/theme";
import { Toaster } from "@kineticui/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="dark" defaultAccent="lime">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
```

Accent presets: `lime`, `blue`, `orange`, `rose`, `mint`. Or override any `--kn-*` variable in CSS.

## Repository layout

```
kinetic-ui/
├── packages/
│   ├── core/       tokens, theme, cn(), hooks
│   ├── icons/      icon set
│   ├── motion/     effects        ─┐
│   ├── ui/         components     ─┴─ single source for npm AND the registry
│   └── cli/        `kinetic` CLI
├── apps/docs/      Next.js docs site — also serves the registry at /r/*.json
├── scripts/build-registry.mjs     turns package sources into registry JSON
└── registry.meta.json             titles, descriptions and categories
```

## Develop

```bash
npm install
npm run dev          # builds packages + registry, starts the docs site on :3000
npm run build        # production build of everything
npm run typecheck
```

### Add a new component

1. Create `packages/ui/src/components/my-thing.tsx` (or `packages/motion/src/my-thing.tsx`).
   Import siblings with `./other-component` and shared utilities from `@kineticui/core`.
2. Export it from `packages/ui/src/index.ts`.
3. Add a title, description and category in `registry.meta.json`.
4. Add a live demo in `apps/docs/src/demos/index.tsx`.
5. `npm run dev` — the registry item, docs page and npm export are all generated.

Dependencies are detected automatically from your `import` lines.

## Deploy the docs + registry to Vercel

1. Import the repo on [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `apps/docs`. Framework: Next.js (auto-detected).
3. Add the environment variable `NEXT_PUBLIC_SITE_URL` = your production URL (e.g. `https://kinetic-ui.vercel.app`).
4. Deploy. The `prebuild` step builds the packages and the registry automatically.

After the first deploy, put your real URL in `DEFAULT_REGISTRY` in `packages/cli/src/index.ts` so the CLI fetches from your site.

## Publish to npm

You need to be a member of the `kineticui` npm organisation.

```bash
npm login
npm run release      # builds and publishes all five packages with public access
```

Bump versions in each `packages/*/package.json` before every release.

## License

MIT
