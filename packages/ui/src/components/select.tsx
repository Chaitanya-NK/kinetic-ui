"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon } from "@kineticui/icons";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  /** Small text under the label. */
  description?: React.ReactNode;
  /** Icon or colour dot before the label. */
  icon?: React.ReactNode;
  /** Options with the same group are listed under one heading. */
  group?: string;
  disabled?: boolean;
};

export type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  contentClassName?: string;
  name?: string;
  "aria-label"?: string;
  id?: string;
};

/** Accessible custom select with groups, icons and descriptions. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  disabled,
  invalid,
  className,
  contentClassName,
  name,
  id,
  ...rest
}: SelectProps) {
  const groups = React.useMemo(() => {
    const map = new Map<string, SelectOption[]>();
    for (const o of options) map.set(o.group ?? "", [...(map.get(o.group ?? "") ?? []), o]);
    return [...map.entries()];
  }, [options]);

  return (
    <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={rest["aria-label"]}
        aria-invalid={invalid || undefined}
        className={cn(
          "group flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3.5 text-left text-sm text-foreground outline-none transition-[border-color,box-shadow]",
          "focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--kn-ring)] data-[state=open]:border-accent data-[placeholder]:text-subtle disabled:opacity-50",
          invalid && "border-danger",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate [&_svg]:size-4">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon size={15} className="shrink-0 text-subtle transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border-strong bg-surface-raised p-1.5 text-sm shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_var(--ease-kn-out)]",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport>
            {groups.map(([group, items], gi) => (
              <SelectPrimitive.Group key={group || gi}>
                {group ? (
                  <SelectPrimitive.Label className="px-2.5 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-subtle">{group}</SelectPrimitive.Label>
                ) : null}
                {items.map((o) => (
                  <SelectPrimitive.Item
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                    className="relative flex cursor-default select-none items-center gap-2.5 rounded-lg py-2 pl-2.5 pr-8 text-foreground outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-surface-overlay [&_svg]:size-4"
                  >
                    {o.icon}
                    <span className="flex flex-col">
                      <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                      {o.description ? <span className="text-xs text-subtle">{o.description}</span> : null}
                    </span>
                    <SelectPrimitive.ItemIndicator className="absolute right-2.5 text-accent">
                      <CheckIcon size={14} strokeWidth={2.5} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
