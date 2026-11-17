---
name: kinetic-ui
description: Build interfaces with Kinetic UI, the motion-first React component library for Next.js and Tailwind CSS v4 (@kineticui/*). Use when a project imports @kineticui packages or has a components/kinetic folder, or when asked to build pages, forms, dashboards, AI chat or animated UI with Kinetic UI.
---

# Kinetic UI

Kinetic UI (v0.3.0) is a motion-first, accessible React library: 209 components, 78 blocks and 7 templates on Tailwind CSS v4, Radix and motion/react. Follow these conventions so new code looks and behaves like the rest of the library.

## 1. Use what exists before writing UI

1. Look the need up in `references/components.md` (every component, its import and install command). Prefer a full **block** or **template** (`references/blocks-and-templates.md`) when the user wants a whole section or page.
2. If the Kinetic UI MCP server is connected, `search_components` and `get_component` give the same data with full source.
3. Only build something custom when nothing fits, and build it from Kinetic primitives and tokens.

Do not add another UI kit (MUI, Chakra, Ant) or icon set alongside it.

## 2. Install the way the project already does

Check the project first:

- **`components/kinetic/` exists, or `kinetic.json`** → the project copies source. Add with `npx @kineticui/cli add <name>` and import from `@/components/kinetic/<name>`. Edits to those files are expected.
- **`@kineticui/ui` in package.json** → the project uses npm. Import from the package listed in the reference (`@kineticui/ui`, `@kineticui/motion`, `@kineticui/blocks`, `@kineticui/icons`).
- **Neither** → set it up once: `npm i @kineticui/ui @kineticui/core @kineticui/motion @kineticui/icons`, then in the global CSS:

```css
@import "tailwindcss";
@import "@kineticui/core/styles.css";
@source "../node_modules/@kineticui";
```

Never mix both styles for the same component. To pull upstream fixes into copied components, run `npx @kineticui/cli diff` and `npx @kineticui/cli update` (merges, keeps local edits).

## 3. Style with tokens, never raw colours

Every colour comes from `--kn-*` CSS variables exposed as Tailwind colours, so light mode, accent presets and full themes work automatically. Do not write hex values, `gray-*`, `zinc-*`, `white` or `black` for UI chrome.

| Use | Classes |
| --- | --- |
| Page and surfaces | `bg-background`, `bg-surface` (cards), `bg-surface-raised` (popovers, inputs), `bg-surface-overlay` (hover) |
| Text | `text-foreground`, `text-muted` (secondary), `text-subtle` (hints, captions) |
| Borders | `border-border`, `border-border-strong` (hover, emphasis) |
| Brand | `bg-accent text-accent-foreground` (primary actions), `text-accent`, `bg-accent-soft text-accent-soft-foreground` |
| Status | `success`, `warning`, `danger`, `info` and their `-soft` backgrounds |
| Focus | `focus-visible:ring-2 focus-visible:ring-ring` |
| Elevation | `shadow-overlay` for floating layers |

Full list in `references/tokens.md`. Theme with `<ThemeProvider>` from `@kineticui/core/theme` (modes, accents `lime | blue | orange | rose | mint`, themes `midnight | sunset | paper | mono | forest | ocean`) or `data-theme` / `data-accent` on any element.

Typography: `font-display` (Space Grotesk; install `@fontsource-variable/space-grotesk` and import it once, otherwise it falls back to the system font) for headings with `tracking-tight`, the default sans (Inter) for body, `font-mono` (JetBrains Mono) for code, kbd and small uppercase eyebrows (`font-mono text-xs uppercase tracking-widest text-accent`). Corners are generous: `rounded-xl` for controls, `rounded-2xl` for cards. Merge classes with `cn()` from `@kineticui/core`.

## 4. Motion rules

- Use `motion/react` (not framer-motion imports) and springs (`type: "spring"`, stiffness 200 to 400, damping 20 to 35) for UI movement. Easing token: `ease-kn-out`.
- Every animation must respect reduced motion: `const reduced = useReducedMotion()` from `@kineticui/core`, then skip or shorten movement.
- Reach for an existing effect before writing one: `@kineticui/motion` has text effects, magnetic and tilt cards, marquees, beams, aurora, particles, globe, liquid glass, holo cards and more.
- Animate transform and opacity, not layout properties, except with `layout` animations.

## 5. Component conventions

- **State**: controlled or uncontrolled. `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`, `checked` / `onCheckedChange`.
- **Button**: `variant="primary | secondary | outline | ghost | soft | destructive | link"`, `size="sm | md | lg | icon | icon-sm"`, `loading`, and `asChild` to render a link: `<Button asChild><a href="/start">Start</a></Button>`.
- **Inputs**: wrap with `<Field label hint error htmlFor>`. `Input` takes `leading`, `trailing`, `invalid` and `wrapperClassName` (for layout such as `flex-1 min-w-0`).
- **Forms**: `Form`, `FormField`, `FormSubmit` from `@kineticui/ui/form` with react-hook-form (and zod via `@hookform/resolvers`).
- **Feedback**: render `<Toaster />` once, then `toast("Saved")`, `toast.success(...)`, `toast.error(...)`, `toast.loading(...)`.
- **Overlays**: `Dialog`, `DialogTrigger`, `DialogContent size="sm | md | lg | xl"`, `DialogHeader`, `DialogTitle`. Every overlay needs a title, visible or `sr-only`.
- **Icons**: `@kineticui/icons` (`<ArrowRightIcon size={16} />`). Never use emoji as icons.
- Client components start with `"use client"` when they use state, effects or motion.

## 6. Accessibility is part of done

Components handle keyboard and ARIA themselves; keep it intact. Give icon-only buttons an `aria-label`, label every field, keep focus rings, use real buttons and links, and check text contrast against `bg-surface`. Accessibility notes per component are in the docs (https://kinetic-ui.chaitanya-nk.com/components/<name>).

## 7. Example

```tsx
"use client";
import { Badge, Button, Card, Field, Input, toast } from "@kineticui/ui";
import { ArrowRightIcon } from "@kineticui/icons";

export function Invite() {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div>
        <Badge variant="soft" dot>Beta</Badge>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">Invite your team</h2>
        <p className="mt-1 text-sm text-muted">They get access as soon as they accept.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Invite sent");
        }}
      >
        <Field label="Email" htmlFor="invite" className="min-w-0 flex-1">
          <Input id="invite" type="email" required placeholder="maya@kinetic.dev" />
        </Field>
        <Button type="submit" className="self-end">
          Send <ArrowRightIcon size={16} />
        </Button>
      </form>
    </Card>
  );
}
```

## Reference files

- `references/components.md`: every component by category, with imports and install commands
- `references/props.md`: props for the core components
- `references/tokens.md`: every colour, animation and easing token
- `references/blocks-and-templates.md`: ready-made sections and whole pages

More: https://kinetic-ui.chaitanya-nk.com/docs · full LLM reference https://kinetic-ui.chaitanya-nk.com/llms-full.txt · MCP server https://kinetic-ui.chaitanya-nk.com/mcp
