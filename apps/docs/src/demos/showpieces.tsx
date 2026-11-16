"use client";

import * as React from "react";
import {
  AnimatedBeam,
  AuroraBackground,
  BeamNode,
  BlurText,
  BrowserMockup,
  Globe,
  GradientText,
  LaptopMockup,
  Meteors,
  OrbitingCircles,
  Particles,
  PhoneMockup,
  ScrollShowcase,
  TabletMockup,
} from "@kineticui/motion";
import { Badge, Button } from "@kineticui/ui";
import {
  ActivityIcon,
  BellIcon,
  BotIcon,
  BoxIcon,
  CalendarIcon,
  CloudIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GitBranchIcon,
  LayersIcon,
  MailIcon,
  MessageCircleIcon,
  ShieldIcon,
  UserIcon,
} from "@kineticui/icons";

/* ---------------------------------------------------------------- beam */

function BeamDemo() {
  const box = React.useRef<HTMLDivElement>(null);
  const user = React.useRef<HTMLDivElement>(null), a = React.useRef<HTMLDivElement>(null), b = React.useRef<HTMLDivElement>(null);
  const c = React.useRef<HTMLDivElement>(null), d = React.useRef<HTMLDivElement>(null), e = React.useRef<HTMLDivElement>(null), hub = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="relative flex h-80 w-full max-w-2xl items-center justify-between overflow-hidden rounded-2xl border border-border bg-background px-10">
      <div className="flex flex-col gap-10">
        <BeamNode ref={a}><MailIcon /></BeamNode>
        <BeamNode ref={b}><CalendarIcon /></BeamNode>
        <BeamNode ref={c}><MessageCircleIcon /></BeamNode>
      </div>
      <BeamNode ref={hub} size="lg" glow><LayersIcon /></BeamNode>
      <div className="flex flex-col gap-10">
        <BeamNode ref={user}><UserIcon /></BeamNode>
        <BeamNode ref={d}><DatabaseIcon /></BeamNode>
        <BeamNode ref={e}><BotIcon /></BeamNode>
      </div>
      <AnimatedBeam containerRef={box} fromRef={a} toRef={hub} curvature={60} />
      <AnimatedBeam containerRef={box} fromRef={b} toRef={hub} delay={0.4} />
      <AnimatedBeam containerRef={box} fromRef={c} toRef={hub} curvature={-60} delay={0.8} />
      <AnimatedBeam containerRef={box} fromRef={hub} toRef={user} curvature={60} delay={1.2} />
      <AnimatedBeam containerRef={box} fromRef={hub} toRef={d} delay={1.6} />
      <AnimatedBeam containerRef={box} fromRef={hub} toRef={e} curvature={-60} delay={2} reverse />
    </div>
  );
}

/* ---------------------------------------------------------------- globe */

const cities = [
  { lat: 12.97, lng: 77.59, label: "Bengaluru" },
  { lat: 51.51, lng: -0.13, label: "London" },
  { lat: 40.71, lng: -74.0, label: "New York" },
  { lat: 35.68, lng: 139.69, label: "Tokyo" },
  { lat: -33.87, lng: 151.21, label: "Sydney" },
  { lat: 1.35, lng: 103.82, label: "Singapore" },
  { lat: -23.55, lng: -46.63, label: "São Paulo" },
  { lat: 52.52, lng: 13.4 },
];
const ll = (i: number) => [cities[i]!.lat, cities[i]!.lng] as [number, number];

