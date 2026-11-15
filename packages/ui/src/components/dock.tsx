"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

type DockContextValue = { mouseX: MotionValue<number>; base: number; magnification: number; distance: number; reduced: boolean };
const DockContext = React.createContext<DockContextValue | null>(null);

export type DockProps = {
  children: React.ReactNode;
  /** Icon size at rest, px. */
  baseSize?: number;
  /** Icon size directly under the cursor, px. */
  magnification?: number;
  /** How far (px) the magnification reaches. */
  distance?: number;
  className?: string;
  "aria-label"?: string;
};

/** macOS-style dock: icons grow as the pointer passes over them. */
export function Dock({ children, baseSize = 44, magnification = 72, distance = 140, className, ...rest }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const reduced = useReducedMotion();
  return (
    <DockContext.Provider value={{ mouseX, base: baseSize, magnification, distance, reduced }}>
      <nav
        aria-label={rest["aria-label"] ?? "Dock"}
        onPointerMove={(e) => mouseX.set(e.pageX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto flex h-[calc(var(--kn-dock-base)+20px)] items-end gap-2.5 rounded-[22px] border border-border-strong bg-surface-raised px-3.5 pb-2.5",
          className,
        )}
        style={{ "--kn-dock-base": `${baseSize}px` } as React.CSSProperties}
      >
        {children}
      </nav>
    </DockContext.Provider>
  );
}

export type DockItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
};

export function DockItem({ icon, label, onClick, href, active }: DockItemProps) {
  const ctx = React.useContext(DockContext);
  if (!ctx) throw new Error("DockItem must be used inside <Dock>");
  const ref = React.useRef<HTMLDivElement>(null);
  const [hover, setHover] = React.useState(false);

  const dist = useTransform(ctx.mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + window.scrollX) - r.width / 2 : Infinity;
  });
  const sizeRaw = useTransform(dist, [-ctx.distance, 0, ctx.distance], [ctx.base, ctx.magnification, ctx.base]);
  const size = useSpring(sizeRaw, { mass: 0.1, stiffness: 160, damping: 13 });

  const inner = (
    <motion.div
      ref={ref}
      style={ctx.reduced ? { width: ctx.base, height: ctx.base } : { width: size, height: size }}
      className={cn(
        "relative flex items-center justify-center rounded-[14px] bg-surface-overlay text-muted transition-colors hover:text-foreground [&_svg]:size-[45%]",
        active && "bg-accent text-accent-foreground hover:text-accent-foreground",
      )}
    >
      {icon}
      {hover ? (
        <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background">
          {label}
        </span>
      ) : null}
      {active ? <span className="absolute -bottom-2 size-1 rounded-full bg-accent" /> : null}
    </motion.div>
  );

  const common = {
    "aria-label": label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    className: "rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
  };

  return href ? (
    <a href={href} {...common}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} {...common}>
      {inner}
    </button>
  );
}
