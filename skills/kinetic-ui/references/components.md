# Kinetic UI components (v0.3.0)

209 components. Install source with `npx @kineticui/cli add <name>`, or import from npm as shown.

## ai

- **agent-plan**: Live checklist of an agent's steps with progress. `import { AgentPlan } from "@kineticui/ui"`
- **ai-chat**: Complete chat for the Vercel AI SDK: pass useChat() in and get streaming text, reasoning, tool calls with approvals, sources, stop, retry and errors. Includes MessageParts and a mock hook. `import { MessageParts, AIChat } from "@kineticui/ui"`
- **artifact-panel**: Side canvas for generated code and documents with preview and code tabs, version history, copy, download and full screen. `import { ArtifactPanel } from "@kineticui/ui"`
- **chat-message**: User and assistant turns with streaming caret, markdown and copy/retry/feedback. `import { SimpleMarkdown, ChatMessage } from "@kineticui/ui"`
- **citations**: Inline numbered citations with hover previews and source chips. `import { Citation, Sources } from "@kineticui/ui"`
- **context-meter**: Ring that shows how full the context window is, with token breakdown, estimated cost and a compact action. `import { ContextMeter } from "@kineticui/ui"`
- **conversation**: Chat scroll container that follows the stream, lets go when you scroll up and shows a jump-to-latest pill with a new-message count. `import { Conversation, ConversationScrollButton, ConversationEmpty } from "@kineticui/ui"`
- **message-branch**: Flip between regenerated answers or edited prompts with a directional blur slide and a 2 / 3 switcher. `import { MessageBranch, MessageBranchSelector } from "@kineticui/ui"`
- **model-selector**: Model picker with speed and intelligence meters. `import { ModelSelector } from "@kineticui/ui"`
- **prompt-box**: Chat composer with auto-grow, attachments, suggestions and stop-while-streaming. `import { PromptBox } from "@kineticui/ui"`
- **thinking-block**: Collapsible reasoning trace with live timer and shimmer. `import { ThinkingBlock } from "@kineticui/ui"`
- **tool-call**: Agent tool invocation card with input, output and approve/deny. `import { ToolCall } from "@kineticui/ui"`
- **usage-meter**: Plan usage bar with breakdown and limit warnings. `import { UsageMeter } from "@kineticui/ui"`
- **voice-input**: Mic button with live waveform and speech-to-text. `import { VoiceInput } from "@kineticui/ui"`
- **voice-orb**: A living orb for voice assistants that breathes when idle, follows the microphone, swirls while thinking and pulses with speech. `import { VoiceOrb } from "@kineticui/ui"`
- **web-preview**: Browser frame for generated apps: address bar, history, device widths, reload, loading skeleton and a console drawer. `import { WebPreview } from "@kineticui/ui"`

## collaboration

- **comment-pin**: Figma-style pins: drop, reply in threads, resolve. `import { CommentLayer } from "@kineticui/ui"`
- **comment-thread**: Threaded replies, @mention autocomplete, reactions and collapsible threads. `import { CommentThread } from "@kineticui/ui"`
- **live-cursors**: Multiplayer cursors with spring motion, name tags and chat bubbles. `import { CursorArrow, LiveCursors } from "@kineticui/ui"`
- **notification-center**: Bell inbox with unread badge, tabs, actions and dismiss. `import { NotificationCenter } from "@kineticui/ui"`
- **presence**: Who's-here facepile with status, activity tooltips and overflow. `import { Presence } from "@kineticui/ui"`
- **typing-indicator**: Bouncing dots as a bubble or 'Maya is typing'. `import { TypingIndicator } from "@kineticui/ui"`
- **version-history**: Named versions, restore and two-way compare. `import { VersionHistory } from "@kineticui/ui"`

## contact

- **chat-contact**: Conversational form that asks one question at a time, with typing dots and quick replies. `import { ChatContact } from "@kineticui/ui"`
- **compose-form**: Email-client contact form: To/From/About rows, topic chips, attachments, counter and a bot-check slot. `import { ComposeForm } from "@kineticui/ui"`
- **contact-methods**: Email, phone, WhatsApp, calendar and location cards with copy, local time and online status. `import { ContactMethods } from "@kineticui/ui"`
- **contact-widget**: Floating 'Message me' launcher with quick links and a compact form. `import { ContactWidget } from "@kineticui/ui"`
- **mac-window**: macOS window chrome with traffic lights, light/dark/auto tones and a monospace mode. `import { MacWindow } from "@kineticui/ui"`
- **social-icons**: Brand marks for LinkedIn, GitHub, X, Instagram and more, plus detectNetwork(url). `import { SocialIcon } from "@kineticui/ui"`
- **terminal-contact**: Portfolio contact card as a macOS terminal: types itself out, then takes commands (help, open, vcard, message…). `import { TerminalContact } from "@kineticui/ui"`
- **vcard**: Downloadable .vcf: buildVCard(), a Save-contact button and a flip card with a scan-to-save QR. `import { VCardButton, ContactCard } from "@kineticui/ui"`

