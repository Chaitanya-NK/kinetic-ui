import * as React from "react";
import { cn } from "@kineticui/core";

export type TypingIndicatorProps = {
  /** Names of people typing. Empty array hides the indicator. */
  names?: string[];
  /** bubble: chat-bubble dots only. inline: dots + "Maya is typing". */
  variant?: "bubble" | "inline";
  className?: string;
};

function Dots({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 rounded-full bg-current animate-[kn-typing_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

const label = (names: string[]) =>
  names.length === 1 ? `${names[0]} is typing` : names.length === 2 ? `${names[0]} and ${names[1]} are typing` : `${names[0]} and ${names.length - 1} others are typing`;

/** "Someone is typing" dots, as a chat bubble or an inline label. */
export function TypingIndicator({ names = [], variant = "inline", className }: TypingIndicatorProps) {
  if (variant === "bubble")
    return (
      <span role="status" aria-label={names.length ? label(names) : "Typing"} className={cn("inline-flex h-9 items-center rounded-[18px] rounded-bl-md bg-surface-overlay px-3.5 text-muted", className)}>
        <Dots />
      </span>
    );
  if (!names.length) return null;
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-xs text-subtle", className)}>
      <Dots className="text-accent" />
      {label(names)}
    </span>
  );
}
