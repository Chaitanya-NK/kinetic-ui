"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { EditIcon } from "@kineticui/icons";

export type InlineEditProps = {
  value: string;
  /** Called on Enter or blur with the new value. Return false to reject it. */
  onSave: (value: string) => void | boolean;
  /** Element the text is shown as. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

/** Click to edit text in place. Enter saves, Escape cancels. */
export function InlineEdit({ value, onSave, as: Tag = "span", placeholder = "Untitled", className, inputClassName }: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== value && onSave(next) === false) setDraft(value);
    else if (!next) setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        aria-label="Edit text"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={cn("w-full rounded-lg border border-accent bg-background px-2 py-0.5 text-inherit text-foreground outline-none shadow-[0_0_0_4px_var(--kn-ring)] [font:inherit]", inputClassName)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn("group inline-flex max-w-full items-center gap-2 rounded-lg px-2 py-0.5 text-left outline-none hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-foreground", className)}
      aria-label={`Edit ${value || placeholder}`}
    >
      <Tag className="truncate border-b border-dashed border-border-strong [font:inherit]">{value || <span className="text-subtle">{placeholder}</span>}</Tag>
      <EditIcon size={14} className="shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </button>
  );
}
