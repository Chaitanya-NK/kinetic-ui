import * as React from "react";
import { cn } from "@kineticui/core";

export type OrbitingCirclesProps = {
  /** Orbit radius in px. */
  radius?: number;
  /** Seconds per revolution. */
  duration?: number;
  reverse?: boolean;
  /** Draw the orbit ring. */
  path?: boolean;
  /** Size of each orbiting item in px. */
  iconSize?: number;
  /** Shift the starting angle (degrees) so several rings don't line up. */
  offset?: number;
  className?: string;
  children: React.ReactNode;
};

/** Items that circle a centre point, spaced evenly. Stack a few with different radii around a logo. CSS only. */
export function OrbitingCircles({ radius = 120, duration = 24, reverse = false, path = true, iconSize = 40, offset = 0, className, children }: OrbitingCirclesProps) {
  const items = React.Children.toArray(children);
  return (
    <>
      {path ? (
        <svg aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width={radius * 2 + 2} height={radius * 2 + 2}>
          <circle cx={radius + 1} cy={radius + 1} r={radius} fill="none" stroke="var(--kn-border-strong)" strokeDasharray="4 6" strokeOpacity={0.7} />
        </svg>
      ) : null}
      {items.map((child, i) => (
        <div
          key={i}
          data-kn-motion
          className={cn("absolute left-1/2 top-1/2 flex items-center justify-center rounded-full border border-border-strong bg-surface-raised [&_svg]:size-1/2", className)}
          style={
            {
              width: iconSize,
              height: iconSize,
              margin: -iconSize / 2,
              "--r": `${radius}px`,
              "--start": `${offset + (360 / items.length) * i}deg`,
              animation: `kn-orbit ${duration}s linear infinite${reverse ? " reverse" : ""}`,
            } as React.CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </>
  );
}
