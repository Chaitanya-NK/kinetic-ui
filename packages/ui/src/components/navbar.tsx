"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type NavbarItem = { label: string; href: string; active?: boolean };

export type NavbarProps = {
  logo?: React.ReactNode;
  items: NavbarItem[];
  /** Buttons on the right, e.g. "Start free". */
  actions?: React.ReactNode;
  /** Hide while scrolling down, show again when scrolling up. */
  hideOnScroll?: boolean;
  /** Custom link renderer, e.g. Next.js <Link>. */
  renderLink?: (item: NavbarItem, props: { className: string; children: React.ReactNode }) => React.ReactNode;
  className?: string;
};

/** Floating pill navbar that shrinks on scroll and slides away while you scroll down. */
export function Navbar({ logo, items, actions, hideOnScroll = true, renderLink, className }: NavbarProps) {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [hover, setHover] = React.useState<string | null>(null);
  const id = React.useId();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (hideOnScroll) setHidden(y > prev && y > 160);
  });

  return (
    <motion.header
      animate={{ y: hidden ? -100 : 0 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      className={cn("fixed inset-x-0 top-4 z-40 flex justify-center px-4", className)}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex items-center gap-1 rounded-full border border-border-strong bg-surface-overlay/85 p-1.5 shadow-overlay backdrop-blur-xl transition-[padding] duration-300",
          scrolled && "p-1",
        )}
      >
        {logo ? <span className="flex items-center gap-2 pl-2.5 pr-3 font-display font-semibold">{logo}</span> : null}
        <ul className="hidden items-center sm:flex" onPointerLeave={() => setHover(null)}>
          {items.map((it) => {
            const highlight = hover ? hover === it.href : it.active;
            const className = cn(
              "relative block rounded-full px-4 py-2 text-sm transition-colors",
              it.active ? "text-foreground" : "text-muted hover:text-foreground",
            );
            const children = (
              <>
                {highlight ? (
                  <motion.span layoutId={`kn-nav-${id}`} className="absolute inset-0 rounded-full bg-surface-raised" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                ) : null}
                <span className="relative">{it.label}</span>
              </>
            );
            return (
              <li key={it.href} onPointerEnter={() => setHover(it.href)}>
                {renderLink ? (
                  renderLink(it, { className, children })
                ) : (
                  <a href={it.href} aria-current={it.active ? "page" : undefined} className={className}>
                    {children}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        {actions ? <span className="ml-1 flex items-center gap-1.5">{actions}</span> : null}
      </nav>
    </motion.header>
  );
}
