"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@kineticui/icons";

export type MessageBranchProps = {
  /** One node per alternative (e.g. each regenerated answer or edited prompt). */
  branches: React.ReactNode[];
  /** Controlled index. Defaults to the latest branch. */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Where the 2 / 3 switcher sits. */
  controls?: "top" | "bottom";
  className?: string;
};

/** Flip between alternative versions of a message, ChatGPT-style, with a directional slide. */
export function MessageBranch({ branches, index: controlled, onIndexChange, controls = "bottom", className }: MessageBranchProps) {
  const [inner, setInner] = React.useState(branches.length - 1);
  const [dir, setDir] = React.useState(1);
  const index = Math.min(controlled ?? inner, branches.length - 1);
  const prevLen = React.useRef(branches.length);
  React.useEffect(() => {
    // Jump to a newly added branch.
    if (branches.length > prevLen.current && controlled === undefined) {
      setDir(1);
      setInner(branches.length - 1);
    }
    prevLen.current = branches.length;
  }, [branches.length, controlled]);
  const go = (n: number) => {
    if (n < 0 || n >= branches.length) return;
    setDir(n > index ? 1 : -1);
    if (controlled === undefined) setInner(n);
    onIndexChange?.(n);
  };
  const bar =
    branches.length > 1 ? (
      <MessageBranchSelector index={index} count={branches.length} onPrev={() => go(index - 1)} onNext={() => go(index + 1)} />
    ) : null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {controls === "top" ? bar : null}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={index}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 40, opacity: 0, filter: "blur(4px)" }),
              center: { x: 0, opacity: 1, filter: "blur(0px)" },
              exit: (d: number) => ({ x: d * -40, opacity: 0, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            {branches[index]}
          </motion.div>
        </AnimatePresence>
      </div>
      {controls === "bottom" ? bar : null}
    </div>
  );
}

export function MessageBranchSelector({ index, count, onPrev, onNext, className }: { index: number; count: number; onPrev: () => void; onNext: () => void; className?: string }) {
  return (
    <div role="group" aria-label="Response versions" className={cn("flex items-center gap-0.5 self-start text-xs text-subtle", className)}>
      <button type="button" onClick={onPrev} disabled={index === 0} aria-label="Previous version" className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-foreground disabled:opacity-30">
        <ChevronLeftIcon size={14} />
      </button>
      <span className="min-w-10 text-center font-mono tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={index} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="inline-block text-foreground">
            {index + 1}
          </motion.span>
        </AnimatePresence>{" "}
        / {count}
      </span>
      <button type="button" onClick={onNext} disabled={index === count - 1} aria-label="Next version" className="flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-surface-overlay hover:text-foreground disabled:opacity-30">
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
}
