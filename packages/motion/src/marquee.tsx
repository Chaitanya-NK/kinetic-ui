"use client";

import * as React from "react";
import { cn } from "@kineticui/core";

export type MarqueeProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Gap between items, any CSS length. */
  gap?: string;
};

/** Infinitely scrolling row. Children are duplicated once for a seamless loop. */
export function Marquee({
  className,
  duration = 30,
  reverse = false,
  pauseOnHover = true,
  gap = "1rem",
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]",
        className,
      )}
      {...props}
    >
      <div
        data-kn-motion
        className={cn(
          "flex w-max animate-kn-marquee",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--kn-marquee-duration": `${duration}s`, gap } as React.CSSProperties}
      >
        <div className="flex shrink-0" style={{ gap }}>{children}</div>
        {/* The visual copy for the seamless loop: hidden from assistive tech and made inert so its links can't be tabbed to. */}
        <div className="flex shrink-0" style={{ gap }} aria-hidden ref={(el) => el?.setAttribute("inert", "")}>
          {children}
        </div>
      </div>
    </div>
  );
}