## data

- **bar-list**: Ranked horizontal bars with labels inside: top pages, referrers, countries. Show-all toggle and shares. `import { BarList } from "@kineticui/ui"`
- **before-after**: Drag or arrow-key slider comparing two images. `import { BeforeAfter } from "@kineticui/ui"`
- **bulk-action-bar**: Floating toolbar for selected rows with select-all, shortcuts and Esc to clear. `import { BulkActionBar } from "@kineticui/ui"`
- **candlestick-chart**: OHLC candles with volume, moving averages, crosshair price readout and a last-price tag. `import { CandlestickChart } from "@kineticui/ui"`
- **carousel**: Scroll-snap carousel with swipe, arrows, dots and autoplay. `import { Carousel } from "@kineticui/ui"`
- **charts**: Dependency-free SVG bar, line, area, donut, sparkline and funnel charts, plus the shared tooltip and size helpers. `import { ChartTooltip, BarChart, LineChart, AreaChart, DonutChart, Sparkline, … } from "@kineticui/ui"`
- **code-block**: File tabs, line numbers, highlighted lines and copy, with a tiny built-in highlighter. `import { CodeBlock } from "@kineticui/ui"`
- **data-table**: Sortable, searchable, paginated table with row selection and bulk actions. `import { DataTable } from "@kineticui/ui"`
- **diff-viewer**: Unified and split code diff with +/- stats. `import { DiffViewer } from "@kineticui/ui"`
- **file-preview**: Previews images, PDF, video, audio, code and CSV with download. `import { FilePreview } from "@kineticui/ui"`
- **filter-builder**: Field / operator / value rules joined by AND or OR, with chips and applyFilters(). `import { FilterBuilder } from "@kineticui/ui"`
- **gantt**: Project timeline with progress, milestones and a today marker. `import { Gantt } from "@kineticui/ui"`
- **gauge**: Speedometer gauge with coloured zones, a springy needle, counting value and zone label. `import { Gauge } from "@kineticui/ui"`
- **heatmap**: GitHub-style contribution calendar with tooltips. `import { Heatmap } from "@kineticui/ui"`
- **invoice-preview**: Printable invoice with tax, status stamp and save-as-PDF. `import { InvoicePreview } from "@kineticui/ui"`
- **json-viewer**: Collapsible, syntax-coloured JSON with copy-path. `import { JsonViewer } from "@kineticui/ui"`
- **kanban**: Drag-and-drop board with WIP limits and keyboard moves. `import { Kanban } from "@kineticui/ui"`
- **leaderboard**: Ranked list with medals, movement and animated re-ordering. `import { Leaderboard } from "@kineticui/ui"`
- **log-viewer**: Terminal-style log stream with level filters, search and follow. `import { LogViewer } from "@kineticui/ui"`
- **month-calendar**: Month grid with event chips, multi-day events, +N more and today ring. `import { MonthCalendar } from "@kineticui/ui"`
- **node-editor**: A node-graph editor: drag nodes, wire outputs to inputs with bezier cables, pan, zoom, minimap and live run states. Great for AI and automation workflows. `import { NodeEditor } from "@kineticui/ui"`
- **org-chart**: Collapsible organisation tree with connectors and team counts. `import { OrgChart } from "@kineticui/ui"`
- **progress-steps**: Milestones with nested sub-tasks and per-step progress. `import { ProgressSteps } from "@kineticui/ui"`
- **radar-chart**: Spider chart for comparing series across dimensions, with springy polygons and legend highlighting. `import { RadarChart } from "@kineticui/ui"`
- **sankey-chart**: A flow diagram where values split and merge across stages. Hover a node or band to trace its path. `import { SankeyChart } from "@kineticui/ui"`
- **scatter-chart**: Scatter and bubble chart with least-squares trend lines, crosshair and tooltips. `import { ScatterChart } from "@kineticui/ui"`
- **sortable-list**: Drag-to-reorder list with spring layout, lifted shadows and full keyboard reordering with live announcements. `import { SortableList, SortableHandle, SortableEmpty } from "@kineticui/ui"`
- **split-compare**: Two resizable panes with a draggable divider and synced scroll. `import { SplitCompare } from "@kineticui/ui"`
- **stat-card**: KPI tile with value, trend delta and optional sparkline. `import { StatCard } from "@kineticui/ui"`
- **timeline**: Vertical activity feed with tones, icons and rich content. `import { Timeline } from "@kineticui/ui"`
- **tree-view**: File-tree hierarchy with full keyboard navigation. `import { TreeView } from "@kineticui/ui"`
- **treemap**: Squarified treemap with hover focus and click-to-zoom drilldown with breadcrumbs. `import { Treemap } from "@kineticui/ui"`
- **uptime-bars**: Status-page uptime history with per-day tooltips. `import { UptimeBars } from "@kineticui/ui"`
- **virtual-list**: Dependency-free windowing for 100,000+ rows, with a sticky-header sortable table. `import { VirtualList, VirtualTable } from "@kineticui/ui"`
- **week-calendar**: Week agenda with hour grid, overlap layout and now-line. `import { WeekCalendar } from "@kineticui/ui"`
- **world-map**: Dotted world map with pulsing markers, tooltips and animated arcs. No tiles needed. `import { WorldMap } from "@kineticui/ui"`