function GlobeDemo() {
  return (
    <div className="relative flex w-full max-w-3xl flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border bg-background px-6 pt-8 sm:flex-row sm:items-center sm:gap-8 sm:pt-0">
      <div className="flex max-w-xs flex-col gap-3 sm:py-10">
        <Badge variant="outline" className="w-fit">Edge network</Badge>
        <h3 className="font-display text-3xl font-semibold leading-tight tracking-tight">Fast for everyone, everywhere.</h3>
        <p className="text-sm text-muted">38 regions, under 50 ms for 95% of people. Drag the globe to spin it.</p>
      </div>
      <Globe className="max-w-[400px] translate-y-10 sm:translate-y-16" markers={cities} arcs={[{ from: ll(0), to: ll(1) }, { from: ll(1), to: ll(2) }, { from: ll(0), to: ll(5) }, { from: ll(5), to: ll(3) }, { from: ll(2), to: ll(6) }, { from: ll(7), to: ll(0) }]} initialLng={-60} />
    </div>
  );
}

/* ---------------------------------------------------------------- devices */

function MiniApp() {
  return (
    <div className="flex size-full flex-col gap-2.5 bg-background p-3 pt-11 text-[11px]">
      <span className="text-[9px] uppercase tracking-wider text-subtle">Today</span>
      <span className="whitespace-nowrap font-display text-xl font-semibold">₹42,180</span>
      <div className="flex h-16 items-end gap-1">
        {[40, 62, 35, 80, 55, 92, 70].map((h, i) => (
          <span key={i} className="flex-1 rounded-md bg-accent" style={{ height: `${h}%`, opacity: 0.35 + i * 0.09 }} />
        ))}
      </div>
      {["Maya Kapoor", "Arjun Mehta", "Lena Ortiz"].map((n, i) => (
        <div key={n} className="flex items-center gap-2 rounded-lg bg-surface-raised p-2">
          <span className="size-5 shrink-0 rounded-full" style={{ background: ["#C6F432", "#7dd3fc", "#f9a8d4"][i] }} />
          <span className="min-w-0 flex-1 truncate">{n.split(" ")[0]}</span>
          <span className="font-mono text-[10px] text-muted">+{(i + 2) * 124}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardShot() {
  return (
    <div className="grid size-full grid-cols-[120px_1fr] text-[10px]">
      <div className="flex flex-col gap-2 border-r border-border bg-surface p-3">
        <span className="font-display text-xs font-semibold">Kinetic</span>
        {["Overview", "Customers", "Revenue", "Settings"].map((t, i) => (
          <span key={t} className={`rounded-md px-2 py-1 ${i === 0 ? "bg-accent text-accent-foreground" : "text-muted"}`}>{t}</span>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {[["MRR", "$48.2k"], ["Customers", "2,904"], ["Churn", "1.8%"]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-surface p-2"><span className="text-subtle">{k}</span><div className="font-display text-base font-semibold">{v}</div></div>
          ))}
        </div>
        <svg viewBox="0 0 300 90" className="w-full flex-1 rounded-lg border border-border bg-surface" preserveAspectRatio="none">
          <path d="M0,70 C40,60 60,30 100,40 S160,70 200,30 S260,10 300,15 L300,90 L0,90Z" fill="var(--kn-accent)" fillOpacity=".15" />
          <path d="M0,70 C40,60 60,30 100,40 S160,70 200,30 S260,10 300,15" fill="none" stroke="var(--kn-accent)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function DevicesDemo() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10">
      <div className="relative flex w-full items-end justify-center">
        <LaptopMockup className="max-w-2xl"><DashboardShot /></LaptopMockup>
        <PhoneMockup className="absolute -bottom-6 right-0 w-36 sm:right-4 sm:w-44"><MiniApp /></PhoneMockup>
      </div>
      <div className="grid w-full gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <BrowserMockup url="app.kinetic.dev/overview"><div className="aspect-[16/9]"><DashboardShot /></div></BrowserMockup>
        <div className="flex justify-center gap-4">
          <PhoneMockup className="w-44" color="silver"><MiniApp /></PhoneMockup>
        </div>
      </div>
      <TabletMockup className="max-w-xl"><DashboardShot /></TabletMockup>
    </div>
  );
}

/* ---------------------------------------------------------------- backgrounds */

function HeroCard({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="relative flex h-64 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-border bg-background p-6 text-center">
      {children}
      <span className="relative font-display text-2xl font-semibold tracking-tight">{title}</span>
      <span className="relative text-sm text-muted">{sub}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- orbit */

function OrbitDemo() {
  return (
    <div className="relative flex size-[380px] max-w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
      <span className="z-10 flex size-16 items-center justify-center rounded-2xl bg-accent font-display text-xl font-bold text-accent-foreground shadow-[0_0_60px_-10px_var(--kn-accent)]">K</span>
      <OrbitingCircles radius={80} duration={18} iconSize={36}>
        <CodeIcon /><DatabaseIcon /><ShieldIcon />
      </OrbitingCircles>
      <OrbitingCircles radius={150} duration={30} reverse iconSize={44} offset={30}>
        <CloudIcon /><BotIcon /><GitBranchIcon /><BellIcon /><CpuIcon />
      </OrbitingCircles>
    </div>
  );
}

/* ---------------------------------------------------------------- scroll */

function ScrollDemo() {
  const box = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="h-[560px] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-background [scrollbar-width:thin]">
      <div className="flex h-[260px] items-end justify-center pb-6 text-sm text-subtle">Scroll down inside this box</div>
      <div className="px-6 pb-40">
        <ScrollShowcase
          container={box}
          title={
            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline">New in 0.2</Badge>
              <h3 className="max-w-lg font-display text-4xl font-semibold tracking-tight">Your whole product, <GradientText>one screen away</GradientText></h3>
            </div>
          }
        >
          <div className="aspect-[16/9]"><DashboardShot /></div>
        </ScrollShowcase>
      </div>
    </div>
  );
}

export const showpieceDemos: Record<string, () => React.ReactNode> = {
  "animated-beam": () => <BeamDemo />,
  globe: () => <GlobeDemo />,
  "device-mockup": () => <DevicesDemo />,
  "aurora-background": () => (
    <div className="relative flex h-80 w-full max-w-3xl flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-background text-center">
      <AuroraBackground />
      <span className="relative font-display text-4xl font-semibold tracking-tight">Ship with a glow</span>
      <span className="relative max-w-sm text-sm text-muted">A slow aurora behind your hero. Pure CSS, theme-aware, and still for reduced motion.</span>
      <Button className="relative">Get started</Button>
    </div>
  ),
  particles: () => (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <HeroCard title="Particles" sub="Move your pointer over me"><Particles /></HeroCard>
      <HeroCard title="Connected" sub="Constellation mode"><Particles density={28} connect color="#7dd3fc" /></HeroCard>
    </div>
  ),
  meteors: () => (
    <div className="w-full max-w-md">
      <HeroCard title="Meteor shower" sub="Shooting stars for cards and heroes"><Meteors count={20} /></HeroCard>
    </div>
  ),
  "gradient-text": () => (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-display text-5xl font-semibold tracking-tight">Build <GradientText>beautiful</GradientText> apps</h2>
      <GradientText as="p" className="font-display text-2xl font-semibold" colors={["#f9a8d4", "#c4b5fd", "#7dd3fc", "#f9a8d4"]} speed={4}>Any colours you like</GradientText>
    </div>
  ),
  "blur-text": () => <BlurTextDemo />,
  "orbiting-circles": () => <OrbitDemo />,
  "scroll-showcase": () => <ScrollDemo />,
};

function BlurTextDemo() {
  const [k, setK] = React.useState(0);
  return (
    <div className="flex max-w-xl flex-col items-center gap-6 text-center">
      <BlurText key={`a${k}`} text="Interfaces that feel alive." as="h2" className="justify-center font-display text-4xl font-semibold tracking-tight" />
      <BlurText key={`b${k}`} text="Letter by letter, from a soft blur." by="letter" stagger={0.025} delay={0.5} className="justify-center text-lg text-muted" />
      <Button size="sm" variant="outline" onClick={() => setK((x) => x + 1)}>Replay</Button>
    </div>
  );
}
