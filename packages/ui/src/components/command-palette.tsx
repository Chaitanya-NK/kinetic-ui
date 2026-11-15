"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { SearchIcon } from "@kineticui/icons";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
};

export type CommandPaletteProps = {
  items: CommandItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Open with ⌘K / Ctrl+K. Default true. */
  hotkey?: boolean;
  emptyText?: string;
};

/** ⌘K palette with fuzzy search, groups and keyboard navigation. */
export function CommandPalette({
  items,
  open: controlled,
  onOpenChange,
  placeholder = "Search or run a command…",
  hotkey = true,
  emptyText = "No results.",
}: CommandPaletteProps) {
  const [internal, setInternal] = React.useState(false);
  const open = controlled ?? internal;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (controlled === undefined) setInternal(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey, open, setOpen]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const it of items) {
      const g = it.group ?? "Actions";
      map.set(g, [...(map.get(g) ?? []), it]);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=open]:animate-[kn-fade_0.15s_ease-out]" />
        <DialogPrimitive.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-[15vh] z-50 w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-[20px] border border-border-strong bg-surface-raised shadow-overlay data-[state=open]:animate-[kn-pop_0.2s_var(--ease-kn-out)] focus:outline-none"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <Command loop className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <SearchIcon size={17} className="text-subtle" />
              <Command.Input
                placeholder={placeholder}
                className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-subtle"
              />
              <kbd className="rounded-md border border-border-strong px-1.5 py-0.5 font-mono text-[10px] text-subtle">ESC</kbd>
            </div>
            <Command.List className="max-h-[360px] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-10 text-center text-sm text-subtle">{emptyText}</Command.Empty>
              {groups.map(([group, list]) => (
                <Command.Group
                  key={group}
                  heading={group}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle"
                >
                  {list.map((it) => (
                    <Command.Item
                      key={it.id}
                      value={`${it.label} ${(it.keywords ?? []).join(" ")}`}
                      onSelect={() => {
                        it.onSelect();
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted outline-none",
                        "data-[selected=true]:bg-accent-soft data-[selected=true]:text-foreground",
                      )}
                    >
                      {it.icon ? (
                        <span className="flex size-7 items-center justify-center rounded-lg bg-surface-overlay text-muted group-data-[selected=true]:bg-accent group-data-[selected=true]:text-accent-foreground [&_svg]:size-4">
                          {it.icon}
                        </span>
                      ) : null}
                      <span className="flex-1">{it.label}</span>
                      {it.shortcut ? <span className="font-mono text-[11px] text-subtle">{it.shortcut}</span> : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="flex justify-between border-t border-border px-4 py-2.5 text-xs text-subtle">
              <span>↑↓ navigate · ↵ select</span>
              <span>⌘K to toggle</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
