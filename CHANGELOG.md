# Changelog

All packages (`@kineticui/core`, `icons`, `motion`, `ui`, `blocks`, `cli`, `mcp`) share one version number.

## [Unreleased]

### Fixed
- Code surfaces follow the theme. New `--kn-code-*` tokens (with Tailwind colours `code`, `code-foreground`, `code-muted`, `code-border`, `code-string`, `code-tag`, `code-number`, `code-function`) give light and dark code colours, used by `CodeBlock`, `CodeEditor`, `LogViewer`, `FilePreview` and code inside `ChatMessage`. Previously these stayed dark in light mode.

## [0.2.0] — 2026-11-16

### Added
- `@kineticui/ui/form`: `Form`, `FormField`, `FormSubmit`, `FormErrorSummary` built on React Hook Form (optional peer dependency); works with zod, valibot or any resolver.
- `SortableList` with keyboard reordering, `ResizablePanelGroup` / `ResizablePanel` / `ResizableHandle`, `VirtualList` and `VirtualTable`, `ButtonGroup`, `Menubar`, `ScrollArea`, `Collapsible` and `TreeSelect`.
- AI: `AIChat` and `MessageParts` for the Vercel AI SDK (pass `useChat()` in; no runtime dependency on the SDK), `useMockChat`, `Conversation` with stick-to-bottom scrolling, `MessageBranch`, `WebPreview`, `ArtifactPanel` and `ContextMeter`.
- Motion: `AnimatedBeam` / `BeamNode`, `Globe` (canvas, built-in land map), `PhoneMockup` / `LaptopMockup` / `TabletMockup` / `BrowserMockup`, `AuroraBackground`, `Particles`, `Meteors`, `GradientText`, `BlurText`, `OrbitingCircles` and `ScrollShowcase`.
- Charts: `RadarChart`, `ScatterChart` (bubbles, trend lines), `Gauge`, `Treemap` (drilldown), `CandlestickChart` (volume, moving averages) and `BarList`. `charts` now also exports `ChartTooltip`, `useChartSize` and `defaultFormat`.
- Templates: `saas-landing`, `portfolio`, `saas-dashboard`, `ai-chatbot` and `docs-site`, installed with `kinetic add <name>` and previewed at `/templates`.
- CLI: installs template pages at the project root (or `src/app`) and points their imports at your components folder.
- `@kineticui/mcp`: MCP server for AI coding tools (`npx -y @kineticui/mcp`), also hosted at `/mcp` on the docs site. Tools: search, list, get component, install command and setup.
- Docs: usage snippets on component pages, an AI tools page, `llms.txt`, `llms-full.txt` and per-item Markdown at `/md/<name>.md`. Registry items now carry `meta.package` and `meta.exports`.

## [0.1.1] — 2026-11-15

### Fixed

- `kinetic list`: the name column now fits the longest name, so long names like `notification-preferences` no longer run into their descriptions.
- Package metadata: repository URLs use the canonical `git+https` form, so npm no longer rewrites them on publish.

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
