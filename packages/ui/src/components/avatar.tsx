"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";

const sizes = { sm: "size-8 text-[11px]", md: "size-11 text-sm", lg: "size-14 text-base", xl: "size-20 text-xl" };
const statusColors = { online: "bg-success", away: "bg-warning", busy: "bg-danger", offline: "bg-subtle" };

export type AvatarProps = {
  src?: string;
  alt?: string;
  /** Shown while the image loads or if it fails. Defaults to initials of `alt`. */
  fallback?: string;
  size?: keyof typeof sizes;
  status?: keyof typeof statusColors;
  /** Accent ring, e.g. for "has a new story". */
  ring?: boolean;
  /** Fallback background colour. */
  color?: string;
  className?: string;
};

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({ src, alt = "", fallback, size = "md", status, ring, color, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", ring && "rounded-full p-[3px] ring-2 ring-accent", className)}>
      <AvatarPrimitive.Root className={cn("relative flex overflow-hidden rounded-full", sizes[size])}>
        {src ? <AvatarPrimitive.Image src={src} alt={alt} className="size-full object-cover" /> : null}
        <AvatarPrimitive.Fallback
          delayMs={src ? 400 : 0}
          className="flex size-full items-center justify-center font-semibold text-background"
          style={{ background: color ?? "var(--kn-info)" }}
          aria-label={alt || undefined}
        >
          {fallback ?? initials(alt)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status ? (
        <span
          aria-label={status}
          className={cn("absolute bottom-0 right-0 size-3 rounded-full border-2 border-background", statusColors[status])}
        />
      ) : null}
    </span>
  );
}

export type AvatarStackProps = {
  avatars: AvatarProps[];
  /** Show at most this many, then "+N". */
  max?: number;
  size?: keyof typeof sizes;
  className?: string;
};

/** Overlapping avatars that fan out on hover. */
export function AvatarStack({ avatars, max = 4, size = "md", className }: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  return (
    <div className={cn("group flex items-center", className)}>
      {shown.map((a, i) => (
        <span
          key={i}
          className="-ml-3 rounded-full border-[3px] border-background transition-[margin] duration-300 ease-kn-spring first:ml-0 group-hover:-ml-1 group-hover:first:ml-0"
        >
          <Avatar {...a} size={size} status={undefined} ring={false} />
        </span>
      ))}
      {rest > 0 ? (
        <span
          className={cn(
            "-ml-3 flex items-center justify-center rounded-full border-[3px] border-background bg-surface-overlay font-semibold text-foreground transition-[margin] duration-300 group-hover:-ml-1",
            sizes[size],
          )}
        >
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
