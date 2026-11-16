import * as React from "react";
import { cn } from "@kineticui/core";

export type AuroraBackgroundProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Three or more colours for the light bands. Defaults to the accent with cool companions. */
  colors?: string[];
  /** Seconds per cycle. */
  speed?: number;
  /** 0 to 1. */
  intensity?: number;
  /** Fade the aurora out towards the bottom. */
  fade?: boolean;
};

/** Slow-moving northern-lights glow. Place it absolutely behind a hero. CSS only. */
export function AuroraBackground({ colors = ["var(--kn-accent)", "#38bdf8", "#a78bfa", "#34d399"], speed = 18, intensity = 0.55, fade = true, className, style, ...props }: AuroraBackgroundProps) {
  const stops = colors.map((c, i) => `${c} ${Math.round((i / colors.length) * 100)}%`).join(", ");
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={style} {...props}>
      <div
        data-kn-motion
        className="absolute -inset-[20%] animate-[kn-aurora_var(--kn-aurora-speed)_ease-in-out_infinite_alternate] blur-[60px] will-change-transform"
        style={
          {
            "--kn-aurora-speed": `${speed}s`,
            opacity: intensity,
            backgroundImage: `repeating-linear-gradient(100deg, ${stops}, ${colors[0]} 100%)`,
            backgroundSize: "300% 200%",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
          } as React.CSSProperties
        }
      />
      <div
        data-kn-motion
        className="absolute -inset-[10%] animate-[kn-aurora_var(--kn-aurora-speed)_ease-in-out_infinite_alternate-reverse] mix-blend-screen blur-[80px]"
        style={
          {
            "--kn-aurora-speed": `${speed * 1.4}s`,
            opacity: intensity * 0.6,
            backgroundImage: `repeating-linear-gradient(75deg, ${[...colors].reverse().map((c, i) => `${c} ${Math.round((i / colors.length) * 100)}%`).join(", ")})`,
            backgroundSize: "250% 200%",
            maskImage: "radial-gradient(ellipse 70% 50% at 60% 10%, #000 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 50% at 60% 10%, #000 20%, transparent 70%)",
          } as React.CSSProperties
        }
      />
      {fade ? <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" /> : null}
    </div>
  );
}
