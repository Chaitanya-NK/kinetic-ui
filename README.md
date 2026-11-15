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
| [`@kineticui/core`](packages/core) | Design tokens (`styles.css`), six theme presets, `createTheme()`, `cn()`, hooks, `ThemeProvider` (`@kineticui/core/theme`) |
| [`@kineticui/ui`](packages/ui) | 150 component files: forms, editors, navigation, overlays, data display (tables, charts, Kanban, Gantt, maps), AI (chat, tool calls), collaboration, social, media, mobile, contact |
| [`@kineticui/motion`](packages/motion) | 14 effects: Spotlight Card, Border Beam, Marquee, Typewriter, Text Scramble, Parallax, Confetti… |
| [`@kineticui/blocks`](packages/blocks) | 78 ready-made blocks: app screens (auth, dashboard, billing, admin, API keys), marketing pages (heroes, pricing, blog, docs, careers, case study), commerce screens and personal-site widgets |
| [`@kineticui/icons`](packages/icons) | 348 original 24 px stroke icons as React components, plus `<Icon name>` and `iconNames` |
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
# optional: full sections and screens
npm i @kineticui/blocks
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

Full theme presets: `midnight`, `sunset`, `paper`, `mono`, `forest`, `ocean`. Use `<ThemeProvider defaultTheme="midnight">` or `data-theme="paper"` on any element. Build your own on the docs site's **Themes** page, which exports CSS variables, or in code:

```ts
import { createTheme, themeToCss } from "@kineticui/core";
const css = themeToCss(createTheme({ mode: "dark", background: "#0b1020", foreground: "#e6ebff", accent: "#ff5a1f" }));
```

The preset CSS in `packages/core/styles.css` is generated from `packages/core/src/themes.ts` by `scripts/gen-theme-css.mjs` during `npm run build:packages`.

## Repository layout

```
kinetic-ui/
├── packages/
│   ├── core/       tokens, theme, cn(), hooks
│   ├── icons/      icon set
│   ├── motion/     effects        ─┐
│   ├── ui/         components     ─┤
│   ├── blocks/     sections/screens─┴─ single source for npm AND the registry
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

### Add a new block

1. Create `packages/blocks/src/blocks/my-block.tsx` exporting a component named after the file (`my-block` → `MyBlock`) that renders with no props.
2. Import components from `@kineticui/ui` / `@kineticui/motion` as usual. The registry build rewrites those to per-file imports, so `kinetic add my-block` also installs everything it uses.
3. Add it to `registry.meta.json` with a category of `app`, `marketing`, `screens` or `widgets` and a preview `height`.
4. It appears at `/blocks/my-block` with a desktop/tablet/mobile preview.

Dependencies are detected automatically from your `import` lines.

## Deploy the docs + registry to Vercel

The site lives at **https://kinetic-ui.chaitanya-nk.com**. The CLI downloads components from `https://kinetic-ui.chaitanya-nk.com/r`, so keep that domain pointed at the deployment.

1. Import the repo on [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `apps/docs`. Framework: Next.js (auto-detected). `apps/docs/vercel.json` installs the whole monorepo (`npm ci` at the root), and the `prebuild` step builds the packages and the registry.
3. Deploy, then in **Settings → Domains** add `kinetic-ui.chaitanya-nk.com`.
4. At your DNS provider, add the record Vercel shows: a `CNAME` for `kinetic-ui` pointing to Vercel's target.
5. Optional: set `NEXT_PUBLIC_SITE_URL` if you ever serve the site from a different domain. It defaults to the URL above.

If the domain changes, update `DEFAULT_REGISTRY` in `packages/cli/src/index.ts` and `url` in `apps/docs/src/lib/site.ts`, then publish a new CLI version.

## Publish to npm

You need to be a member of the `kineticui` npm organisation. Releases are published by GitHub Actions when you push a version tag.

**One-time setup**

1. On npmjs.com, create a **Granular Access Token** with read and write access to the `@kineticui` scope (or a classic **Automation** token).
2. In the GitHub repo, go to **Settings → Secrets and variables → Actions** and add it as `NPM_TOKEN`.

**Each release**

```bash
npm run version:set -- 0.2.0   # bumps all six packages and their @kineticui/* ranges
# add a section to CHANGELOG.md, then:
git commit -am "Release v0.2.0"
git tag v0.2.0
git push origin main --tags     # the Release workflow builds, tests and publishes
```

The workflow refuses to publish if the tag doesn't match the package versions. It publishes with npm provenance, so each package page links back to the commit that built it, then creates a GitHub release from the changelog.

To publish from your machine instead: `npm login && npm run release`.

## License

MIT