## effects

- **animated-beam**: Curved light beams between elements, for showing data flowing between services, logos or people. `import { AnimatedBeam, BeamNode } from "@kineticui/motion"`
- **aurora-background**: Slow northern-lights glow for heroes. CSS only and theme-aware. `import { AuroraBackground } from "@kineticui/motion"`
- **backgrounds**: Animated GridBackground and DotBackground. `import { GridBackground, DotBackground } from "@kineticui/motion"`
- **blur-text**: Headline that resolves from a blur word by word or letter by letter as it scrolls into view. `import { BlurText } from "@kineticui/motion"`
- **border-beam**: A beam of light orbiting a card's edge. `import { BorderBeam } from "@kineticui/motion"`
- **confetti**: useConfetti() hook and ConfettiButton. `import { ConfettiButton } from "@kineticui/motion"`
- **globe**: Dotted world globe on canvas with pulsing markers, travelling arcs and drag to spin. No map libraries. `import { Globe } from "@kineticui/motion"`
- **gradient-text**: Text filled with a slowly flowing gradient in any colours. `import { GradientText } from "@kineticui/motion"`
- **kinetic-type**: Letters that swell, grow or ripple as the cursor passes, using variable font weight. 60fps, no re-renders. `import { KineticType } from "@kineticui/motion"`
- **liquid-glass**: Glass that refracts what's behind it at the edges, with colour dispersion and a specular rim. Real refraction in Chromium, frosted fallback elsewhere. `import { LiquidGlass } from "@kineticui/motion"`
- **magnetic**: Child leans toward the pointer, then springs back. `import { Magnetic } from "@kineticui/motion"`
- **marquee**: Infinite scrolling row that pauses on hover. `import { Marquee } from "@kineticui/motion"`
- **meteors**: Shooting stars streaking across a card or hero, SSR-safe. `import { Meteors } from "@kineticui/motion"`
- **number-ticker**: Counts up when scrolled into view. `import { NumberTicker } from "@kineticui/motion"`
- **orbiting-circles**: Icons orbiting a centre logo on dashed rings, in either direction. CSS only. `import { OrbitingCircles } from "@kineticui/motion"`
- **parallax**: Layers that move at different speeds as a section scrolls. `import { Parallax } from "@kineticui/motion"`
- **particles**: Drifting, twinkling particle field that parts around the pointer, with an optional constellation mode. `import { Particles } from "@kineticui/motion"`
- **rotating-words**: Swaps a word in place with a slide-up spring. `import { RotatingWords } from "@kineticui/motion"`
- **scroll-reveal**: Fade-and-lift on first scroll into view. `import { ScrollReveal } from "@kineticui/motion"`
- **shiny-text**: A light sweep across text. `import { ShinyText } from "@kineticui/motion"`
- **spotlight-card**: A card whose glow follows the pointer. `import { SpotlightCard } from "@kineticui/motion"`
- **text-scramble**: Decoder-style reveal where random glyphs settle into text. `import { TextScramble } from "@kineticui/motion"`
- **tilt-card**: 3D tilt that follows the pointer. `import { TiltCard } from "@kineticui/motion"`
- **typewriter**: Types, deletes and cycles through words. `import { Typewriter } from "@kineticui/motion"`

