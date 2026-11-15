import * as React from "react";
import { cn } from "@kineticui/core";

export type MacWindowProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Text in the title bar, e.g. "user@host: ~/contact". */
  title?: React.ReactNode;
  /** light: paper-white window. dark: terminal black. auto: follows the theme surface. */
  tone?: "auto" | "light" | "dark";
  /** Right side of the title bar. */
  actions?: React.ReactNode;
  /** Monospace body (terminal look). */
  mono?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
  bodyClassName?: string;
};

const tones = {
  auto: { win: "border-border bg-surface text-foreground", bar: "border-border bg-surface-raised/60 text-muted" },
  light: { win: "border-black/10 bg-[#fdfdfb] text-[#1f2328]", bar: "border-black/[0.07] bg-[#f3f2ee] text-[#57606a]" },
  dark: { win: "border-white/10 bg-[#0b0c0e] text-[#E8E8E3]", bar: "border-white/10 bg-[#141518] text-white/50" },
};

/** macOS-style window chrome: traffic lights, centred title and an optional monospace body. */
export function MacWindow({ title, tone = "auto", actions, mono, onClose, onMinimize, onZoom, className, bodyClassName, children, ...props }: MacWindowProps) {
  const t = tones[tone];
  const light = (color: string, label: string, onClick?: () => void, glyph?: string) => (
    <button
      type="button"
      aria-label={label}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      className="group/l flex size-3 items-center justify-center rounded-full text-[8px] font-bold leading-none text-black/60"
      style={{ background: color }}
    >
      <span className="opacity-0 group-hover/w:opacity-100">{glyph}</span>
    </button>
  );
  return (
    <div className={cn("group/w flex flex-col overflow-hidden rounded-2xl border shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]", t.win, className)} {...props}>
      <div className={cn("relative flex h-11 shrink-0 items-center gap-2 border-b px-4", t.bar)}>
        <div className="flex gap-2">
          {light("#FF5F57", "Close", onClose, "×")}
          {light("#FEBC2E", "Minimize", onMinimize, "−")}
          {light("#28C840", "Zoom", onZoom, "+")}
        </div>
        {title ? <span className="pointer-events-none ml-3 truncate font-mono text-[13px]">{title}</span> : null}
        {actions ? <div className="ml-auto flex items-center gap-1">{actions}</div> : null}
      </div>
      <div className={cn("flex-1", mono && "font-mono", bodyClassName)}>{children}</div>
    </div>
  );
}
