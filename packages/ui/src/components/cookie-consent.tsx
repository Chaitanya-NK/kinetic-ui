"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@kineticui/core";

export type ConsentCategory = { id: string; label: string; description?: string; required?: boolean; defaultOn?: boolean };
export type ConsentState = Record<string, boolean>;

export type CookieConsentProps = {
  categories?: ConsentCategory[];
  /** localStorage key. The banner hides once a choice is stored. */
  storageKey?: string;
  policyHref?: string;
  onChange?: (consent: ConsentState) => void;
  /** Fixed in the bottom-left corner (default) or inline. */
  position?: "fixed" | "inline";
  /** Force the banner open, e.g. from a "Cookie settings" link. */
  open?: boolean;
  className?: string;
};

const defaults: ConsentCategory[] = [
  { id: "necessary", label: "Necessary", description: "Sign-in, security and preferences.", required: true },
  { id: "analytics", label: "Analytics", description: "Helps us understand how the site is used.", defaultOn: true },
  { id: "marketing", label: "Marketing", description: "Personalised ads and offers." },
];

function MiniSwitch({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60", checked ? "bg-accent" : "bg-border-strong")}
    >
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-background transition-[left] duration-200", checked ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

/** Cookie banner with Accept / Reject / per-category preferences, remembered in localStorage. */
export function CookieConsent({
  categories = defaults,
  storageKey = "kn-consent",
  policyHref,
  onChange,
  position = "fixed",
  open: forced,
  className,
}: CookieConsentProps) {
  const [visible, setVisible] = React.useState(false);
  const [custom, setCustom] = React.useState(false);
  const [state, setState] = React.useState<ConsentState>(() =>
    Object.fromEntries(categories.map((c) => [c.id, !!(c.required || c.defaultOn)])),
  );

  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(storageKey);
    } catch {
      /* storage unavailable */
    }
    if (stored) {
      try {
        setState(JSON.parse(stored) as ConsentState);
      } catch {
        /* ignore bad value */
      }
    }
    setVisible(forced ?? !stored);
  }, [storageKey, forced]);

  const save = (next: ConsentState) => {
    setState(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    onChange?.(next);
    setVisible(false);
    setCustom(false);
  };
  const all = (on: boolean) => Object.fromEntries(categories.map((c) => [c.id, c.required ? true : on]));

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-label="Cookie preferences"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "w-[min(400px,calc(100vw-2rem))] rounded-2xl border border-border-strong bg-surface-raised p-5 text-sm shadow-overlay",
            position === "fixed" && "fixed bottom-4 left-4 z-50",
            className,
          )}
        >
          <h2 className="text-[15px] font-semibold">We use cookies</h2>
          <p className="mt-1.5 leading-relaxed text-muted">
            We use cookies to keep you signed in, understand usage, and improve the product.{" "}
            {policyHref ? (
              <a href={policyHref} className="text-foreground underline underline-offset-4">
                Cookie policy
              </a>
            ) : null}
          </p>
          <AnimatePresence initial={false}>
            {custom ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          {c.label}
                          {c.required ? <span className="ml-2 font-mono text-[10px] uppercase text-subtle">Always on</span> : null}
                        </div>
                        {c.description ? <div className="text-xs text-subtle">{c.description}</div> : null}
                      </div>
                      <MiniSwitch label={c.label} checked={!!state[c.id]} disabled={c.required} onChange={(v) => setState((s) => ({ ...s, [c.id]: v }))} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-2">
            {custom ? (
              <button type="button" onClick={() => save(state)} className="h-9 flex-1 rounded-[10px] bg-accent px-3 font-semibold text-accent-foreground">
                Save preferences
              </button>
            ) : (
              <>
                <button type="button" onClick={() => save(all(true))} className="h-9 flex-1 rounded-[10px] bg-accent px-3 font-semibold text-accent-foreground">
                  Accept all
                </button>
                <button type="button" onClick={() => save(all(false))} className="h-9 flex-1 rounded-[10px] border border-border-strong px-3 font-medium hover:bg-surface-overlay">
                  Reject
                </button>
                <button type="button" onClick={() => setCustom(true)} className="h-9 w-full rounded-[10px] px-3 text-muted hover:text-foreground">
                  Customize
                </button>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
