"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";
import { MapPinIcon, NavigationIcon, XIcon } from "@kineticui/icons";

export type Address = { id: string; line1: string; city: string; region?: string; postcode?: string; country: string; lat?: number; lng?: number };

export type AddressAutocompleteProps = {
  /** Search your geocoder (Google Places, Mapbox, OpenStreetMap…). Gets the query, returns matches. */
  onSearch?: (query: string) => Promise<Address[]>;
  onSelect: (address: Address) => void;
  /** Offer "Use my current location" (calls onLocate with coordinates). */
  onLocate?: (coords: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
};

const SAMPLE: Address[] = [
  { id: "1", line1: "12 Lavelle Road", city: "Bengaluru", region: "Karnataka", postcode: "560001", country: "India" },
  { id: "2", line1: "Hitech City Main Rd", city: "Hyderabad", region: "Telangana", postcode: "500081", country: "India" },
  { id: "3", line1: "221B Baker Street", city: "London", postcode: "NW1 6XE", country: "United Kingdom" },
  { id: "4", line1: "1 Infinite Loop", city: "Cupertino", region: "CA", postcode: "95014", country: "United States" },
  { id: "5", line1: "Rua Augusta 24", city: "Lisbon", postcode: "1100-053", country: "Portugal" },
  { id: "6", line1: "Marine Drive", city: "Mumbai", region: "Maharashtra", postcode: "400020", country: "India" },
  { id: "7", line1: "Alexanderplatz 1", city: "Berlin", postcode: "10178", country: "Germany" },
];
const demoSearch = (q: string) => new Promise<Address[]>((r) => setTimeout(() => r(SAMPLE.filter((a) => `${a.line1} ${a.city} ${a.country}`.toLowerCase().includes(q.toLowerCase()))), 250));

function Highlight({ text, q }: { text: string; q: string }) {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (!q || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-accent-soft px-0.5 text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** Address search with debounced lookups, keyboard navigation, highlighted matches and "use my location". */
export function AddressAutocomplete({ onSearch = demoSearch, onSelect, onLocate, placeholder = "Start typing an address…", className }: AddressAutocompleteProps) {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Address[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [chosen, setChosen] = React.useState<Address | null>(null);
  const id = React.useId();

  React.useEffect(() => {
    if (q.trim().length < 2 || chosen) return setResults([]);
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await onSearch(q.trim());
      if (alive) {
        setResults(r);
        setActive(0);
        setLoading(false);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, onSearch, chosen]);

  const choose = (a: Address) => {
    setChosen(a);
    setQ(`${a.line1}, ${a.city}`);
    setOpen(false);
    onSelect(a);
  };

  return (
    <div className={cn("relative flex flex-col gap-3", className)}>
      <div className="flex h-11 items-center gap-2 rounded-[10px] border border-border bg-surface px-3 focus-within:border-accent">
        <MapPinIcon size={16} className="shrink-0 text-subtle" />
        <input
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          value={q}
          placeholder={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setChosen(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(results.length - 1, a + 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(0, a - 1)));
            if (e.key === "Enter" && results[active]) (e.preventDefault(), choose(results[active]!));
            if (e.key === "Escape") setOpen(false);
          }}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
        />
        {loading ? <span className="size-4 rounded-full border-2 border-accent border-t-transparent animate-kn-spin" /> : null}
        {q && !loading ? (
          <button type="button" aria-label="Clear" onClick={() => { setQ(""); setChosen(null); }} className="text-subtle hover:text-foreground">
            <XIcon size={14} />
          </button>
        ) : null}
      </div>
      <AnimatePresence>
        {open && !chosen && (results.length > 0 || (onLocate && !q)) ? (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-12 z-30 overflow-hidden rounded-xl border border-border-strong bg-surface-raised p-1 shadow-overlay"
          >
            {onLocate && !q ? (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => navigator.geolocation?.getCurrentPosition((p) => onLocate({ lat: p.coords.latitude, lng: p.coords.longitude }))}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-accent hover:bg-surface-overlay"
                >
                  <NavigationIcon size={15} /> Use my current location
                </button>
              </li>
            ) : null}
            {results.map((a, i) => (
              <li key={a.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(a)}
                  className={cn("flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left", i === active && "bg-surface-overlay")}
                >
                  <MapPinIcon size={15} className="mt-0.5 shrink-0 text-subtle" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium"><Highlight text={a.line1} q={q} /></span>
                    <span className="text-xs text-subtle"><Highlight text={[a.city, a.region, a.postcode, a.country].filter(Boolean).join(", ")} q={q} /></span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
      {chosen ? (
        <motion.dl initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
          {[
            ["Street", chosen.line1],
            ["City", chosen.city],
            ["State / region", chosen.region ?? "—"],
            ["Postcode", chosen.postcode ?? "—"],
            ["Country", chosen.country],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-xs text-subtle">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </motion.dl>
      ) : null}
    </div>
  );
}
