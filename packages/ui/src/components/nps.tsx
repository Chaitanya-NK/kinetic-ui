"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { XIcon } from "@kineticui/icons";

export type NpsSurveyProps = {
  question?: string;
  /** Ask a follow-up based on the score. */
  followUp?: (score: number) => string;
  onSubmit: (result: { score: number; comment: string }) => void;
  onDismiss?: () => void;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
};

const tone = (n: number) => (n <= 6 ? "danger" : n <= 8 ? "warning" : "success");
const fill = { danger: "bg-danger text-background", warning: "bg-warning text-background", success: "bg-success text-background" };

/** Net Promoter Score survey: 0–10 scale, follow-up question, thank-you state. */
export function NpsSurvey({
  question = "How likely are you to recommend us to a friend?",
  followUp = (s) => (s >= 9 ? "What do you love most?" : s >= 7 ? "What would make it a 10?" : "What's the biggest thing we should fix?"),
  onSubmit,
  onDismiss,
  lowLabel = "Not likely",
  highLabel = "Very likely",
  className,
}: NpsSurveyProps) {
  const [score, setScore] = React.useState<number | null>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState("");
  const [done, setDone] = React.useState(false);
  const shown = hover ?? score;

  return (
    <div className={cn("relative w-full max-w-lg rounded-2xl border border-border-strong bg-surface-raised p-5 shadow-overlay", className)}>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-subtle hover:bg-surface-overlay hover:text-foreground">
          <XIcon size={15} />
        </button>
      ) : null}
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} />
              </svg>
            </span>
            <span className="font-semibold">Thanks for the feedback!</span>
            <span className="text-sm text-muted">It goes straight to the product team.</span>
          </motion.div>
        ) : (
          <motion.div key="ask" exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <span className="pr-8 font-medium">{question}</span>
            <div role="radiogroup" aria-label={question} className="flex gap-1" onPointerLeave={() => setHover(null)}>
              {Array.from({ length: 11 }, (_, n) => {
                const lit = shown !== null && n <= shown;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={score === n}
                    onPointerEnter={() => setHover(n)}
                    onClick={() => setScore(n)}
                    className={cn(
                      "flex h-10 flex-1 items-center justify-center rounded-lg font-mono text-sm font-semibold transition-all duration-150",
                      lit ? fill[tone(shown!)] : "bg-surface-overlay text-muted hover:text-foreground",
                      score === n && "scale-110 shadow-lg",
                    )}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-subtle">
              <span>{lowLabel}</span>
              <span>{highLabel}</span>
            </div>
            <AnimatePresence>
              {score !== null ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-col gap-3 overflow-hidden">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted">{followUp(score)}</span>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Optional"
                      className="resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none placeholder:text-subtle focus:border-accent"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onSubmit({ score, comment });
                      setDone(true);
                    }}
                    className="h-10 rounded-xl bg-accent text-sm font-semibold text-accent-foreground"
                  >
                    Send feedback
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
