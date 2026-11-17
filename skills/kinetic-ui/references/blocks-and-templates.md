# Blocks and templates

## Blocks

78 full sections. Install with `npx @kineticui/cli add <name>` or import from `@kineticui/blocks`.

### app

- **admin-users**: User table with search, filters, inline role changes and a bulk action bar.
- **ai-workspace**: Chat app with threads, streaming answers, reasoning, tool calls and usage.
- **analytics-funnel**: Conversion funnel with drop-off, KPIs, step inspector and source split.
- **api-keys**: Masked keys, create dialog with scopes and env, one-time reveal and revoke.
- **auth-card**: Sign in / sign up with social providers, validation and animated mode switch.
- **billing-page**: Plan usage, card, monthly/yearly plan switcher and invoices.
- **checkout-page**: Contact, delivery and card payment with a live order summary and coupons.
- **contact-page**: Terminal contact card, contact methods and an email-style compose form side by side.
- **crm-contact**: Contact profile, clickable deal pipeline and an activity timeline with notes.
- **dashboard-shell**: Sidebar app shell with KPIs, charts, notifications and recent orders.
- **email-builder**: Drag-to-reorder email blocks, inline editing, device preview and brand colour.
- **invite-team**: Invite by email with roles, manage members, copy an invite link.
- **notification-preferences**: Per-event channel toggles, channel masters, quiet hours and digest frequency.
- **onboarding-wizard**: Three-step setup with sliding panels and a confetti finish.
- **project-board**: Team board with presence, search, views and drag-and-drop Kanban.
- **settings-page**: Section nav, profile, toggles, billing, danger zone and an unsaved-changes bar.
- **team-roles**: Roles × permissions matrix with locked owner, change highlights and save bar.

### marketing

- **about-page**: Mission, animated counters, story timeline, values and hiring CTA.
- **blog-index**: Featured post, tag filter with sliding pill, search and an animated card grid.
- **blog-post**: Article with reading progress, sticky table of contents, code sample, likes and author card.
- **careers-page**: Mission header, perks and a filterable list of expandable job rows.
- **case-study**: Parallax hero, challenge/approach/result, metric chart, pull quote and sticky facts.
- **changelog-page**: Release cards with sticky versions, typed entries, filters and subscribe.
- **cta-banner**: Closing CTA in a glowing, beam-bordered panel.
- **docs-layout**: Docs sidebar with active indicator, breadcrumbs, code tabs, feedback and prev/next.
- **experience-timeline**: Alternating timeline whose spine fills as you scroll.
- **faq-section**: Searchable accordion FAQ with a contact card.
- **features-bento**: Bento grid of features with live mini-visuals and cursor spotlight.
- **footer-big-cta**: Statement footer with an oversized outlined brand word.
- **footer-columns**: Newsletter, four link columns, socials, status, theme and language.
- **footer-simple**: One-line footer with brand, links and copyright.
- **hero-centered**: Announcement pill, rotating headline word, magnetic CTAs, install command and social proof.
- **hero-gradient-mesh**: Shimmering headline over a slowly drifting blurred gradient mesh.
- **hero-product-shot**: Large app screenshot in a browser frame that flattens as you scroll.
- **hero-split**: Copy and email capture beside a tilting live product card.
- **hero-terminal**: Developer hero with an auto-typing terminal and install command.
- **hero-video**: Full-bleed cinematic hero with a background loop and a film dialog.
- **logo-cloud**: 'Trusted by' wordmark marquee with faded edges.
- **newsletter-signup**: Email capture card with validation and success state.
- **portfolio-gallery**: Filterable masonry of projects that expand into a shared-layout detail view.
- **pricing-table**: Three tiers, monthly/yearly toggle, animated prices and comparison table.
- **resume-cv**: One-page résumé that prints cleanly to PDF.
- **roadmap-board**: Public roadmap columns with upvotes that re-sort, progress and ETAs.
- **team-page**: Team grid of cards that flip in 3D to show bio and links.
- **testimonials-wall**: Two counter-scrolling rows of testimonial cards.
- **waitlist-section**: Countdown, waitlist signup, place in line and referral link.

