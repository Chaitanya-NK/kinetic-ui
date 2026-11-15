"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { SearchIcon, XIcon } from "@kineticui/icons";

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  value?: string;
  onValueChange?: (value: string) => void;
  /** Press this key anywhere on the page to focus the field. Default "/". Set null to disable. */
  shortcut?: string | null;
  /** Rounded pill style. */
  pill?: boolean;
  /** Text on the right, e.g. "12 results". */
  meta?: React.ReactNode;
};

/** Search field with clear button, focus shortcut and an optional result count. */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onValueChange, shortcut = "/", pill, meta, className, placeholder = "Search…", ...props }, ref) => {
    const [internal, setInternal] = React.useState("");
    const current = value ?? internal;
    const inner = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inner.current!);

    React.useEffect(() => {
      if (!shortcut) return;
      const onKey = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement;
        if (e.key === shortcut && !/input|textarea|select/i.test(t.tagName) && !t.isContentEditable) {
          e.preventDefault();
          inner.current?.focus();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [shortcut]);

    const set = (v: string) => {
      if (value === undefined) setInternal(v);
      onValueChange?.(v);
    };

    return (
      <label
        className={cn(
          "flex h-11 w-full items-center gap-2.5 border border-border bg-background px-3.5 text-subtle transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]",
          pill ? "rounded-full border-transparent bg-surface-overlay" : "rounded-xl",
          className,
        )}
      >
        <SearchIcon size={16} className="shrink-0" />
        <input
          ref={inner}
          type="search"
          value={current}
          placeholder={placeholder}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && current) {
              e.preventDefault();
              set("");
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {meta ? <span className="shrink-0 font-mono text-[11px]">{meta}</span> : null}
        {current ? (
          <button type="button" aria-label="Clear search" onClick={() => set("")} className="flex size-6 items-center justify-center rounded-md bg-border text-muted hover:text-foreground">
            <XIcon size={12} />
          </button>
        ) : shortcut ? (
          <kbd className="rounded-md border border-border-strong px-1.5 py-0.5 font-mono text-[11px]">{shortcut}</kbd>
        ) : null}
      </label>
    );
  },
);
SearchInput.displayName = "SearchInput";
