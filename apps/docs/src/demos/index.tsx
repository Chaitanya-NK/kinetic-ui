"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  AvatarStack,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandPalette,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dock,
  DockItem,
  DotsLoader,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  Input,
  Kbd,
  NumberInput,
  OtpInput,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  ProgressRing,
  Radio,
  RadioCard,
  RadioGroup,
  SegmentedControl,
  Separator,
  Sheet,
  SheetContent,
  SheetTrigger,
  Skeleton,
  Slider,
  Spinner,
  Stepper,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  toast,
} from "@kineticui/ui";
import {
  BorderBeam,
  ConfettiButton,
  DotBackground,
  GridBackground,
  Magnetic,
  Marquee,
  NumberTicker,
  RotatingWords,
  ScrollReveal,
  ShinyText,
  SpotlightCard,
  TiltCard,
  Typewriter,
} from "@kineticui/motion";
import {
  BellIcon,
  BoltIcon,
  CalendarIcon,
  ChatIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  HomeIcon,
  MailIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
  UploadIcon,
} from "@kineticui/icons";
import { formDemos } from "./forms";

const team = [
  { alt: "Maya Kapoor", color: "#7C8CFF" },
  { alt: "Rohan Joshi", color: "#F4A86A" },
  { alt: "Ana Silva", color: "#6EE7A0" },
  { alt: "Kemi Okafor", color: "#F0A3D0" },
  { alt: "Liam Brennan", color: "#FBBF5A" },
  { alt: "Hana Yoshida", color: "#9AA6FF" },
];

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>;
}

