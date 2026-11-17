"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { AvatarStack, Badge, Button, Sparkline, Switch, TypingIndicator } from "@kineticui/ui";
import { BorderBeam, GridBackground } from "@kineticui/motion";
import { ArrowRightIcon, CheckIcon, GitBranchIcon, SparkleIcon } from "@kineticui/icons";
import { site } from "@/lib/site";
import { CopyButton } from "@/components/code-block";

const installs = [
  { id: "cli", label: "CLI", cmd: "npx @kineticui/cli add dock" },
  { id: "npm", label: "npm", cmd: "npm i @kineticui/ui @kineticui/core" },
  { id: "shadcn", label: "shadcn", cmd: "npx shadcn add https://kinetic-ui.chaitanya-nk.com/r/dock.json" },
];

function InstallSwitcher() {
  const [tab, setTab] = React.useState("cli");
  const cmd = installs.find((i) => i.id === tab)!.cmd;
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-code">
      <div className="flex items-center gap-1 border-b border-border px-2 pt-2">
        {installs.map((i) => (
          <button key={i.id} type="button" onClick={() => setTab(i.id)} className="relative px-3 pb-2 pt-1 font-mono text-xs">
            <span className={tab === i.id ? "text-foreground" : "text-subtle hover:text-muted"}>{i.label}</span>
            {tab === i.id ? <motion.span layoutId="kn-hero-install" className="absolute inset-x-2 -bottom-px h-px bg-accent" /> : null}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 py-2.5 pl-4 pr-2 font-mono text-[13px] text-code-foreground">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="overflow-x-auto whitespace-nowrap">
            <span className="text-code-muted">$ </span>
            {cmd}
          </motion.span>
        </AnimatePresence>
        <CopyButton text={cmd} />
      </div>
    </div>
  );
}

/** A floating card that drifts gently and shifts with the pointer by `depth`. */
function Float({ px, py, depth, delay, className, children }: { px: MotionValue<number>; py: MotionValue<number>; depth: number; delay: number; className: string; children: React.ReactNode }) {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
        transition={{ opacity: { delay, duration: 0.5 }, scale: { delay, type: "spring", stiffness: 200, damping: 18 }, y: { delay: delay + 0.5, duration: 5 + depth / 10, repeat: Infinity, ease: "easeInOut" } }}
        className="rounded-2xl border border-border-strong bg-surface/90 shadow-overlay backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function LiveStack() {
  const ref = React.useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });
  const [on, setOn] = React.useState(true);
  const [toast, setToast] = React.useState(0);
  const [typing, setTyping] = React.useState(true);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = setInterval(() => setOn((v) => !v), 2600);
    const b = setInterval(() => setToast((n) => n + 1), 4200);
    const c = setInterval(() => setTyping((v) => !v), 2200);
    return () => { clearInterval(a); clearInterval(b); clearInterval(c); };
  }, []);

  const toasts = [
    { t: "Deployed to production", d: "kinetic-ui · 41s", tone: "bg-success" },
    { t: "3 components updated", d: "button, dialog, toast", tone: "bg-accent" },
    { t: "Theme exported", d: "midnight.css copied", tone: "bg-info" },
  ];
  const cur = toasts[toast % toasts.length]!;

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      className="relative h-[28.75rem] w-[33.75rem] select-none [&_*]:pointer-events-none"
    >
      <div className="absolute inset-10 rounded-full bg-accent/15 blur-[5.625rem]" />

      <Float px={px} py={py} depth={14} delay={0.15} className="left-0 top-6 w-[16.25rem]">
        <div className="flex flex-col gap-2 p-4">
          <span className="text-xs text-subtle">Revenue</span>
          <div className="flex items-end justify-between gap-3">
            <span className="font-display text-3xl font-semibold tracking-tight">$48.2k</span>
            <Sparkline data={[12, 18, 15, 22, 20, 27, 25, 33, 31, 40]} width={110} height={38} />
          </div>
          <Badge variant="success" size="sm" className="w-fit">▲ 12.4% this week</Badge>
        </div>
      </Float>

      <Float px={px} py={py} depth={22} delay={0.3} className="right-0 top-0 w-[15.625rem]">
        <div className="relative h-[4.25rem] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={toast} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="absolute inset-0 flex items-center gap-3 px-4">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-background ${cur.tone}`}><CheckIcon size={15} strokeWidth={3} /></span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{cur.t}</span>
                <span className="truncate text-xs text-subtle">{cur.d}</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </Float>

      <Float px={px} py={py} depth={30} delay={0.45} className="left-[18%] top-[10.5rem] w-[20.625rem]">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2 text-xs text-subtle"><SparkleIcon size={13} className="text-accent" /> Assistant</div>
          <p className="text-sm leading-relaxed">Added a spring to the drawer. It now follows your finger and settles where you let go.</p>
          <div className="flex h-5 items-center">
            <AnimatePresence mode="wait" initial={false}>
              {typing ? (
                <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TypingIndicator names={["Lena"]} /></motion.div>
              ) : (
                <motion.span key="s" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-subtle"><GitBranchIcon size={12} /> feat/drawer-spring · 2 files</motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Float>

      <Float px={px} py={py} depth={18} delay={0.6} className="bottom-6 left-0 w-[14.375rem]">
        <div className="flex items-center gap-3 p-4">
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">Email alerts</span>
            <span className="text-xs text-subtle">{on ? "On · weekly digest" : "Off"}</span>
          </div>
          <Switch checked={on} tabIndex={-1} aria-hidden />
        </div>
      </Float>

      <Float px={px} py={py} depth={26} delay={0.75} className="bottom-0 right-2 w-[15.625rem]">
        <div className="relative overflow-hidden rounded-2xl p-4">
          <BorderBeam />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pro</span>
            <Badge variant="solid" size="sm">Popular</Badge>
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">$19<span className="text-sm font-normal text-subtle">/mo</span></div>
          <div className="mt-3 flex items-center justify-between">
            <AvatarStack size="sm" avatars={[{ alt: "Maya Kapoor", color: "#C6F432" }, { alt: "Lena Ortiz", color: "#f9a8d4" }, { alt: "Arjun Mehta", color: "#7dd3fc" }]} />
            <span className="text-xs text-subtle">3 editing</span>
          </div>
        </div>
      </Float>
    </div>
  );
}

