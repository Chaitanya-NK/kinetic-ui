# Changelog

All packages (`@kineticui/core`, `icons`, `motion`, `ui`, `blocks`, `cli`, `mcp`) share one version number.

## [Unreleased]

### Added
- CLI: `kinetic diff` shows what changed upstream since you added a component, and `kinetic update` pulls fixes in with a three-way merge that keeps your edits. Lines changed on both sides get git-style conflict markers. `add` and `update` now keep install records in `.kinetic/` (commit it). New "Updating components" docs page.
- Agent Skill for Claude and Cursor, generated from the registry (`skills/kinetic-ui`). Install it with `npx @kineticui/cli skill`, or download the zip for the Claude app from the AI tools page.

- Figma kit: a plugin (`figma/`) that builds variables with dark and light modes, text styles, all 348 icons and the core components as variant sets, generated from the same tokens and icons as the code. Download it from the new Figma kit docs page.
- Tests in CI: axe accessibility checks (WCAG 2.1 AA) and visual snapshots for every demo, block and template, plus a workflow that records new baselines and opens a pull request.

### Fixed
- Accessibility fixes found by the new checks, across about 50 components and blocks: progress bars and sliders now have names; selects, combobox and tree-select are labelled properly; the calendar is a valid grid; text effects (Blur Text, Kinetic Type, Text Scramble) expose their text without ARIA misuse; label and visible text now match on story rings, votes, comment pins, phone input and more; scrollable code blocks, carousels and scroll areas can be reached by keyboard; the marquee's duplicate copy is inert; lists and definition lists are well formed; low-contrast text fixed in code blocks, logs, Gantt, Treemap, receipts and the light theme's subtle text.
- `SegmentedControl` options take an `ariaLabel` for icon-only segments.
- `font-display` now works outside the docs site: core styles define it (Space Grotesk when loaded, else the system font).

## [0.3.0] — 2026-11-17

### Added
- Signature components: `DynamicIsland` (with `islandMusic`, `islandTimer`, `islandUpload`, `islandCall` and `islandThinking` presets), `MorphSurface` (a pill that morphs into a panel and back), `useThemeRipple` / `ThemeRippleButton` (theme changes spread out from the pointer using View Transitions), and UI sounds (`SoundProvider`, `useSound`, `playSound`, `SoundToggle`: synthesised with WebAudio, no audio files, off by default).
- Playful components: `HoloCard` (holographic foil with rainbow, sparkle and line patterns), `Ticket` (perforated QR stub you drag to tear off), `GravityBox` / `GravityPill` (tags that tumble and stack with physics; drag and throw), `Stories` / `StoryPlayer` / `StoryRing` (story rings and a player with tap, hold-to-pause and a cube turn between people) and `ReceiptPrinter` (a receipt that prints line by line, totals worked out, then tears off). New Playful category in the docs.
- `NodeEditor`: a node-graph editor with draggable nodes, bezier wires from outputs to inputs (pick a wire up from an input to move it), pan, Ctrl/pinch zoom, fit to view, a draggable minimap, keyboard moves and deletes, and running/done/error states with animated wires.
- `VoiceOrb` and `useMicrophoneLevel`: an orb for voice assistants with idle, listening, thinking and speaking states that follows the microphone level.
- `SankeyChart`: flows across stages with automatic column layout, gradient or source-coloured bands, and hover tracing.
- Templates: **Link in Bio** (holographic profile card, story highlights, a now-playing Dynamic Island, animated links, newsletter and optional sounds) and **Event Page** (countdown, globe of attendee cities, speakers, two-day agenda, ticket tiers, a tear-off pass and FAQ).
- Effects: `LiquidGlass` (refracting glass using an SVG displacement map in Chromium, with a frosted fallback elsewhere) and `KineticType` (variable-font weight, lens and wave effects that follow the pointer).

### Changed
- `ThemeSwitch` now uses the ripple transition. Pass `ripple={false}` for an instant switch.

## [0.2.1] — 2026-11-17

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
