# Changelog

All packages (`@kineticui/core`, `icons`, `motion`, `ui`, `blocks`, `cli`) share one version number.

## [0.1.0] — 2026-11-15

First public release.

### Components (`@kineticui/ui`, `@kineticui/motion`)

- 164 motion-first components across forms, editors, navigation, overlays, data display, AI, collaboration, social, media, mobile, contact and feedback.
- Editors: rich text, Markdown and code editor, emoji picker with reactions, currency, gradient and font pickers.
- Data: data table, charts, heatmap, Kanban, Gantt, world map, org chart, diff and log viewers, filter builder with `applyFilters()`.
- Mixed components: share sheet with QR code, bulk action bar, upload queue with pause/resume/retry, threaded comments with @mentions, passkey login with magic-link fallback, profile hover card.
- Contact: terminal contact card, email-style compose form, downloadable vCard, contact widget.
- Toasts with promise, loading, actions, pause on hover and update-in-place.
- 14 motion effects, including Spotlight Card, Border Beam, Marquee, Text Scramble and Parallax.

### Blocks (`@kineticui/blocks`)

- 78 ready-made blocks: app screens (dashboard, billing, admin users, API keys, roles, CRM), marketing pages (heroes, pricing, blog, docs, careers, case study, changelog, roadmap), commerce screens (product listing, wishlist, orders, returns) and personal-site widgets (printable résumé, GitHub graph, /now).

### Theming (`@kineticui/core`)

- Six full theme presets: midnight, sunset, paper, mono, forest and ocean, via `data-theme` or `<ThemeProvider defaultTheme>`.
- `createTheme()` derives every token from background, foreground and accent; `themeToCss()`, `themeToStyle()` and `contrast()` helpers.
- Five accent presets and light/dark modes.

### Icons and CLI

- 348 original 24 px stroke icons (`@kineticui/icons`).
- `npx @kineticui/cli init | add | list` copies source into your project from a shadcn-compatible registry and installs dependencies.
