"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { motion } from "motion/react";
import { cn, useMounted } from "@kineticui/core";
import { useTheme, type ThemeMode } from "@kineticui/core/theme";
import { MoonIcon, SunIcon } from "@kineticui/icons";

const STYLE_ID = "kn-theme-ripple";
const css = `::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}::view-transition-new(root){z-index:2}`;

type Origin = { x: number; y: number } | React.MouseEvent | React.PointerEvent | null | undefined;

const point = (o: Origin) => {
  if (!o) return { x: innerWidth / 2, y: innerHeight / 2 };
  if ("clientX" in o) {
    // Keyboard "clicks" report 0,0: start from the centre of the element instead.
    if (o.clientX === 0 && o.clientY === 0 && o.currentTarget instanceof Element) {
      const r = o.currentTarget.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: o.clientX, y: o.clientY };
  }
  return o;
};

/**
 * Change the theme with a circular reveal that spreads from the click, using the View Transitions API.
 * Falls back to an instant switch where it isn't supported or when reduced motion is on.
 */
export function useThemeRipple({ duration = 650 }: { duration?: number } = {}) {
  const theme = useTheme();
  const setModeFrom = React.useCallback(
    (mode: ThemeMode, origin?: Origin) => {
      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => { ready: Promise<void> } };
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!doc.startViewTransition || reduce) return theme.setMode(mode);
      if (!document.getElementById(STYLE_ID)) {
        const s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = css;
        document.head.appendChild(s);
      }
      const { x, y } = point(origin);
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const target = mode === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode;
      const vt = doc.startViewTransition(async () => {
        flushSync(() => theme.setMode(mode));
        // The provider applies the class in an effect; wait (briefly) until the page reflects it.
        for (let i = 0; i < 6 && !document.documentElement.classList.contains(target); i++) await new Promise((res) => requestAnimationFrame(() => res(null)));
      });
      vt.ready.then(() => {
        document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" });
      });
    },
    [theme, duration],
  );
  const toggle = React.useCallback((origin?: Origin) => setModeFrom(theme.resolvedMode === "dark" ? "light" : "dark", origin), [theme.resolvedMode, setModeFrom]);
  return { ...theme, setModeFrom, toggle };
}

export type ThemeRippleButtonProps = { className?: string; size?: "sm" | "md" };

/** Sun / moon button that switches the theme with a circular ripple from where you click. */
export function ThemeRippleButton({ className, size = "md" }: ThemeRippleButtonProps) {
  const { resolvedMode, toggle } = useThemeRipple();
  const mounted = useMounted();
  const dark = mounted ? resolvedMode === "dark" : true;
  return (
    <button
      type="button"
      onClick={(e) => toggle(e)}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-foreground outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
    >
      <motion.span key={dark ? "moon" : "sun"} initial={{ y: 18, rotate: -90, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="flex">
        {dark ? <MoonIcon size={size === "sm" ? 15 : 18} /> : <SunIcon size={size === "sm" ? 15 : 18} />}
      </motion.span>
    </button>
  );
}
