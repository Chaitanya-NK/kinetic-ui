"use client";

import Link from "next/link";
import { Badge, Button, Dock, DockItem, OtpInput, SegmentedControl, Switch, Tabs, TabsContent, TabsList, TabsTrigger, toast } from "@kineticui/ui";
import { BorderBeam, ConfettiButton, Marquee, NumberTicker, RotatingWords, SpotlightCard } from "@kineticui/motion";
import { BellIcon, BoltIcon, CalendarIcon, ChatIcon, HomeIcon, SettingsIcon } from "@kineticui/icons";

function Tile({ title, href, children, className = "" }: { title: string; href: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <Link href={href} className="text-xs text-subtle transition-colors hover:text-accent">View →</Link>
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

export function HomeShowcase() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
      <div className="mb-8 flex flex-col gap-2">
        <span className="font-mono text-xs tracking-widest text-accent">LIVE · TRY THEM</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight">
          Built to feel <RotatingWords words={["physical.", "fast.", "alive.", "yours."]} />
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Tile title="Dock" href="/components/dock" className="lg:col-span-2">
          <Dock>
            <DockItem icon={<HomeIcon />} label="Home" />
            <DockItem icon={<CalendarIcon />} label="Calendar" />
            <DockItem icon={<ChatIcon />} label="Messages" active />
            <DockItem icon={<BellIcon />} label="Alerts" />
            <DockItem icon={<SettingsIcon />} label="Settings" />
          </Dock>
        </Tile>
        <Tile title="Number Ticker" href="/components/number-ticker">
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-5xl font-semibold"><NumberTicker value={48290} prefix="$" /></span>
            <span className="text-sm text-success">▲ 12.4% this week</span>
          </div>
        </Tile>
        <Tile title="Spotlight Card" href="/components/spotlight-card">
          <SpotlightCard className="w-full">
            <BoltIcon className="text-accent" />
            <p className="mt-3 font-display text-xl font-semibold">Hover me</p>
            <p className="text-sm text-muted">The glow follows your pointer.</p>
          </SpotlightCard>
        </Tile>
        <Tile title="Tabs & Segmented" href="/components/tabs">
          <div className="flex w-full flex-col gap-4">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">Overview</TabsTrigger>
                <TabsTrigger value="b">Sales</TabsTrigger>
                <TabsTrigger value="c">Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="a" className="text-sm text-muted">12,480 visitors</TabsContent>
              <TabsContent value="b" className="text-sm text-muted">$8,204 revenue</TabsContent>
              <TabsContent value="c" className="text-sm text-muted">1.2M lines</TabsContent>
            </Tabs>
            <SegmentedControl aria-label="Range" defaultValue="w" options={[{ value: "d", label: "Day" }, { value: "w", label: "Week" }, { value: "m", label: "Month" }]} />
          </div>
        </Tile>
        <Tile title="Switch · Toast · Confetti" href="/components/toast">
          <div className="flex w-full flex-col gap-4">
            <Switch label="Email alerts" description="Weekly digest" defaultChecked />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast({ title: "Changes saved", tone: "success", action: { label: "Undo", onClick: () => toast("Undone") } })}>Show toast</Button>
              <ConfettiButton className="h-8 rounded-[9px] border border-border-strong px-3 text-xs font-medium">Celebrate</ConfettiButton>
            </div>
          </div>
        </Tile>
        <Tile title="OTP Input" href="/components/otp-input">
          <OtpInput length={4} />
        </Tile>
        <Tile title="Border Beam" href="/components/border-beam" className="lg:col-span-2">
          <BorderBeam className="w-full max-w-md">
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <Badge variant="solid" size="sm">Most popular</Badge>
                <p className="mt-2 font-display text-2xl font-semibold">Pro · $19/mo</p>
              </div>
              <Button>Upgrade</Button>
            </div>
          </BorderBeam>
        </Tile>
      </div>
      <Marquee className="mt-10" duration={40}>
        {["Button", "Input", "Checkbox", "Switch", "Slider", "Tabs", "Dialog", "Sheet", "Popover", "Dropdown", "Toast", "Tooltip", "Command Palette", "Dock", "Stepper", "OTP", "Accordion", "Marquee", "Confetti", "Tilt Card"].map((n) => (
          <span key={n} className="whitespace-nowrap rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted">{n}</span>
        ))}
      </Marquee>
    </section>
  );
}
