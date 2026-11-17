"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "@kineticui/icons";

export type ComboboxOption = { value: string; label: string; group?: string };

type Base = {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Show "Create “…”" when nothing matches. Called with the typed text. */
  onCreate?: (label: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export type ComboboxProps =
  | (Base & { multiple?: false; value?: string; onValueChange?: (value: string) => void; defaultValue?: string })
  | (Base & { multiple: true; value?: string[]; onValueChange?: (value: string[]) => void; defaultValue?: string[] });

/** Searchable select. Set `multiple` for tag-style multi-select. */
export function Combobox(props: ComboboxProps) {
  const { options, placeholder = "Select…", searchPlaceholder = "Search…", emptyText = "No results.", onCreate, disabled, className } = props;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [internal, setInternal] = React.useState<string[]>(
    props.multiple ? props.defaultValue ?? [] : props.defaultValue ? [props.defaultValue] : [],
  );
  const selected: string[] = props.multiple
    ? props.value ?? internal
    : props.value !== undefined
      ? props.value
        ? [props.value]
        : []
      : internal;

  const commit = (next: string[]) => {
    if (props.value === undefined) setInternal(next);
    if (props.multiple) props.onValueChange?.(next);
    else props.onValueChange?.(next[0] ?? "");
  };

  const toggle = (v: string) => {
    if (props.multiple) commit(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
    else {
      commit([v]);
      setOpen(false);
    }
    setQuery("");
  };

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const groups = React.useMemo(() => {
    const m = new Map<string, ComboboxOption[]>();
    for (const o of options) m.set(o.group ?? "", [...(m.get(o.group ?? "") ?? []), o]);
    return [...m.entries()];
  }, [options]);
  const exact = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5 text-left text-sm outline-none transition-[border-color,box-shadow]",
          "focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--kn-ring)] data-[state=open]:border-accent disabled:opacity-50",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 px-1.5">
          {props["aria-label"] ? <span className="sr-only">{`${props["aria-label"]}: `}</span> : null}
          {selected.length === 0 ? <span className="text-subtle">{placeholder}</span> : null}
          {props.multiple
            ? selected.map((v) => (
                <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-surface-overlay px-2 py-1 text-xs text-foreground">
                  {labelOf(v)}
                  <span
                    aria-hidden
                    title={`Remove ${labelOf(v)}`}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(v);
                    }}
                    className="text-subtle hover:text-foreground"
                  >
                    <XIcon size={11} />
                  </span>
                </span>
              ))
            : selected[0]
              ? <span className="truncate text-foreground">{labelOf(selected[0])}</span>
              : null}
        </span>
        <ChevronDownIcon size={15} className="mr-1.5 shrink-0 text-subtle" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-56 overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]"
        >
          <Command loop>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              className="h-11 w-full border-b border-border bg-transparent px-3.5 text-sm text-foreground outline-none placeholder:text-subtle"
            />
            <Command.List className="max-h-64 overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-sm text-subtle">{onCreate ? null : emptyText}</Command.Empty>
              {groups.map(([g, list]) => (
                <Command.Group
                  key={g || "_"}
                  heading={g || undefined}
                  className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-subtle"
                >
                  {list.map((o) => (
                    <Command.Item
                      key={o.value}
                      value={o.label}
                      onSelect={() => toggle(o.value)}
                      className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-surface-overlay"
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[5px] border",
                          selected.includes(o.value) ? "border-accent bg-accent text-accent-foreground" : "border-border-strong",
                          !props.multiple && "rounded-full",
                        )}
                      >
                        {selected.includes(o.value) ? <CheckIcon size={10} strokeWidth={3} /> : null}
                      </span>
                      {o.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
              {onCreate && query.trim() && !exact ? (
                <Command.Item
                  value={`create ${query}`}
                  onSelect={() => {
                    onCreate(query.trim());
                    setQuery("");
                  }}
                  className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted outline-none data-[selected=true]:bg-surface-overlay"
                >
                  <PlusIcon size={14} /> Create “{query.trim()}”
                </Command.Item>
              ) : null}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
