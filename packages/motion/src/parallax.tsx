"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn, useReducedMotion } from "@kineticui/core";

export type ParallaxLayer = {
  content: React.ReactNode;
  /** Movement relative to scroll. 0 = fixed with the page, 1 = moves a full container height. Negative moves the other way. */
  speed: number;
  className?: string;
};

export type ParallaxProps = {
  layers: ParallaxLayer[];
  /** Foreground content rendered above the layers. */
  children?: React.ReactNode;
  height?: number | string;
  /** Element that scrolls (defaults to the window). */
  container?: React.RefObject<HTMLElement | null>;
  className?: string;
};

function Layer({ layer, progress, distance }: { layer: ParallaxLayer; progress: ReturnType<typeof useSpring>; distance: number }) {
  const y = useTransform(progress, [0, 1], [-layer.speed * distance * 0.5, layer.speed * distance * 0.5]);
  return (
    <motion.div style={{ y }} className={cn("pointer-events-none absolute inset-0", layer.className)}>
      {layer.content}
    </motion.div>
  );
}

/** Stacked layers that move at different speeds as the section scrolls past. */
export function Parallax({ layers, children, height = 480, container, className }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const [h, setH] = React.useState(480);
  React.useLayoutEffect(() => {
    if (ref.current) setH(ref.current.offsetHeight);
  }, []);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} style={{ height }}>
      {layers.map((l, i) =>
        reduced ? (
          <div key={i} className={cn("pointer-events-none absolute inset-0", l.className)}>
            {l.content}
          </div>
        ) : (
          <Layer key={i} layer={l} progress={progress} distance={h} />
        ),
      )}
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  );
}