export function Hero({ counts }: { counts: { components: number; blocks: number; icons: number; templates: number } }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <GridBackground />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
        <div className="flex flex-col items-center gap-7 text-center lg:items-start lg:text-left">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/docs" className="group flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 py-1 pl-1 pr-3 text-sm text-muted backdrop-blur transition-colors hover:text-foreground">
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">v{site.version}</span>
              {counts.components} components · {counts.blocks} blocks · {counts.templates} templates, free and open source
              <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl xl:text-[5.5rem]">
            {["Components", "that"].map((w, i) => (
              <motion.span key={w} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08, type: "spring", stiffness: 220, damping: 20 }} className="mr-[0.22em] inline-block">{w}</motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, y: 30, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 12 }}
              whileHover={{ rotate: [0, -4, 3, 0], transition: { duration: 0.5 } }}
              className="inline-block text-accent"
            >
              move.
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="max-w-xl text-lg leading-relaxed text-muted">
            Motion-first React components and full-screen blocks for Next.js and Tailwind CSS v4. Accessible by default, themeable in seconds. Install from npm, or copy the source and own every line.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button asChild size="lg">
              <Link href="/components">Browse components <ArrowRightIcon size={16} /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/blocks">See {counts.blocks} blocks</Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="w-full max-w-lg">
            <InstallSwitcher />
          </motion.div>
        </div>
        {/* Laid out at desktop size, then scaled as one piece on small screens so the cards never collide. */}
        <div className="relative mx-auto h-[310px] w-full max-w-[540px] sm:h-[28.75rem] sm:max-w-[33.75rem]">
          <div className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.66] sm:scale-100">
            <LiveStack />
          </div>
        </div>
      </div>
    </section>
  );
}
