import * as React from "react";
import { cn } from "@kineticui/core";

type FrameProps = { children?: React.ReactNode; className?: string; screenClassName?: string };

/** Modern phone frame with a dynamic-island cut-out. Put a screenshot or live UI inside. */
export function PhoneMockup({ children, className, screenClassName, color = "graphite" }: FrameProps & { color?: "graphite" | "silver" | "lime" }) {
  const body = color === "silver" ? "bg-[#d9dadc]" : color === "lime" ? "bg-[#9fc21f]" : "bg-[#1c1c1f]";
  return (
    <div className={cn("relative aspect-[9/19.5] w-72 shrink-0 rounded-[3rem] p-[10px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)]", body, className)}>
      <div className="pointer-events-none absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/15" />
      {/* side buttons */}
      <span className={cn("absolute -left-[3px] top-28 h-8 w-[3px] rounded-l", body)} />
      <span className={cn("absolute -left-[3px] top-40 h-14 w-[3px] rounded-l", body)} />
      <span className={cn("absolute -right-[3px] top-36 h-20 w-[3px] rounded-r", body)} />
      <div className={cn("relative size-full overflow-hidden rounded-[2.4rem] bg-background", screenClassName)}>
        {children}
        <span className="absolute left-1/2 top-2.5 z-10 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
        <span className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_40%)]" />
      </div>
    </div>
  );
}

/** Browser window with traffic lights, tabs-free toolbar and an address pill. */
export function BrowserMockup({ children, className, screenClassName, url = "kinetic.dev" }: FrameProps & { url?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]", className)}>
      <div className="flex h-10 items-center gap-3 border-b border-border bg-surface-raised px-4">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto flex h-6 w-full max-w-xs items-center justify-center gap-1.5 rounded-md bg-background px-3 font-mono text-[11px] text-subtle">
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          {url}
        </span>
        <span className="w-[52px]" />
      </div>
      <div className={cn("relative bg-background", screenClassName)}>{children}</div>
    </div>
  );
}

/** Laptop with a thin bezel, camera notch and a tapered base. */
export function LaptopMockup({ children, className, screenClassName }: FrameProps) {
  return (
    <div className={cn("flex w-full max-w-3xl flex-col items-center", className)}>
      <div className="relative w-[88%] rounded-t-[1.4rem] bg-[#1c1c1f] p-[1.6%] pb-[2.2%] ring-1 ring-inset ring-white/10">
        <span className="absolute left-1/2 top-[0.6%] size-1.5 -translate-x-1/2 rounded-full bg-[#2c2c30]" />
        <div className={cn("relative aspect-[16/10] overflow-hidden rounded-md bg-background", screenClassName)}>{children}</div>
      </div>
      <div className="relative h-3 w-full rounded-b-[1rem] bg-gradient-to-b from-[#3a3a3e] to-[#1a1a1d] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
        <span className="absolute left-1/2 top-0 h-1.5 w-1/6 -translate-x-1/2 rounded-b-md bg-[#232326]" />
      </div>
    </div>
  );
}

/** Tablet in landscape with even bezels. */
export function TabletMockup({ children, className, screenClassName }: FrameProps) {
  return (
    <div className={cn("relative aspect-[4/3] w-full max-w-2xl rounded-[2rem] bg-[#1c1c1f] p-[2.4%] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/10", className)}>
      <span className="absolute left-[1.1%] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-[#2c2c30]" />
      <div className={cn("relative size-full overflow-hidden rounded-[1.1rem] bg-background", screenClassName)}>{children}</div>
    </div>
  );
}