## feedback

- **activity-feed**: Grouped activity stream with filters and live arrivals. `import { ActivityFeed } from "@kineticui/ui"`
- **alert**: Four-tone alerts and an EmptyState block. `import { Alert, EmptyState } from "@kineticui/ui"`
- **announcement-banner**: Top-of-page banner with tag, link and remembered dismissal. `import { AnnouncementBanner } from "@kineticui/ui"`
- **cookie-consent**: Cookie banner as a corner card, bottom bar or modal, with per-category preferences. `import { CookieConsent } from "@kineticui/ui"`
- **countdown**: Live countdown with rolling digits for launches and sales. `import { Countdown } from "@kineticui/ui"`
- **onboarding-checklist**: Get-started tasks with progress ring, CTAs and a reward state. `import { OnboardingChecklist } from "@kineticui/ui"`
- **progress**: Linear, striped, indeterminate, ring and shimmer Skeleton. `import { Progress, ProgressRing, Skeleton } from "@kineticui/ui"`
- **rating-summary**: Average with partial stars, clickable distribution and aspect scores. `import { RatingSummary } from "@kineticui/ui"`
- **skeletons**: Card, profile, list, table and dashboard loading placeholders. `import { Bone, SkeletonText, SkeletonCard, SkeletonProfile, SkeletonList, SkeletonTable, … } from "@kineticui/ui"`
- **spinner**: Ring spinner and bouncing-dots loader. `import { Spinner, DotsLoader } from "@kineticui/ui"`
- **toast**: Toasts with success/error/warning/info/loading tones, toast.promise, in-place updates, stacking, swipe and a pausable countdown bar. `import { Toaster } from "@kineticui/ui"`
- **top-loader**: NProgress-style page bar driven by topLoader.start/done/track. `import { TopLoader } from "@kineticui/ui"`
- **whats-new**: Release dialog with swipeable feature slides and seen-version memory. `import { WhatsNew } from "@kineticui/ui"`

## forms

