"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { SearchIcon, XIcon } from "@kineticui/icons";

export type AutocompleteItem = {
  value: string;
  label: string;
  /** Second line, e.g. a city or category. */
  description?: string;
  group?: string;
};

export type AutocompleteProps = {
  /** Static items filtered by the typed text, or… */
  items?: AutocompleteItem[];
  /** …an async loader called (debounced) as the user types. */
  onSearch?: (query: string) => Promise<AutocompleteItem[]>;
  onSelect: (item: AutocompleteItem) => void;
  placeholder?: string;
  /** Shown when the field is empty and focused, e.g. recent searches. */
  emptyItems?: AutocompleteItem[];
  leading?: React.ReactNode;
  minChars?: number;
  debounce?: number;
  className?: string;
  "aria-label"?: string;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-accent">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/** Text field with a suggestion list: keyboard navigation, highlighted matches, sync or async data. */
export function Autocomplete({
  items,
  onSearch,
  onSelect,
  placeholder = "Search…",
  emptyItems,
  leading = <SearchIcon size={16} />,
  minChars = 1,
  debounce = 180,
  className,
  ...rest
}: AutocompleteProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [results, setResults] = React.useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const id = React.useId();

  React.useEffect(() => {
    if (query.length < minChars) {
      setResults(emptyItems ?? []);
      return;
    }
    if (onSearch) {
      setLoading(true);
      let cancelled = false;
      const t = setTimeout(() => {
        onSearch(query)
          .then((r) => !cancelled && setResults(r))
          .finally(() => !cancelled && setLoading(false));
      }, debounce);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    const q = query.toLowerCase();
    setResults((items ?? []).filter((it) => it.label.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q)));
  }, [query, items, onSearch, emptyItems, minChars, debounce]);

  React.useEffect(() => setActive(0), [results]);

  const pick = (it: AutocompleteItem) => {
    onSelect(it);
    setQuery(it.label);
    setOpen(false);
  };

  const showList = open && (results.length > 0 || loading || query.length >= minChars);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex h-11 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 text-subtle transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]">
        {leading}
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-activedescendant={showList && results[active] ? `${id}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label={rest["aria-label"] ?? placeholder}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(results.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && showList && results[active]) {
              e.preventDefault();
              pick(results[active]!);
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle"
        />
        {query ? (
          <button type="button" aria-label="Clear" onClick={() => setQuery("")} className="hover:text-foreground">
            <XIcon size={14} />
          </button>
        ) : null}
      </div>
      {showList ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border-strong bg-surface-raised p-1.5 text-sm shadow-overlay animate-[kn-pop_0.14s_ease-out]"
        >
          {loading ? <li className="px-3 py-3 text-subtle">Searching…</li> : null}
          {!loading && results.length === 0 ? <li className="px-3 py-3 text-subtle">No matches for “{query}”</li> : null}
          {!loading &&
            results.map((it, i) => (
              <li
                key={it.value}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                onPointerDown={(e) => {
                  e.preventDefault();
                  pick(it);
                }}
                onPointerEnter={() => setActive(i)}
                className={cn("flex cursor-default flex-col gap-0.5 rounded-lg px-3 py-2", i === active && "bg-surface-overlay")}
              >
                <span className="text-foreground"><Highlight text={it.label} query={query} /></span>
                {it.description ? <span className="text-xs text-subtle">{it.description}</span> : null}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
