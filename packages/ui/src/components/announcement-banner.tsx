"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ArrowRightIcon, XIcon } from "@kineticui/icons";

export type AnnouncementBannerProps = {
  children: React.ReactNode;
  /** Small pill before the text, e.g. "New". */
  tag?: string;
  href?: string;
  linkLabel?: string;
  /** accent: lime bar. subtle: surface bar. gradient: animated sheen. */
  variant?: "accent" | "subtle" | "gradient";
  /** Remember dismissal in localStorage under this key. */
  dismissKey?: string;
  dismissible?: boolean;
  className?: string;
};

/** Slim top-of-page announcement with optional link and remembered dismissal. */
export function AnnouncementBanner({
  children,
  tag,
  href,
  linkLabel = "Learn more",
  variant = "accent",
  dismissKey,
  dismissible = true,
  className,
}: AnnouncementBannerProps) {
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    if (!dismissKey) return;
    try {
      if (localStorage.getItem(dismissKey) === "1") setOpen(false);
    } catch {
      /* storage unavailable */
    }
  }, [dismissKey]);

  const dismiss = () => {
    setOpen(false);
    if (dismissKey) {
      try {
        localStorage.setItem(dismissKey, "1");
      } catch {
        /* storage unavailable */
      }
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          role="region"
          aria-label="Announcement"
          exit={{ height: 0, opacity: 0 }}
          className={cn(
            "relative overflow-hidden",
            variant === "accent" && "bg-accent text-accent-foreground",
            variant === "subtle" && "border-b border-border bg-surface text-foreground",
            variant === "gradient" && "bg-[linear-gradient(110deg,var(--kn-surface-raised)_40%,var(--kn-accent-soft)_50%,var(--kn-surface-raised)_60%)] bg-[length:250%_100%] text-foreground animate-kn-shine",
            className,
          )}
        >
          <div className="mx-auto flex min-h-10 max-w-6xl items-center justify-center gap-3 px-12 py-2 text-center text-sm">
            {tag ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                  variant === "accent" ? "bg-accent-foreground text-accent" : "bg-accent text-accent-foreground",
                )}
              >
                {tag}
              </span>
            ) : null}
            <span className="font-medium">{children}</span>
            {href ? (
              <a href={href} className="group inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                {linkLabel}
                <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>
          {dismissible ? (
            <button type="button" aria-label="Dismiss" onClick={dismiss} className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md opacity-70 hover:opacity-100">
              <XIcon size={15} />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