- **address-autocomplete**: Pluggable geocoder search with keyboard nav, highlights and current location. `import { AddressAutocomplete } from "@kineticui/ui"`
- **autocomplete**: Suggestions list with highlighted matches, sync or async data. `import { Autocomplete } from "@kineticui/ui"`
- **calendar**: Calendar, DatePicker and DateRangePicker with presets. No date library. `import { Calendar, DatePicker, DateRangePicker } from "@kineticui/ui"`
- **card-input**: Card number, expiry and CVC with brand detection and Luhn check. `import { CardInput } from "@kineticui/ui"`
- **checkbox**: Animated tick, indeterminate state, optional label and description. `import { Checkbox } from "@kineticui/ui"`
- **code-editor**: Highlighted code editing with line numbers, smart indent and auto-closing pairs. `import { CodeEditor } from "@kineticui/ui"`
- **color-picker**: Saturation area, hue slider, hex field, eyedropper and swatches. `import { ColorPicker } from "@kineticui/ui"`
- **combobox**: Searchable select; set multiple for tag-style multi-select, with create. `import { Combobox } from "@kineticui/ui"`
- **currency-input**: Formats money as you type per currency and locale, with presets and limits. `import { CurrencyInput } from "@kineticui/ui"`
- **emoji-picker**: Searchable emoji picker with recents, plus Slack-style reaction chips. `import { EmojiPicker, ReactionBar } from "@kineticui/ui"`
- **file-dropzone**: Drag-and-drop uploads with validation, plus FileItem progress rows. `import { FileDropzone, FileItem } from "@kineticui/ui"`
- **font-picker**: Font chooser with categories, live preview text and optional Google Fonts loading. `import { FontPicker } from "@kineticui/ui"`
- **gradient-picker**: Draggable stops, linear/radial/conic, angle dial, presets and copy CSS. `import { GradientPicker } from "@kineticui/ui"`
- **inline-edit**: Click text to edit in place. Enter saves, Escape cancels. `import { InlineEdit } from "@kineticui/ui"`
- **input**: Input, Textarea, Label and Field with leading/trailing slots and states. `import { Input, Textarea, Label, Field } from "@kineticui/ui"`
- **markdown-editor**: Markdown with toolbar, shortcuts and a safe live preview (split or tabs). Exports <Markdown>. `import { Markdown, MarkdownEditor } from "@kineticui/ui"`
- **mention-input**: Textarea where @ opens a people picker. `import { MentionInput } from "@kineticui/ui"`
- **number-input**: −/+ stepper with arrow-key support and clamping. `import { NumberInput } from "@kineticui/ui"`
- **otp-input**: One-time-code boxes with auto-advance and paste. `import { OtpInput } from "@kineticui/ui"`
- **passkey-login**: Passwordless sign-in with passkey and a magic-link fallback. `import { PasskeyLogin } from "@kineticui/ui"`
- **password-input**: Show/hide toggle with a live strength meter and rule checklist. `import { PasswordInput } from "@kineticui/ui"`
- **phone-input**: Country picker with auto-formatting and E.164 output. `import { PhoneInput } from "@kineticui/ui"`
- **radio-group**: Radio, RadioGroup and selectable RadioCard. `import { RadioGroup, Radio, RadioCard } from "@kineticui/ui"`
- **rating**: Star rating with hover preview, labels and keyboard support. `import { Rating } from "@kineticui/ui"`
- **rich-text-editor**: WYSIWYG editor with toolbar, shortcuts, plain-text paste and word count. `import { RichTextEditor } from "@kineticui/ui"`
- **search-input**: Search field with clear button, / shortcut and result count. `import { SearchInput } from "@kineticui/ui"`
- **select**: Custom select with groups, icons and descriptions. `import { Select } from "@kineticui/ui"`
- **signature-pad**: Draw a signature with mouse, pen or finger; export as PNG. `import { SignaturePad } from "@kineticui/ui"`
- **slider**: Single or range slider with value bubble. `import { Slider } from "@kineticui/ui"`
- **switch**: Spring-loaded toggle with optional label. `import { Switch } from "@kineticui/ui"`
- **tag-input**: Enter or comma to add, backspace twice to remove, suggestions. `import { TagInput } from "@kineticui/ui"`
- **time-picker**: Scroll-wheel hours, minutes and AM/PM. `import { TimePicker } from "@kineticui/ui"`
- **time-range-slider**: Dual-thumb time picker with busy blocks, ticks and duration. `import { TimeRangeSlider } from "@kineticui/ui"`
- **toggle-group**: Pressable button group, single or multiple. `import { ToggleGroup, ToggleGroupItem } from "@kineticui/ui"`
- **tree-select**: Hierarchical picker with search highlighting, tri-state parent checkboxes and animated chips. `import { TreeSelect } from "@kineticui/ui"`
- **upload-queue**: Upload queue with concurrency, progress, speed, pause/resume, retry and totals. `import { UploadQueue } from "@kineticui/ui"`
- **form**: React Hook Form wiring with any schema: animated errors, shake on failed submit, valid checks, error summary and a stateful submit button. `import { Form, FormField, FormSubmit, FormErrorSummary } from "@kineticui/ui/form"`

## foundations

- **accordion**: Animated height accordion with rotating plus icon. `import { Accordion, AccordionItem } from "@kineticui/ui"`
- **avatar**: Avatar with status and ring, plus a fan-out AvatarStack. `import { Avatar, AvatarStack } from "@kineticui/ui"`
- **badge**: Eight tones with optional pulsing dot, plus keyboard keys. `import { Badge, Kbd } from "@kineticui/ui"`
- **button-group**: Join buttons, inputs and menus into one control: split buttons, steppers and prefixed fields. `import { ButtonGroup, ButtonGroupText } from "@kineticui/ui"`
- **button**: Seven variants, five sizes, loading state and press spring. `import { Button } from "@kineticui/ui"`
- **card**: Card with header, title, description and footer, plus Separator. `import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Separator } from "@kineticui/ui"`
- **collapsible**: A single show/hide section with spring height and a rotating chevron. `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@kineticui/ui"`
- **copy-button**: Copy to clipboard with an animated check confirmation. `import { CopyButton } from "@kineticui/ui"`
- **theme-switch**: Animated sun/moon toggle or Light/Dark/System segmented control. `import { ThemeSwitch } from "@kineticui/ui"`

## layout

