"use client";

import Link from "next/link";
import { motion } from "motion/react";

export const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

/** Top bar with animated tab indicator. Pass onNavigate to use it without the App Router (e.g. in a preview). */
export function DashboardFrame({ active, onNavigate, children }: { active: string; onNavigate?: (href: string) => void; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <span className="flex items-center gap-2 font-display font-semibold">
            <span className="size-6 rounded-md bg-accent" /> Northwind
          </span>
          <nav aria-label="Dashboard" className="flex h-full items-stretch gap-1 overflow-x-auto">
            {dashboardLinks.map((l) => {
              const on = active === l.href;
              const cls = `relative flex items-center px-3 text-sm transition-colors ${on ? "text-foreground" : "text-muted hover:text-foreground"}`;
              const inner = (
                <>
                  {l.label}
                  {on ? <motion.span layoutId="dash-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" /> : null}
                </>
              );
              return onNavigate ? (
                <button key={l.href} type="button" aria-current={on ? "page" : undefined} onClick={() => onNavigate(l.href)} className={cls}>{inner}</button>
              ) : (
                <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined} className={cls}>{inner}</Link>
              );
            })}
          </nav>
          <span aria-label="Maya Kapoor" className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">MK</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
