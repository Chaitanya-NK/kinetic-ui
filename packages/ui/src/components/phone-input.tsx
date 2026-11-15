"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@kineticui/core";
import { CheckIcon, ChevronDownIcon } from "@kineticui/icons";

export type Country = {
  code: string;
  name: string;
  dial: string;
  /** Digit groups used for formatting, e.g. [5, 5]. */
  groups: number[];
};

export const countries: Country[] = [
  { code: "IN", name: "India", dial: "+91", groups: [5, 5] },
  { code: "US", name: "United States", dial: "+1", groups: [3, 3, 4] },
  { code: "GB", name: "United Kingdom", dial: "+44", groups: [4, 6] },
  { code: "CA", name: "Canada", dial: "+1", groups: [3, 3, 4] },
  { code: "AU", name: "Australia", dial: "+61", groups: [3, 3, 3] },
  { code: "DE", name: "Germany", dial: "+49", groups: [3, 4, 4] },
  { code: "FR", name: "France", dial: "+33", groups: [1, 2, 2, 2, 2] },
  { code: "ES", name: "Spain", dial: "+34", groups: [3, 3, 3] },
  { code: "IT", name: "Italy", dial: "+39", groups: [3, 3, 4] },
  { code: "NL", name: "Netherlands", dial: "+31", groups: [1, 4, 4] },
  { code: "SE", name: "Sweden", dial: "+46", groups: [2, 3, 2, 2] },
  { code: "IE", name: "Ireland", dial: "+353", groups: [2, 3, 4] },
  { code: "SG", name: "Singapore", dial: "+65", groups: [4, 4] },
  { code: "AE", name: "United Arab Emirates", dial: "+971", groups: [2, 3, 4] },
  { code: "JP", name: "Japan", dial: "+81", groups: [2, 4, 4] },
  { code: "BR", name: "Brazil", dial: "+55", groups: [2, 5, 4] },
  { code: "MX", name: "Mexico", dial: "+52", groups: [2, 4, 4] },
  { code: "NG", name: "Nigeria", dial: "+234", groups: [3, 3, 4] },
  { code: "ZA", name: "South Africa", dial: "+27", groups: [2, 3, 4] },
  { code: "ID", name: "Indonesia", dial: "+62", groups: [3, 4, 4] },
];

function format(digits: string, groups: number[]) {
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  if (i < digits.length) out.push(digits.slice(i));
  return out.join(" ");
}

export type PhoneValue = { country: string; dial: string; number: string; e164: string };

export type PhoneInputProps = {
  defaultCountry?: string;
  defaultNumber?: string;
  onValueChange?: (value: PhoneValue) => void;
  invalid?: boolean;
  className?: string;
  /** Override the built-in list. */
  countryList?: Country[];
  "aria-label"?: string;
};

/** Country picker + auto-formatted number. Returns an E.164 string too. */
export function PhoneInput({
  defaultCountry = "IN",
  defaultNumber = "",
  onValueChange,
  invalid,
  className,
  countryList = countries,
  ...rest
}: PhoneInputProps) {
  const [country, setCountry] = React.useState(countryList.find((c) => c.code === defaultCountry) ?? countryList[0]!);
  const [digits, setDigits] = React.useState(defaultNumber.replace(/\D/g, ""));
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const max = country.groups.reduce((a, b) => a + b, 0);

  const emit = (c: Country, d: string) =>
    onValueChange?.({ country: c.code, dial: c.dial, number: d, e164: `${c.dial}${d}` });

  const filtered = countryList.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.dial.includes(query) || c.code.toLowerCase() === query.toLowerCase(),
  );

  return (
    <div
      className={cn(
        "flex h-11 w-full overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]",
        invalid && "border-danger",
        className,
      )}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          aria-label={`Country: ${country.name}`}
          className="flex shrink-0 items-center gap-2 border-r border-border bg-surface px-3 text-sm text-foreground outline-none"
        >
          <span className="rounded bg-surface-overlay px-1.5 py-0.5 font-mono text-[10px]">{country.code}</span>
          {country.dial}
          <ChevronDownIcon size={13} className="text-subtle" />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content align="start" sideOffset={6} className="z-50 w-64 overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-overlay data-[state=open]:animate-[kn-pop_0.16s_ease-out]">
            <input
              autoFocus
              aria-label="Search countries"
              placeholder="Search country or code…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full border-b border-border bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-subtle"
            />
            <div role="listbox" className="max-h-60 overflow-y-auto p-1.5">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={c.code === country.code}
                  onClick={() => {
                    setCountry(c);
                    const d = digits.slice(0, c.groups.reduce((a, b) => a + b, 0));
                    setDigits(d);
                    emit(c, d);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-surface-overlay"
                >
                  <span className="w-7 font-mono text-[10px] text-subtle">{c.code}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-subtle">{c.dial}</span>
                  {c.code === country.code ? <CheckIcon size={13} className="text-accent" /> : null}
                </button>
              ))}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label={rest["aria-label"] ?? "Phone number"}
        aria-invalid={invalid || undefined}
        value={format(digits, country.groups)}
        placeholder={format("0".repeat(max), country.groups).replace(/0/g, "0")}
        onChange={(e) => {
          const d = e.target.value.replace(/\D/g, "").slice(0, max);
          setDigits(d);
          emit(country, d);
        }}
        className="min-w-0 flex-1 bg-transparent px-3 font-mono text-[15px] text-foreground outline-none placeholder:text-border-strong"
      />
      {digits.length === max ? <span className="flex items-center pr-3 text-success" aria-label="Complete"><CheckIcon size={15} /></span> : null}
    </div>
  );
}
