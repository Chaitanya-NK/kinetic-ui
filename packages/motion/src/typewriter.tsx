"use client";

import * as React from "react";
import { cn, useReducedMotion } from "@kineticui/core";

export type TypewriterProps = {
  /** One or more lines to type, delete and cycle through. */
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pause?: number;
  loop?: boolean;
  className?: string;
};

/** Types each word, pauses, deletes it, and moves to the next. */
export function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  pause = 1400,
  loop = true,
  className,
}: TypewriterProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (reduced) return;
    const word = words[index % words.length] ?? "";
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && text === word) {
      if (!loop && index === words.length - 1) return;
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => i + 1);
    } else {
      t = setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteSpeed : typeSpeed,
      );
    }
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause, loop, reduced]);

  const shown = reduced ? words[0] : text;

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span aria-live="polite">{shown}</span>
      <span
        aria-hidden
        data-kn-motion
        className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-kn-caret border-r-2 border-accent"
      />
    </span>
  );
}