- **resizable**: Nested resizable panel groups with collapsible panes, keyboard resizing, double-click reset and saved layouts. `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@kineticui/ui"`
- **scroll-area**: Slim custom scrollbars that grow on hover, with edge fades that appear only where content continues. `import { ScrollArea, ScrollBar } from "@kineticui/ui"`

## marketing

- **device-mockup**: Phone, laptop, tablet and browser frames for screenshots or live UI. `import { PhoneMockup, BrowserMockup, LaptopMockup, TabletMockup } from "@kineticui/motion"`
- **scroll-showcase**: Product screenshot that swings from tilted to flat as it scrolls into view, with a rising title. `import { ScrollShowcase } from "@kineticui/motion"`

## media

- **audio-player**: Waveform player with scrubbing, keyboard seek and speed. `import { AudioPlayer } from "@kineticui/ui"`
- **audio-recorder**: Voice notes with live waveform, pause, playback and download. `import { AudioRecorder } from "@kineticui/ui"`
- **avatar-uploader**: Click or drop to upload with a progress ring. `import { AvatarUploader } from "@kineticui/ui"`
- **image-cropper**: Pan-and-zoom cropper with round mask and export. `import { ImageCropper } from "@kineticui/ui"`
- **masonry**: Ordered masonry grid with fade-in on scroll. `import { Masonry } from "@kineticui/ui"`
- **qr-code**: Dependency-free QR encoder with dots style and centre logo. `import { QrCode } from "@kineticui/ui"`
- **video-player**: Custom controls, chapters, buffer bar, PiP and fullscreen. `import { VideoPlayer } from "@kineticui/ui"`

## mobile

- **action-sheet**: Draggable bottom sheet of actions with cancel. `import { ActionSheet } from "@kineticui/ui"`
- **pull-to-refresh**: Pull down from the top to refresh, with a filling spinner. `import { PullToRefresh } from "@kineticui/ui"`
- **swipe-actions**: iOS-style swipeable rows with full-swipe to trigger. `import { SwipeActions } from "@kineticui/ui"`
- **swipe-card-stack**: Drag or tap to like/pass through a stack, with undo. `import { SwipeCardStack } from "@kineticui/ui"`

## navigation

- **back-to-top**: Floating scroll-to-top button with a reading-progress ring. `import { BackToTop } from "@kineticui/ui"`
- **bottom-tab-bar**: Mobile tab bar with a sliding active pill and badges. `import { BottomTabBar } from "@kineticui/ui"`
- **breadcrumb**: Slash or chevron breadcrumbs that collapse long paths. `import { Breadcrumb } from "@kineticui/ui"`
- **command-bar**: Floating tool dock with sliding indicator and single-key shortcuts. `import { CommandBar } from "@kineticui/ui"`
- **mega-menu**: Website navigation with large multi-column dropdown panels. `import { MegaMenu } from "@kineticui/ui"`
- **menubar**: Desktop-style application menus with submenus, shortcuts, checkbox and radio items. `import { Menubar, MenubarMenu, MenubarGroup, MenubarSub, MenubarRadioGroup, MenubarTrigger, … } from "@kineticui/ui"`
- **mobile-menu**: Morphing hamburger that opens a full-screen menu with staggered links. `import { MobileMenu } from "@kineticui/ui"`
- **navbar**: Pill navbar with sliding hover highlight that hides while scrolling down. `import { Navbar } from "@kineticui/ui"`
- **overflow-tabs**: Tabs that fold extras into a More menu as space shrinks. `import { OverflowTabs } from "@kineticui/ui"`
- **page-header**: Breadcrumbs, icon, title, badges, actions, meta and tabs. `import { PageHeader } from "@kineticui/ui"`
- **pagination**: Numbered pagination with smart gaps. `import { Pagination } from "@kineticui/ui"`
- **shortcut-overlay**: Press ? for all shortcuts; useHotkeys supports combos and sequences. `import { Keys, ShortcutOverlay } from "@kineticui/ui"`
- **sidebar**: App sidebar with sections, badges, footer slot and collapse-to-icons. `import { Sidebar, SidebarSection, SidebarItem } from "@kineticui/ui"`
- **speed-dial**: Floating action button that fans out labelled actions. `import { SpeedDial } from "@kineticui/ui"`
- **stepper**: Numbered steps with a filling connector. `import { Stepper } from "@kineticui/ui"`
- **table-of-contents**: On-this-page list that highlights the section you're reading. `import { TableOfContents } from "@kineticui/ui"`
- **tabs**: Tabs with a gliding indicator, and a SegmentedControl. `import { Tabs, TabsList, TabsTrigger, TabsContent, SegmentedControl } from "@kineticui/ui"`

