"use client";

import * as React from "react";
import {
  AnnouncementBanner,
  BackToTop,
  BottomTabBar,
  Button,
  ConfirmDialog,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  CookieConsent,
  CopyButton,
  Countdown,
  HoverCard,
  Lightbox,
  MegaMenu,
  MobileMenu,
  Navbar,
  Sidebar,
  SidebarItem,
  SidebarSection,
  SpeedDial,
  TableOfContents,
  ThemeSwitch,
  Tour,
  toast,
} from "@kineticui/ui";
import {
  BellIcon,
  BoltIcon,
  ChartIcon,
  CodeIcon,
  CopyIcon,
  DatabaseIcon,
  EditIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  LayersIcon,
  MailIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SparkleIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@kineticui/icons";

function S({ children, className = "w-full max-w-sm" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

/** Self-contained gradient "photos" so demos work offline. */
function photo(a: string, b: string, shape: number) {
  const shapes = [
    `<circle cx="300" cy="260" r="120" fill="${b}" opacity=".9"/>`,
    `<path d="M0 420 L180 220 L320 360 L460 180 L600 420 Z" fill="${b}" opacity=".85"/>`,
    `<rect x="170" y="140" width="260" height="260" rx="40" fill="${b}" opacity=".85" transform="rotate(12 300 270)"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient></defs><rect width="600" height="450" fill="url(#g)"/>${shapes[shape % 3]}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const gallery = [
  ["#2a3a12", "#C6F432", "Lime hills"],
  ["#1d2a4a", "#7C8CFF", "Blue hour"],
  ["#4a2a12", "#F4A86A", "Desert sun"],
  ["#3a1230", "#F0A3D0", "Rose tile"],
  ["#123a2a", "#6EE7A0", "Mint peaks"],
  ["#2a2a2a", "#E8E8E3", "Monolith"],
].map(([a, b, alt], i) => ({ src: photo(a!, b!, i), alt: alt!, caption: `${alt} — generated artwork ${i + 1}` }));

function SidebarDemo() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [active, setActive] = React.useState("Dashboard");
  const item = (label: string, icon: React.ReactNode, badge?: number) => (
    <SidebarItem label={label} icon={icon} badge={badge} active={active === label} onClick={() => setActive(label)} />
  );
  return (
    <div className="h-[540px] overflow-hidden rounded-2xl border border-border">
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        header={
          <div className="flex items-center gap-2.5 px-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-accent-foreground">K</span>
            {collapsed ? null : <span className="font-display font-semibold">Kinetic</span>}
          </div>
        }
        footer={
          <div className="rounded-xl bg-accent-soft p-3 text-xs">
            <div className="font-semibold text-foreground">Upgrade to Pro</div>
            <div className="mt-0.5 text-muted">Unlimited projects and seats.</div>
          </div>
        }
      >
        <SidebarSection title="Workspace">
          {item("Dashboard", <HomeIcon />)}
          {item("Inbox", <MailIcon />, 12)}
          {item("Projects", <FolderIcon />)}
          {item("Analytics", <ChartIcon />)}
        </SidebarSection>
        <SidebarSection title="Team">
          {item("Members", <UsersIcon />)}
          {item("Settings", <SettingsIcon />)}
        </SidebarSection>
      </Sidebar>
    </div>
  );
}

function TourDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3">
        <span id="tour-search" className="flex h-9 flex-1 items-center gap-2 rounded-lg bg-surface-raised px-3 text-sm text-subtle">
          <SearchIcon size={15} /> Search…
        </span>
        <span id="tour-bell" className="flex size-9 items-center justify-center rounded-lg bg-surface-raised">
          <BellIcon size={16} />
        </span>
        <span id="tour-new">
          <Button size="sm">New project</Button>
        </span>
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Start tour
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onFinish={() => toast({ title: "Tour complete", tone: "success" })}
        steps={[
          { target: "#tour-search", title: "Find anything", body: "Search projects, people and docs. Press / from anywhere." },
          { target: "#tour-bell", title: "Stay in the loop", body: "Mentions, reviews and deploys land here." },
          { target: "#tour-new", title: "Create your first project", body: "Start from a template or a blank canvas.", placement: "left" },
        ]}
      />
    </div>
  );
}

function CookieDemo() {
  const [k, setK] = React.useState(0);
  return (
    <S className="w-full max-w-md items-center">
      <CookieConsent key={k} open position="inline" storageKey="kn-demo-consent" onChange={(c) => toast(`Saved: ${Object.entries(c).filter(([, v]) => v).map(([id]) => id).join(", ")}`)} />
      <Button size="sm" variant="ghost" onClick={() => setK((x) => x + 1)}>
        Show again
      </Button>
    </S>
  );
}

function BannerDemo() {
  const [k, setK] = React.useState(0);
  return (
    <div key={k} className="flex w-full flex-col gap-3 overflow-hidden rounded-2xl">
      <AnnouncementBanner tag="New" href="#" linkLabel="Read the changelog">
        Kinetic 2.0 is here, with 120 components
      </AnnouncementBanner>
      <AnnouncementBanner variant="subtle" href="#">
        Scheduled maintenance on Sunday 02:00 UTC
      </AnnouncementBanner>
      <AnnouncementBanner variant="gradient" tag="Launch week" dismissible={false}>
        Day 3: AI blocks are live
      </AnnouncementBanner>
      <Button size="sm" variant="ghost" className="self-center" onClick={() => setK((x) => x + 1)}>
        Reset
      </Button>
    </div>
  );
}

function CountdownDemo() {
  const [to] = React.useState(() => Date.now() + ((2 * 24 + 7) * 3600 + 23 * 60 + 41) * 1000);
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-mono text-xs uppercase tracking-wider text-accent">Launch in</span>
      <Countdown to={to} />
    </div>
  );
}

export const navigationDemos: Record<string, () => React.ReactNode> = {
  navbar: () => (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_50%_0%,var(--kn-accent-soft),transparent_60%)]">
      <Navbar
        className="absolute"
        hideOnScroll={false}
        logo={
          <>
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">K</span>
            Kinetic
          </>
        }
        items={[
          { label: "Product", href: "#product", active: true },
          { label: "Docs", href: "#docs" },
          { label: "Pricing", href: "#pricing" },
          { label: "Blog", href: "#blog" },
        ]}
        actions={
          <Button size="sm" className="rounded-full">
            Start free
          </Button>
        }
      />
      <p className="absolute inset-x-0 bottom-6 text-center text-xs text-subtle">Hover the links. On a page it hides when you scroll down.</p>
    </div>
  ),
  sidebar: () => <SidebarDemo />,
  "mega-menu": () => (
    <div className="flex h-[380px] w-full justify-center pt-2 pr-[min(560px,40vw)]">
      <MegaMenu
        items={[
          {
            label: "Product",
            columns: [
              {
                heading: "Build",
                links: [
                  { title: "Components", description: "120 accessible primitives", href: "#c", icon: <LayersIcon /> },
                  { title: "Blocks", description: "Drop-in page sections", href: "#b", icon: <CodeIcon /> },
                ],
              },
              {
                heading: "Ship",
                links: [
                  { title: "Analytics", description: "Know what users do", href: "#a", icon: <ChartIcon /> },
                  { title: "Database", description: "Postgres, instantly", href: "#d", icon: <DatabaseIcon /> },
                ],
              },
            ],
            feature: (
              <div className="flex h-full flex-col justify-end gap-1 rounded-xl bg-[linear-gradient(140deg,var(--kn-accent-soft),transparent)] p-4">
                <SparkleIcon className="text-accent" size={18} />
                <span className="font-semibold">Kinetic AI</span>
                <span className="text-xs text-muted">Generate a page from a prompt.</span>
              </div>
            ),
          },
          {
            label: "Resources",
            columns: [
              {
                heading: "Learn",
                links: [
                  { title: "Docs", href: "#docs" },
                  { title: "Guides", href: "#guides" },
                  { title: "Changelog", href: "#log" },
                ],
              },
            ],
          },
          { label: "Pricing", href: "#pricing" },
        ]}
      />
    </div>
  ),
  "bottom-tab-bar": () => (
    <div className="flex h-[420px] w-[300px] flex-col overflow-hidden rounded-[36px] border-[6px] border-surface-overlay bg-background">
      <div className="flex-1 p-5">
        <div className="h-4 w-24 rounded bg-surface-raised" />
        <div className="mt-4 h-28 rounded-2xl bg-surface-raised" />
        <div className="mt-3 h-16 rounded-2xl bg-surface-raised" />
      </div>
      <BottomTabBar
        items={[
          { value: "home", label: "Home", icon: <HomeIcon /> },
          { value: "search", label: "Search", icon: <SearchIcon /> },
          { value: "inbox", label: "Inbox", icon: <MailIcon />, badge: 3 },
          { value: "me", label: "Profile", icon: <UserIcon /> },
        ]}
      />
    </div>
  ),
  "mobile-menu": () => (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="font-display font-semibold">Kinetic</span>
      <span className="w-24" />
      <MobileMenu
        logo="Kinetic"
        links={[
          { label: "Product", href: "#", active: true },
          { label: "Docs", href: "#docs" },
          { label: "Pricing", href: "#pricing" },
          { label: "Blog", href: "#blog" },
          { label: "Contact", href: "#contact" },
        ]}
        actions={
          <>
            <Button size="lg">Start free</Button>
            <Button size="lg" variant="secondary">
              Sign in
            </Button>
          </>
        }
      />
    </div>
  ),
  "speed-dial": () => (
    <div className="flex h-72 items-end">
      <SpeedDial
        actions={[
          { label: "New doc", icon: <EditIcon />, onClick: () => toast("New doc") },
          { label: "Upload image", icon: <ImageIcon />, onClick: () => toast("Upload") },
          { label: "Invite", icon: <UsersIcon />, onClick: () => toast("Invite") },
        ]}
      />
    </div>
  ),
  "table-of-contents": () => (
    <div className="flex w-full max-w-2xl gap-8">
      <div className="flex flex-1 flex-col gap-6 text-sm text-muted">
        {["Introduction", "Installation", "Theming", "Tokens", "Accessibility"].map((h) => (
          <section key={h} id={`toc-${h.toLowerCase()}`} className="scroll-mt-24">
            <h3 className="font-display text-lg font-semibold text-foreground">{h}</h3>
            <p className="mt-1">Scroll the page; the list on the right follows the section you are reading.</p>
          </section>
        ))}
      </div>
      <TableOfContents
        className="w-48 shrink-0"
        headings={[
          { id: "toc-introduction", label: "Introduction" },
          { id: "toc-installation", label: "Installation" },
          { id: "toc-theming", label: "Theming" },
          { id: "toc-tokens", label: "Tokens", level: 3 },
          { id: "toc-accessibility", label: "Accessibility" },
        ]}
      />
    </div>
  ),
  "back-to-top": () => (
    <div className="relative h-48 w-72 rounded-2xl border border-border bg-surface">
      <p className="p-5 text-sm text-muted">Appears after you scroll past the threshold. The ring shows reading progress.</p>
      <BackToTop threshold={-1} className="absolute bottom-4 right-4" />
    </div>
  ),
  "context-menu": () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-48 w-80 select-none items-center justify-center rounded-2xl border border-dashed border-border-strong text-sm text-subtle">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>design-system.fig</ContextMenuLabel>
        <ContextMenuItem shortcut="⌘C" onSelect={() => toast("Copied")}>
          <CopyIcon /> Copy
        </ContextMenuItem>
        <ContextMenuItem shortcut="⌘R">
          <EditIcon /> Rename
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <ShareIcon /> Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem destructive shortcut="⌫">
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  "hover-card": () => (
    <p className="text-sm text-muted">
      Designed by{" "}
      <HoverCard
        content={
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#7C8CFF] font-semibold text-background">MK</span>
              <div>
                <div className="font-semibold">Maya Kapoor</div>
                <div className="text-xs text-subtle">@maya · Design lead</div>
              </div>
            </div>
            <p className="text-muted">Building calm interfaces for loud products. Previously at Linear.</p>
            <div className="flex gap-4 text-xs text-subtle">
              <span>
                <b className="text-foreground">2.1k</b> followers
              </span>
              <span>
                <b className="text-foreground">184</b> following
              </span>
            </div>
          </div>
        }
      >
        <a href="#maya" className="font-medium text-foreground underline decoration-accent underline-offset-4">
          @maya
        </a>
      </HoverCard>{" "}
      and shipped last week.
    </p>
  ),
  "alert-dialog": () => (
    <div className="flex flex-wrap gap-3">
      <ConfirmDialog
        trigger={<Button variant="secondary">Publish</Button>}
        title="Publish this page?"
        description="It will be visible to everyone with the link."
        confirmLabel="Publish"
        onConfirm={() => void toast({ title: "Published", tone: "success" })}
      />
      <ConfirmDialog
        tone="destructive"
        trigger={<Button variant="destructive">Delete project</Button>}
        title="Delete “Atlas”?"
        description="This removes 214 files and 12 deployments. It can't be undone."
        confirmLabel="Delete project"
        confirmText="atlas"
        onConfirm={() => new Promise<void>((r) => setTimeout(r, 900)).then(() => void toast({ title: "Deleted", tone: "success" }))}
      />
    </div>
  ),
  tour: () => <TourDemo />,
  lightbox: () => (
    <S className="w-full max-w-md">
      <Lightbox images={gallery} />
      <span className="text-center text-xs text-subtle">Click an image. Arrow keys or swipe to move.</span>
    </S>
  ),
  "theme-switch": () => (
    <div className="flex flex-col items-center gap-5">
      <ThemeSwitch />
      <ThemeSwitch variant="segmented" />
    </div>
  ),
  countdown: () => <CountdownDemo />,
  "copy-button": () => (
    <S className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-4 pr-1.5 font-mono text-sm">
        <span className="flex-1 truncate text-muted">npx @kineticui/cli add button</span>
        <CopyButton value="npx @kineticui/cli add button" />
      </div>
      <div className="flex items-center gap-2">
        <CopyButton value="kn_live_8f2a91c3" label="Copy API key" />
        <span className="flex items-center gap-1 text-xs text-subtle">
          <BoltIcon size={12} /> Shows a check for 1.6s
        </span>
      </div>
    </S>
  ),
  "announcement-banner": () => <BannerDemo />,
  "cookie-consent": () => <CookieDemo />,
};
