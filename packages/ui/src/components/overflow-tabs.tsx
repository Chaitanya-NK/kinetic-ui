"use client";

import * as React from "react";
import { DropdownMenu as MenuPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { cn, useControllableState } from "@kineticui/core";
import { ChevronDownIcon } from "@kineticui/icons";

export type OverflowTab = { value: string; label: string; icon?: React.ReactNode; count?: number };

export type OverflowTabsProps = {
  tabs: OverflowTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  className?: string;
};

/** Tab bar that measures itself and folds tabs that don't fit into a "More" menu. The active tab always stays visible. */
export function OverflowTabs({ tabs, value, defaultValue, onValueChange, className }: OverflowTabsProps) {
  const [current, setCurrent] = useControllableState({ value, defaultValue: defaultValue ?? tabs[0]?.value ?? "", onChange: onValueChange });
  const wrap = React.useRef<HTMLDivElement>(null);
  const measure = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(tabs.length);
  const id = React.useId();

  React.useLayoutEffect(() => {
    const el = wrap.current;
    const m = measure.current;
    if (!el || !m) return;
    const calc = () => {
      const widths = Array.from(m.children).map((c) => (c as HTMLElement).offsetWidth + 4);
      const more = 92;
      let used = 0;
      let n = 0;
      for (let i = 0; i < widths.length; i++) {
        const needMore = i < widths.length - 1;
        if (used + widths[i]! + (needMore ? more : 0) > el.clientWidth) break;
        used += widths[i]!;
        n++;
      }
      setVisibleCount(Math.max(1, n));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tabs]);

  let visible = tabs.slice(0, visibleCount);
  let hidden = tabs.slice(visibleCount);
  const activeHidden = hidden.find((t) => t.value === current);
  if (activeHidden && visible.length) {
    // Swap the active tab into view.
    hidden = [visible[visible.length - 1]!, ...hidden.filter((t) => t !== activeHidden)];
    visible = [...visible.slice(0, -1), activeHidden];
  }

  const tabEl = (t: OverflowTab, interactive = true) => {
    const on = t.value === current;
    return (
      <button
        key={t.value}
        type="button"
        role={interactive ? "tab" : undefined}
        aria-selected={interactive ? on : undefined}
        tabIndex={interactive ? undefined : -1}
        onClick={interactive ? () => setCurrent(t.value) : undefined}
        className={cn("relative flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm transition-colors [&_svg]:size-4", on ? "text-foreground" : "text-subtle hover:text-foreground")}
      >
        {interactive && on ? <motion.span layoutId={`kn-ot-${id}`} className="absolute inset-0 rounded-lg bg-surface-raised" transition={{ type: "spring", stiffness: 500, damping: 38 }} /> : null}
        <span className="relative flex items-center gap-2">
          {t.icon}
          {t.label}
          {t.count !== undefined ? <span className="rounded-full bg-surface-overlay px-1.5 font-mono text-[10px]">{t.count}</span> : null}
        </span>
      </button>
    );
  };

  return (
    <div ref={wrap} className={cn("relative w-full", className)}>
      <div ref={measure} aria-hidden className="pointer-events-none invisible absolute flex gap-1">
        {tabs.map((t) => tabEl(t, false))}
      </div>
      <div role="tablist" className="flex items-center gap-1">
        {visible.map((t) => tabEl(t))}
        {hidden.length ? (
          <MenuPrimitive.Root>
            <MenuPrimitive.Trigger className="flex h-10 shrink-0 items-center gap-1 rounded-lg px-3 text-sm text-subtle outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent data-[state=open]:bg-surface-raised">
              More <span className="rounded-full bg-surface-overlay px-1.5 font-mono text-[10px]">{hidden.length}</span>
              <ChevronDownIcon size={14} />
            </MenuPrimitive.Trigger>
            <MenuPrimitive.Portal>
              <MenuPrimitive.Content align="end" sideOffset={6} className="z-50 min-w-44 rounded-xl border border-border-strong bg-surface-raised p-1.5 shadow-overlay data-[state=open]:animate-[kn-pop_0.14s_var(--ease-kn-out)]">
                {hidden.map((t) => (
                  <MenuPrimitive.Item key={t.value} onSelect={() => setCurrent(t.value)} className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-[highlighted]:bg-surface-overlay [&_svg]:size-4 [&_svg]:text-muted">
                    {t.icon}
                    <span className="flex-1">{t.label}</span>
                    {t.count !== undefined ? <span className="font-mono text-[10px] text-subtle">{t.count}</span> : null}
                  </MenuPrimitive.Item>
                ))}
              </MenuPrimitive.Content>
            </MenuPrimitive.Portal>
          </MenuPrimitive.Root>
        ) : null}
      </div>
    </div>
  );
}