### screens

- **cart-screen**: Quantity steppers, remove with undo, free-shipping progress and summary.
- **error-404**: Parallax digits that follow the cursor, search and helpful links.
- **error-500**: Glitching status code, retry countdown and copyable error ID.
- **file-manager**: Folder tree, grid/list views, right-click actions and storage meter.
- **help-center**: Hero search with live results, categories, popular articles, FAQ and support CTA.
- **inbox-screen**: Three-pane email client with folders, unread states and reply.
- **maintenance-page**: Spinning gear, countdown to return, progress and history.
- **order-history**: Expandable orders with items, tracking progress, invoice and buy-again.
- **order-tracking**: Animated route map, stage tracker, courier card and history.
- **product-listing**: Shop grid with filters, price slider, sort, grid/list toggle, colour swatches and wishlist.
- **product-page**: Gallery, colour and size pickers, add-to-cart feedback and details.
- **reset-password**: Email code, verification and a new password with live rules.
- **returns-flow**: Four-step return: items, reasons, refund and method, then a QR drop-off code.
- **status-page**: Overall status, active incident timeline and 60-day uptime per service.
- **two-factor**: Scan a QR code, verify a code and save recovery codes.
- **wishlist**: Saved items with price drops, stock alerts, move to cart and undoable remove.

### widgets

- **ai-command-palette**: ⌘K palette that blends commands with streamed AI answers.
- **booking-widget**: Calendly-style scheduler with date, time slots and a confirm form.
- **github-graph**: Contribution heatmap with range toggle, streaks and pinned repos.
- **habit-tracker**: Weekly check-in grid with streaks and a completion ring.
- **music-player**: Spinning artwork, equaliser, scrubber, controls and up-next queue.
- **now-widgets**: Currently listening, reading, building and location cards for a /now page.
- **order-summary**: Stackable coupon codes, animated totals and a confetti pay button.
- **peer-testimonials**: Swipeable stacked recommendation cards with keyboard and dots.
- **post-composer**: Character ring, image attachments, audience and schedule.
- **pricing-calculator**: Seats and usage sliders, add-ons and billing period with a live total.
- **skills-grid**: Skill tiles with animated rings, group tabs and detail popovers.
- **stock-widget**: Price, range switcher, area chart, stats and watchlist toggle.
- **subscription-manager**: Spend by category, pause toggles and cancel with confirmation.
- **team-availability**: Cross-timezone free/busy grid that finds the best shared slot.
- **trip-itinerary**: Day tabs, timed stops on a route, packing list and travellers.
- **weather-widget**: Current conditions, hourly curve and 6-day range bars.

## Templates

Whole pages or apps. `npx @kineticui/cli add <name>` writes them into the app router (use `--overwrite` to replace app/page.tsx).

- **ai-chatbot**: A full-screen chat app on the Vercel AI SDK: streaming replies, reasoning, tool calls with approvals, sources, model picker and a context meter, plus the API route.
- **docs-site**: A documentation site: docs layout with sidebar and table of contents, a help center with search, and a changelog, under one shared navbar.
- **event-page**: A conference or meetup site: hero with a live countdown and a globe of attendee cities, speakers, a two-day agenda, ticket tiers, a tear-off pass and an FAQ.
- **link-in-bio**: A personal link page with a holographic profile card, story highlights, a now-playing Dynamic Island, animated links, socials, a newsletter signup and optional UI sounds.
- **portfolio**: A personal site for designers and engineers: animated intro with orbiting skills, selected work, experience timeline, skills, peer testimonials and a contact section.
- **saas-dashboard**: A multi-page app shell: overview dashboard, users table, team roles, billing and settings, linked by a shared top navigation.
- **saas-landing**: A complete product landing page: floating navbar, gradient hero, logo cloud, feature bento, scroll-in product shot, testimonials, pricing, FAQ and a big footer CTA.
