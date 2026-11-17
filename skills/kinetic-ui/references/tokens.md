# Design tokens

Colours are CSS variables that switch with light mode, accents and themes. Use them through the Tailwind names (`bg-surface`, `text-muted`, `border-border`).

## Colours

| Tailwind name | Variable |
| --- | --- |
| `code` | `--kn-code-bg` |
| `code-foreground` | `--kn-code-foreground` |
| `code-muted` | `--kn-code-muted` |
| `code-border` | `--kn-code-border` |
| `code-string` | `--kn-code-string` |
| `code-tag` | `--kn-code-tag` |
| `code-number` | `--kn-code-number` |
| `code-function` | `--kn-code-function` |
| `background` | `--kn-background` |
| `surface` | `--kn-surface` |
| `surface-raised` | `--kn-surface-raised` |
| `surface-overlay` | `--kn-surface-overlay` |
| `border` | `--kn-border` |
| `border-strong` | `--kn-border-strong` |
| `foreground` | `--kn-foreground` |
| `muted` | `--kn-muted` |
| `subtle` | `--kn-subtle` |
| `accent` | `--kn-accent` |
| `accent-foreground` | `--kn-accent-foreground` |
| `accent-soft` | `--kn-accent-soft` |
| `accent-soft-foreground` | `--kn-accent-soft-foreground` |
| `success` | `--kn-success` |
| `success-soft` | `--kn-success-soft` |
| `warning` | `--kn-warning` |
| `warning-soft` | `--kn-warning-soft` |
| `danger` | `--kn-danger` |
| `danger-soft` | `--kn-danger-soft` |
| `info` | `--kn-info` |
| `info-soft` | `--kn-info-soft` |
| `ring` | `--kn-ring` |

## Animations

- `animate-kn-spin`: `kn-spin 0.8s linear infinite`
- `animate-kn-pulse`: `kn-pulse 1.4s ease-in-out infinite`
- `animate-kn-shimmer`: `kn-shimmer 1.6s linear infinite`
- `animate-kn-marquee`: `kn-marquee var(--kn-marquee-duration, 30s) linear infinite`
- `animate-kn-indeterminate`: `kn-indeterminate 1.4s ease-in-out infinite`
- `animate-kn-shine`: `kn-shine 3s linear infinite`
- `animate-kn-beam`: `kn-beam var(--kn-beam-duration, 4s) linear infinite`
- `animate-kn-grid`: `kn-grid 3s linear infinite`
- `animate-kn-caret`: `kn-caret 0.9s step-end infinite`

## Easing

- `ease-kn-out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `ease-kn-spring`: `cubic-bezier(0.2, 0.9, 0.3, 1.2)`

## Themes

- Light mode: the `light` class on `<html>` (ThemeProvider handles it).
- Accents: `data-accent="lime | blue | orange | rose | mint"`.
- Full themes: `data-theme="midnight | sunset | paper | mono | forest | ocean"`, on `<html>` or any section.
- Custom: `createTheme({ mode, background, foreground, accent })` and `themeToCss()` from `@kineticui/core`, or the editor at https://kinetic-ui.chaitanya-nk.com/themes.
