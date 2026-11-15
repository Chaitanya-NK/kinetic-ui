"use client";

import * as React from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { cn } from "@kineticui/core";

export type BackToTopProps = {
  /** Show after scrolling this many px. */
  threshold?: number;
  /** Ring that fills as the page is read. */
  showProgress?: boolean;
  className?: string;
};

/** Floating button that scrolls to the top, with a reading-progress ring. */
export function BackToTop({ threshold = 600, showProgress = true, className }: BackToTopProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    setVisible(scrollY.get() > threshold);
    return scrollY.on("change", (y) => setVisible(y > threshold));
  }, [scrollY, threshold]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex size-[52px] items-center justify-center rounded-full bg-surface-overlay text-foreground shadow-overlay outline-none focus-visible:ring-2 focus-visible:ring-foreground",
            className,
          )}
        >
          {showProgress ? (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden>
              <circle cx="26" cy="26" r="24" fill="none" stroke="var(--kn-border)" strokeWidth="3" />
              <motion.circle cx="26" cy="26" r="24" fill="none" stroke="var(--kn-accent)" strokeWidth="3" strokeLinecap="round" style={{ pathLength: scrollYProgress }} />
            </svg>
          ) : null}
          <svg viewBox="0 0 24 24" className="relative size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