## overlay

- **alert-dialog**: Blocking confirmation with tones, async confirm and type-to-confirm. `import { ConfirmDialog } from "@kineticui/ui"`
- **context-menu**: Right-click menu with shortcuts, submenus and destructive items. `import { ContextMenu, ContextMenuTrigger, ContextMenuSub, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, … } from "@kineticui/ui"`
- **dialog**: Modal dialog that springs in, plus Sheet (side and bottom drawers). `import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, … } from "@kineticui/ui"`
- **dropdown-menu**: Menus with shortcuts, checkbox and radio items, and submenus. `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuRadioGroup, DropdownMenuContent, … } from "@kineticui/ui"`
- **hover-card**: Rich preview card on hover or focus, with intent delay. `import { HoverCard } from "@kineticui/ui"`
- **lightbox**: Image grid with full-screen viewer, swipe, keys and thumbnails. `import { Lightbox } from "@kineticui/ui"`
- **popover**: Anchored floating panel with optional arrow. `import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "@kineticui/ui"`
- **tooltip**: Zero-setup tooltip with arrow and keyboard shortcut slot. `import { Tooltip } from "@kineticui/ui"`
- **tour**: Spotlight onboarding tour with animated cutout and step dots. `import { Tour } from "@kineticui/ui"`

## playful

- **receipt-printer**: A thermal receipt that prints line by line out of a slot, totals worked out for you, then tears off. `import { ReceiptPrinter } from "@kineticui/ui"`
- **stories**: Story rings and a full-screen player with segmented progress, tap to skip, hold to pause and a cube turn between people. `import { StoryPlayer, StoryRing, Stories } from "@kineticui/ui"`
- **ticket**: An event ticket with a QR stub on a perforated edge. Drag the stub across the perforation to tear it off. `import { Ticket } from "@kineticui/ui"`
- **gravity-box**: Drop tags, pills or avatars into a box and they tumble, stack and rotate with real physics. Drag and throw them. `import { GravityBox, GravityPill } from "@kineticui/motion"`
- **holo-card**: A collectible-card holographic foil: rainbow sheen, sparkle and glare that shift as the card tilts toward the pointer. `import { HoloCard } from "@kineticui/motion"`

## signature

- **command-palette**: ⌘K palette with fuzzy search, groups and shortcuts. `import { CommandPalette } from "@kineticui/ui"`
- **dock**: macOS-style dock with cursor magnification. `import { Dock, DockItem } from "@kineticui/ui"`
- **dynamic-island**: A black pill that morphs between live activities like a phone's status area: music, timers, uploads, calls and AI thinking. Tap to expand. `import { DynamicIsland } from "@kineticui/ui"`
- **morph-surface**: A button that physically morphs into a panel or form and back, with a check-mark success state. `import { MorphSurface, MorphSurfaceHeader } from "@kineticui/ui"`
- **theme-ripple**: Switch light and dark with a circular reveal that spreads from the click, using View Transitions. Also powers ThemeSwitch. `import { ThemeRippleButton } from "@kineticui/ui"`
- **ui-sounds**: Subtle interface sounds synthesised in the browser: tap, toggle, pop, success, error, notify, whoosh. No audio files, off by default. `import { SoundProvider, SoundToggle } from "@kineticui/ui"`

## social

- **changelog**: Release notes with versions, media and typed change lists. `import { Changelog } from "@kineticui/ui"`
- **feature-voting**: Upvotable roadmap requests with sort and status filter. `import { FeatureVoting } from "@kineticui/ui"`
- **mood-picker**: Five drawn faces that animate and colour in when picked. `import { MoodPicker } from "@kineticui/ui"`
- **nps**: 0–10 Net Promoter Score with follow-up and thank-you state. `import { NpsSurvey } from "@kineticui/ui"`
- **profile-hover-card**: Hover a name for cover, bio, stats, mutuals and a Follow button. `import { ProfileHoverCard } from "@kineticui/ui"`
- **reviews**: Rating summary with distribution filter and review cards. `import { Reviews } from "@kineticui/ui"`
- **share-sheet**: Copy link, QR code, social targets, native share and access settings. `import { ShareSheet } from "@kineticui/ui"`
