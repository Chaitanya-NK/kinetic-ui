"use client";

import * as React from "react";
import { cn, useReducedMotion } from "@kineticui/core";

export type TextScrambleProps = {
  /** Final text. Changing it scrambles into the new value. */
  text: string;
  /** Total time in ms for the reveal. */
  duration?: number;
  /** Characters used while scrambling. */
  charset?: string;
  /** Re-run the effect on hover. */
  scrambleOnHover?: boolean;
  /** Start when the element scrolls into view instead of on mount. */
  startOnView?: boolean;
  as?: React.ElementType;
  className?: string;
};

const DEFAULT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}=+*^?#";

/** Decoder-style text reveal: random glyphs settle left-to-right into the real text. */
export function TextScramble({ text, duration = 900, charset = DEFAULT, scrambleOnHover, startOnView, as: Tag = "span", className }: TextScrambleProps) {
  const reduced = useReducedMotion();
  const [out, setOut] = React.useState(text);
  const ref = React.useRef<HTMLElement>(null);
  const raf = React.useRef(0);

  const run = React.useCallback(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]!;
        s += i < settled || ch === " " ? ch : charset[Math.floor(Math.random() * charset.length)];
      }
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, duration, charset, reduced]);

  React.useEffect(() => {
    if (!startOnView) {
      run();
      return () => cancelAnimationFrame(raf.current);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e!.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [run, startOnView]);

  return (
    <Tag ref={ref} onPointerEnter={scrambleOnHover ? run : undefined} className={cn("inline-block font-mono tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{out}</span>
    </Tag>
  );
}
