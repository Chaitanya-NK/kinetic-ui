"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronRightIcon } from "@kineticui/icons";

export type PageHeaderProps = {
  breadcrumbs?: { label: string; href?: string }[];
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Icon or avatar left of the title. */
  icon?: React.ReactNode;
  /** Small chips next to the title, e.g. status badges. */
  badges?: React.ReactNode;
  /** Buttons on the right. */
  actions?: React.ReactNode;
  /** Key facts under the title: [{ label, value }]. */
  meta?: { label: string; value: React.ReactNode }[];
  tabs?: { value: string; label: string; count?: number }[];
  activeTab?: string;
  onTabChange?: (v: string) => void;
  /** Stick to the top and shrink on scroll. */
  sticky?: boolean;
  className?: string;
};

/** App page header: breadcrumbs, icon, title + badges, actions, meta row and underline tabs. */
export function PageHeader({ breadcrumbs, title, description, icon, badges, actions, meta, tabs, activeTab, onTabChange, sticky, className }: PageHeaderProps) {
  const id = React.useId();
  return (
    <header className={cn("flex flex-col gap-4 border-b border-border bg-background/85 pt-6 backdrop-blur-xl", sticky && "sticky top-0 z-20", !tabs && "pb-6", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-subtle">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i ? <ChevronRightIcon size={13} /> : null}
              {b.href ? <a href={b.href} className="hover:text-foreground">{b.label}</a> : <span aria-current="page" className="text-foreground">{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start gap-4">
        {icon ? <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-raised text-accent [&_svg]:size-6">{icon}</span> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
            {badges}
          </div>
          {description ? <p className="max-w-2xl text-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {meta?.length ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {meta.map((m) => (
            <div key={m.label} className="flex flex-col">
              <dt className="text-xs text-subtle">{m.label}</dt>
              <dd className="font-medium">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {tabs?.length ? (
        <nav role="tablist" className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const on = t.value === activeTab;
            return (
              <button key={t.value} role="tab" type="button" aria-selected={on} onClick={() => onTabChange?.(t.value)} className={cn("relative flex items-center gap-2 whitespace-nowrap px-3 pb-3 pt-1 text-sm transition-colors", on ? "text-foreground" : "text-subtle hover:text-foreground")}>
                {t.label}
                {t.count !== undefined ? <span className="rounded-full bg-surface-overlay px-1.5 font-mono text-[10px]">{t.count}</span> : null}
                {on ? <motion.span layoutId={`kn-ph-${id}`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" /> : null}
              </button>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
