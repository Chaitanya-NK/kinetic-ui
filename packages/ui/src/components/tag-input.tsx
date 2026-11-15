"use client";

import * as React from "react";
import { cn, useControllableState } from "@kineticui/core";
import { XIcon } from "@kineticui/icons";

export type TagInputProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  placeholder?: string;
  /** Maximum number of tags. */
  max?: number;
  /** Clickable suggestions under the field. */
  suggestions?: string[];
  /** Return false to reject a tag. */
  validate?: (tag: string) => boolean;
  className?: string;
  "aria-label"?: string;
};

/** Type and press Enter or comma to add. Backspace once highlights, twice removes. */
export function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Add tag…",
  max = Infinity,
  suggestions,
  validate,
  className,
  ...rest
}: TagInputProps) {
  const [tags, setTags] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [text, setText] = React.useState("");
  const [armed, setArmed] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const t = raw.trim().replace(/,$/, "");
    if (!t || tags.includes(t) || tags.length >= max) return;
    if (validate && !validate(t)) return;
    setTags([...tags, t]);
    setText("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-11 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-1.5 text-sm transition-[border-color,box-shadow]",
          "focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]",
          className,
        )}
      >
        {tags.map((t, i) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors",
              armed && i === tags.length - 1 ? "bg-danger-soft text-danger ring-1 ring-danger" : "bg-accent-soft text-accent-soft-foreground",
            )}
          >
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))} className="opacity-70 hover:opacity-100">
              <XIcon size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          aria-label={rest["aria-label"] ?? "Add tag"}
          value={text}
          placeholder={tags.length >= max ? "" : placeholder}
          disabled={tags.length >= max}
          onChange={(e) => {
            setArmed(false);
            if (e.target.value.endsWith(",")) add(e.target.value);
            else setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && tags.length) {
              if (armed) {
                setTags(tags.slice(0, -1));
                setArmed(false);
              } else setArmed(true);
            }
          }}
          onBlur={() => {
            setArmed(false);
            if (text) add(text);
          }}
          className="min-w-24 flex-1 bg-transparent px-1.5 py-1 text-foreground outline-none placeholder:text-subtle"
        />
      </div>
      {suggestions?.length ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-subtle">Suggested:</span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="text-muted underline underline-offset-2 hover:text-foreground">
                {s}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
