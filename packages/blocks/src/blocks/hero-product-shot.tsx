"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { AreaChart, Badge, Button, Sparkline } from "@kineticui/ui";
import { BorderBeam } from "@kineticui/motion";
import { ArrowRightIcon, ChartIcon, HomeIcon, SettingsIcon, UsersIcon } from "@kineticui/icons";

const data = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({ day: d, visitors: Math.round(1200 + Math.sin(i * 1.3) * 400 + i * 260) }));

/** Headline above a large app screenshot in a browser frame that tilts flat as you scroll. */
export function HeroProductShot({
  title = "Analytics your whole team will actually open",
  description = "Beautiful dashboards, instant answers, zero SQL. Plug in your data and share a link.",
}: {
  title?: string;
  description?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <section className="flex flex-col items-center gap-14 overflow-hidden px-6 pb-24 pt-20">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <Badge variant="outline">Analytics · v4</Badge>
        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
        <p className="max-w-xl text-lg text-muted">{description}</p>
        <div className="flex gap-3">
          <Button size="lg">Start free <ArrowRightIcon size={16} /></Button>
          <Button size="lg" variant="secondary">Book a demo</Button>
        </div>
      </div>
      <div ref={ref} className="w-full max-w-5xl [perspective:1400px]">
        <motion.div style={{ rotateX, scale }} className="relative origin-bottom overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)]">
          <BorderBeam />
          <div className="flex h-10 items-center gap-2 border-b border-border px-4">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
            <span className="mx-auto rounded-md bg-surface-raised px-16 py-1 font-mono text-[11px] text-subtle">app.pulse.io</span>
          </div>
          <div className="flex">
            <div className="hidden w-48 flex-col gap-1 border-r border-border p-3 sm:flex">
              {[
                [<HomeIcon key="h" size={15} />, "Home"],
                [<ChartIcon key="c" size={15} />, "Reports"],
                [<UsersIcon key="u" size={15} />, "Audiences"],
                [<SettingsIcon key="s" size={15} />, "Settings"],
              ].map(([icon, label], i) => (
                <span key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${i === 1 ? "bg-surface-overlay text-foreground" : "text-muted"}`}>
                  {icon}
                  {label}
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="grid grid-cols-3 gap-3">
                {[["Visitors", "18.4k", [3, 5, 4, 7, 6, 9]], ["Signups", "1,204", [2, 3, 5, 4, 6, 8]], ["Revenue", "$9.8k", [4, 4, 6, 5, 8, 9]]].map(([l, v, s]) => (
                  <div key={l as string} className="flex items-end justify-between rounded-xl border border-border bg-background p-3">
                    <div>
                      <div className="text-xs text-subtle">{l as string}</div>
                      <div className="font-display text-xl font-semibold">{v as string}</div>
                    </div>
                    <Sparkline data={s as number[]} width={60} height={28} />
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <AreaChart data={data} index="day" series={[{ key: "visitors", name: "Visitors" }]} height={200} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