function Stack({ children, className = "w-full max-w-sm" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 ${className}`}>{children}</div>;
}

function CommandDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <SearchIcon size={16} /> Open palette <Kbd>⌘K</Kbd>
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        items={[
          { id: "deploy", label: "Deploy to production", group: "Actions", icon: <UploadIcon />, shortcut: "⌘ ↵", onSelect: () => toast({ title: "Deploying…", tone: "info" }) },
          { id: "logs", label: "Open deployment logs", group: "Actions", icon: <CodeIcon />, shortcut: "⌘ L", onSelect: () => toast("Opening logs") },
          { id: "invite", label: "Invite teammate", group: "Team", icon: <MailIcon />, onSelect: () => toast("Invite sent") },
          { id: "settings", label: "Settings", group: "Navigation", icon: <SettingsIcon />, onSelect: () => toast("Settings") },
        ]}
      />
    </>
  );
}

function PaginationDemo() {
  const [page, setPage] = React.useState(4);
  return <Pagination page={page} totalPages={12} onPageChange={setPage} />;
}

function StepperDemo() {
  const [step, setStep] = React.useState(1);
  return (
    <Stack className="w-full max-w-lg">
      <Stepper steps={["Account", "Team", "Billing", "Launch"]} current={step} />
      <Row>
        <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
        <Button size="sm" onClick={() => setStep((s) => Math.min(4, s + 1))}>Continue</Button>
      </Row>
    </Stack>
  );
}

function ProgressDemo() {
  const [v, setV] = React.useState(64);
  return (
    <Stack>
      <Progress value={v} label="Uploading assets" showValue />
      <Progress value={45} striped size="lg" />
      <Progress size="sm" />
      <Row>
        <ProgressRing value={v} />
        <ProgressRing value={80} size={48} thickness={4} color="#7C8CFF" label="" />
        <Button size="sm" variant="outline" onClick={() => setV(Math.round(Math.random() * 100))}>Randomise</Button>
      </Row>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </Stack>
  );
}

function OtpDemo() {
  const [done, setDone] = React.useState("");
  return (
    <Stack className="items-center">
      <OtpInput groupAfter={3} onComplete={(v) => setDone(v)} onChange={() => setDone("")} />
      <span className="text-sm text-muted">{done ? `✓ Code ${done} entered` : "Type or paste a 6-digit code"}</span>
    </Stack>
  );
}

export const demos: Record<string, () => React.ReactNode> = {
  ...formDemos,
  button: () => (
    <Stack className="items-center">
      <Row>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="destructive">Delete</Button>
      </Row>
      <Row>
        <Button loading>Deploying</Button>
        <Button size="icon" variant="outline" aria-label="Add"><PlusIcon size={18} /></Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
      </Row>
    </Stack>
  ),
  spinner: () => (
    <Row>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <span className="rounded-2xl rounded-bl-sm bg-surface-overlay px-4 py-3 text-muted"><DotsLoader /></span>
    </Row>
  ),
  input: () => (
    <Stack>
      <Input leading={<SearchIcon />} placeholder="Search…" trailing={<Kbd>/</Kbd>} aria-label="Search" />
      <Field label="Work email" hint="We never share it." htmlFor="email">
        <Input id="email" leading={<MailIcon />} placeholder="you@company.com" />
      </Field>
      <Field label="Username" error="That username is taken" htmlFor="user">
        <Input id="user" defaultValue="admin" invalid />
      </Field>
      <Field label="Bio" htmlFor="bio">
        <Textarea id="bio" maxLength={160} showCount defaultValue="Design engineer who loves motion." />
      </Field>
    </Stack>
  ),
  checkbox: () => (
    <Stack>
      <Checkbox label="Two-factor authentication" description="Ask for a code at every sign-in." defaultChecked />
      <Checkbox label="Login alerts" description="Email me when a new device signs in." />
      <Checkbox label="Select all" checked="indeterminate" />
    </Stack>
  ),
  switch: () => (
    <Stack>
      <Switch label="Email alerts" description="Weekly digest" defaultChecked />
      <Switch label="Auto-deploy" description="On push to main" />
      <Switch label="Beta features" description="May be unstable" disabled />
    </Stack>
  ),
  "radio-group": () => (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <RadioGroup defaultValue="dark" aria-label="Theme">
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
        <Radio value="system" label="System" description="Follows your device" />
      </RadioGroup>
      <RadioGroup defaultValue="pro" aria-label="Plan">
        <RadioCard value="hobby" title="Hobby" description="1 project" aside="$0" />
        <RadioCard value="pro" title="Pro" description="Unlimited projects" aside="$19" />
        <RadioCard value="team" title="Team" description="SSO, audit logs" aside="$49" />
      </RadioGroup>
    </div>
  ),
  slider: () => (
    <Stack>
      <Slider defaultValue={[62]} showValue formatValue={(v) => `${v}%`} aria-label="Volume" />
      <Slider defaultValue={[20, 72]} showValue formatValue={(v) => `$${v * 2}`} aria-label="Price range" />
    </Stack>
  ),
  badge: () => (
    <Stack className="items-center">
      <Row>
        <Badge variant="solid">New</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge>Neutral</Badge>
      </Row>
      <Row>
        <Badge variant="success" dot="pulse">Live</Badge>
        <Badge variant="warning" dot>Pending</Badge>
        <Badge variant="danger" dot>Failed</Badge>
        <Badge variant="info">Info</Badge>
      </Row>
      <Row>
        <Kbd>⌘</Kbd><Kbd>K</Kbd>
      </Row>
    </Stack>
  ),
  avatar: () => (
    <Stack className="items-center">
      <Row>
        <Avatar alt="Maya Kapoor" color="#7C8CFF" status="online" size="lg" ring />
        <Avatar alt="Rohan Joshi" color="#F4A86A" status="away" />
        <Avatar alt="Ana Silva" color="#6EE7A0" status="busy" size="sm" />
      </Row>
      <AvatarStack avatars={team} max={4} />
      <span className="text-xs text-subtle">Hover the stack to fan it out</span>
    </Stack>
  ),
  card: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Upgrade to Pro</CardTitle>
        <CardDescription>Unlimited projects, priority support and every effect.</CardDescription>
      </CardHeader>
      <Separator />
      <div className="flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold">$19</span>
        <span className="text-sm text-subtle">/ month</span>
      </div>
      <CardFooter>
        <Button variant="ghost">Later</Button>
        <Button>Upgrade</Button>
      </CardFooter>
    </Card>
  ),
  tooltip: () => (
    <Row>
      <Tooltip content="Copy link" shortcut="⌘ C">
        <Button size="icon" variant="outline" aria-label="Copy link"><CopyIcon size={16} /></Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button variant="outline">Hover me</Button>
      </Tooltip>
      <Tooltip content="Right side" side="right">
        <Button variant="ghost">And me</Button>
      </Tooltip>
    </Row>
  ),
  progress: () => <ProgressDemo />,
  alert: () => (
    <Stack className="w-full max-w-lg">
      <Alert tone="info">A new version is available.</Alert>
      <Alert tone="success" title="Payment saved" />
      <Alert tone="warning">You’ve used 90% of your quota.</Alert>
      <Alert tone="danger" title="Build failed" action={<Button size="sm" variant="outline">View log</Button>}>
        Step 3 of 5 exited with code 1.
      </Alert>
      <EmptyState icon={<CalendarIcon />} title="No events yet" description="Create your first event to see it here." actions={<Button size="sm">Create event</Button>} />
    </Stack>
  ),
  tabs: () => (
    <Stack className="w-full max-w-md">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><p className="font-display text-3xl font-semibold">12,480 <span className="text-sm font-normal text-subtle">visitors</span></p></TabsContent>
        <TabsContent value="sales"><p className="font-display text-3xl font-semibold">$8,204 <span className="text-sm font-normal text-subtle">this week</span></p></TabsContent>
        <TabsContent value="errors"><p className="font-display text-3xl font-semibold">0.03% <span className="text-sm font-normal text-subtle">error rate</span></p></TabsContent>
      </Tabs>
      <SegmentedControl aria-label="Range" defaultValue="week" options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]} />
    </Stack>
  ),
  dialog: () => (
    <Row>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Names are shown in URLs and the dashboard.</DialogDescription>
          </DialogHeader>
          <Input defaultValue="orbit-web" aria-label="Project name" />
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <DialogClose asChild><Button onClick={() => toast({ title: "Project renamed", tone: "success" })}>Save</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <DialogTitle>Filters</DialogTitle>
          <Switch label="Active only" defaultChecked />
          <Switch label="Show archived" />
          <Slider defaultValue={[30, 80]} aria-label="MRR range" />
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost">Bottom sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <DialogTitle>Sort by</DialogTitle>
          <RadioGroup defaultValue="new" aria-label="Sort by">
            <Radio value="new" label="Newest" />
            <Radio value="price" label="Price: low to high" />
            <Radio value="top" label="Top rated" />
          </RadioGroup>
        </SheetContent>
      </Sheet>
    </Row>
  ),
  popover: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">What is this?</Button>
      </PopoverTrigger>
      <PopoverContent arrow>
        <p className="font-semibold">Active users</p>
        <p className="mt-1 text-muted">People who opened the app at least once in the last 7 days.</p>
      </PopoverContent>
    </Popover>
  ),
  "dropdown-menu": () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>File</DropdownMenuLabel>
        <DropdownMenuItem shortcut="⌘E"><EditIcon /> Edit</DropdownMenuItem>
        <DropdownMenuItem shortcut="⌘D"><CopyIcon /> Duplicate</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><DownloadIcon /> Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>PNG</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem defaultChecked>Show grid</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive><TrashIcon /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  toast: () => (
    <Row>
      <Button onClick={() => toast({ title: "Deployment ready", description: "web-app is live in 42s", tone: "success", action: { label: "Undo", onClick: () => toast("Rolled back") } })}>Success toast</Button>
      <Button variant="outline" onClick={() => toast({ title: "Build failed", description: "Step 3 of 5", tone: "error" })}>Error</Button>
      <Button variant="ghost" onClick={() => toast("Saved")}>Simple</Button>
    </Row>
  ),
  "otp-input": () => <OtpDemo />,
  accordion: () => (
    <Accordion type="single" collapsible defaultValue="a" className="w-full max-w-md">
      <AccordionItem value="a" title="Can I use it commercially?">Yes. Everything is MIT-licensed and you own the code you copy.</AccordionItem>
      <AccordionItem value="b" title="Does it work with the App Router?">Yes. Interactive components are client components; layout pieces work anywhere.</AccordionItem>
      <AccordionItem value="c" title="How do I change the theme?">Change the CSS variables or use ThemeProvider’s accent presets.</AccordionItem>
    </Accordion>
  ),
  breadcrumb: () => (
    <Stack className="items-center">
      <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Settings", href: "#" }, { label: "Billing" }]} />
      <Breadcrumb separator="slash" maxItems={4} items={[{ label: "Drive", href: "#" }, { label: "Projects", href: "#" }, { label: "Marketing", href: "#" }, { label: "Q4", href: "#" }, { label: "Deck.pdf" }]} />
    </Stack>
  ),
  pagination: () => <PaginationDemo />,
  "command-palette": () => <CommandDemo />,
  dock: () => (
    <Dock>
      <DockItem icon={<HomeIcon />} label="Home" />
      <DockItem icon={<CalendarIcon />} label="Calendar" />
      <DockItem icon={<ChatIcon />} label="Messages" active />
      <DockItem icon={<MailIcon />} label="Mail" />
      <DockItem icon={<BellIcon />} label="Alerts" />
      <DockItem icon={<SettingsIcon />} label="Settings" />
    </Dock>
  ),
  stepper: () => <StepperDemo />,
  "number-input": () => (
    <Stack className="items-center">
      <NumberInput defaultValue={5} min={1} max={50} aria-label="Seats" />
      <span className="text-xs text-subtle">Arrow keys work too · min 1 · max 50</span>
    </Stack>
  ),
  "spotlight-card": () => (
    <SpotlightCard className="w-full max-w-sm">
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border-strong text-accent"><BoltIcon size={20} /></span>
      <h3 className="font-display text-2xl font-semibold">Edge functions</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">Move your pointer over this card — the glow follows you.</p>
    </SpotlightCard>
  ),
  "border-beam": () => (
    <BorderBeam className="w-full max-w-sm">
      <div className="p-6">
        <Badge variant="solid">Recommended</Badge>
        <h3 className="mt-3 font-display text-2xl font-semibold">Pro plan</h3>
        <p className="mt-1 text-sm text-muted">A beam of light circles this card.</p>
      </div>
    </BorderBeam>
  ),
  marquee: () => (
    <Stack className="w-full max-w-2xl">
      <Marquee duration={22}>
        {["Button", "Dock", "Command Palette", "Toast", "OTP Input", "Tabs", "Dialog", "Slider"].map((n) => (
          <span key={n} className="whitespace-nowrap rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm">{n}</span>
        ))}
      </Marquee>
      <Marquee duration={28} reverse>
        {["Typewriter", "Confetti", "Magnetic", "Tilt Card", "Border Beam", "Spotlight", "Marquee", "Shiny Text"].map((n) => (
          <span key={n} className="whitespace-nowrap rounded-xl bg-accent-soft px-4 py-2.5 text-sm text-accent-soft-foreground">{n}</span>
        ))}
      </Marquee>
    </Stack>
  ),
  typewriter: () => (
    <Typewriter className="font-mono text-2xl" words={["npx @kineticui/cli add dock", "npm i @kineticui/ui", "ship it."]} />
  ),
  "rotating-words": () => (
    <p className="font-display text-4xl font-semibold tracking-tight">
      Build <RotatingWords words={["faster.", "bolder.", "calmer.", "together."]} />
    </p>
  ),
  "shiny-text": () => <ShinyText className="font-display text-5xl font-bold tracking-tight">Introducing 2.0</ShinyText>,
  "number-ticker": () => (
    <Row>
      <span className="font-display text-5xl font-semibold"><NumberTicker value={48290} prefix="$" /></span>
      <span className="font-display text-5xl font-semibold text-accent"><NumberTicker value={99.98} decimals={2} suffix="%" /></span>
    </Row>
  ),
  confetti: () => <ConfettiButton className="h-12 rounded-xl bg-foreground px-6 font-semibold text-background">Celebrate</ConfettiButton>,
  magnetic: () => (
    <Magnetic strength={0.4}>
      <Button size="lg" className="rounded-full px-9">Get started</Button>
    </Magnetic>
  ),
  backgrounds: () => (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
        <GridBackground />
        <span className="relative font-display text-xl font-semibold">GridBackground</span>
      </div>
      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
        <DotBackground />
        <span className="relative font-display text-xl font-semibold">DotBackground</span>
      </div>
    </div>
  ),
  "tilt-card": () => (
    <TiltCard className="flex h-48 w-80 flex-col justify-between p-6">
      <div className="flex items-center justify-between">
        <span className="font-display font-semibold">Kinetic</span>
        <span className="h-7 w-10 rounded-md bg-accent" />
      </div>
      <span className="font-mono text-lg tracking-[0.15em]">4821 •••• •••• 0427</span>
      <div className="flex justify-between text-xs text-muted"><span>MAYA KAPOOR</span><span>09/29</span></div>
    </TiltCard>
  ),
  "scroll-reveal": () => (
    <Stack>
      {["Hero section", "Pricing", "Testimonials", "FAQ"].map((t, i) => (
        <ScrollReveal key={t} delay={i * 0.1}>
          <div className="rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm">{t}</div>
        </ScrollReveal>
      ))}
    </Stack>
  ),
};
