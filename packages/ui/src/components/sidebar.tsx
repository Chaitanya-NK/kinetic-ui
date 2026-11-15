"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { ChevronLeftIcon } from "@kineticui/icons";

type SidebarContextValue = { collapsed: boolean };
const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false });

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  /** Icon-only mode. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Top slot, e.g. a workspace switcher. */
  header?: React.ReactNode;
  /** Bottom slot, e.g. a user card or upgrade prompt. */
  footer?: React.ReactNode;
};

/** App sidebar with sections, badges, and a collapse-to-icons mode. */
export function Sidebar({ collapsed = false, onCollapsedChange, header, footer, className, children, ...props }: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        data-collapsed={collapsed || undefined}
        className={cn(
          "flex h-full flex-col gap-2 border-r border-border bg-surface p-3 transition-[width] duration-300 ease-kn-out",
          collapsed ? "w-[68px]" : "w-64",
          className,
        )}
        {...props}
      >
        {header ? <div className="mb-2">{header}</div> : null}
        <nav aria-label="Sidebar" className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {children}
        </nav>
        {footer && !collapsed ? <div className="mt-2">{footer}</div> : null}
        {onCollapsedChange ? (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => onCollapsedChange(!collapsed)}
            className="flex h-9 items-center justify-center gap-2 rounded-lg text-sm text-subtle hover:bg-surface-raised hover:text-foreground"
          >
            <ChevronLeftIcon size={16} className={cn("transition-transform duration-300", collapsed && "rotate-180")} />
            {collapsed ? null : "Collapse"}
          </button>
        ) : null}
      </aside>
    </SidebarContext.Provider>
  );
}

export function SidebarSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const { collapsed } = React.useContext(SidebarContext);
  return (
    <div className="flex flex-col gap-0.5">
      {title && !collapsed ? <span className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-subtle">{title}</span> : null}
      {title && collapsed ? <span className="mx-3 mb-1 h-px bg-border" /> : null}
      {children}
    </div>
  );
}

export type SidebarItemProps = {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  badge?: React.ReactNode;
  onClick?: () => void;
};

export function SidebarItem({ icon, label, href, active, badge, onClick }: SidebarItemProps) {
  const { collapsed } = React.useContext(SidebarContext);
  const className = cn(
    "group relative flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm transition-colors [&_svg]:size-[18px] [&_svg]:shrink-0",
    active ? "bg-surface-overlay font-medium text-foreground [&_svg]:text-accent" : "text-muted hover:bg-surface-raised hover:text-foreground",
    collapsed && "justify-center px-0",
  );
  const inner = (
    <>
      {icon}
      {collapsed ? null : <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge !== undefined ? <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-[11px] text-muted">{badge}</span> : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background group-hover:block group-focus-visible:block">
          {label}
        </span>
      ) : null}
    </>
  );
  return href ? (
    <a href={href} aria-current={active ? "page" : undefined} aria-label={collapsed ? label : undefined} className={className}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={collapsed ? label : undefined} className={className}>
      {inner}
    </button>
  );
}
