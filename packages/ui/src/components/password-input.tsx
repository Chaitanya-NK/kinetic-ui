"use client";

import * as React from "react";
import { cn } from "@kineticui/core";
import { CheckIcon, EyeIcon, EyeOffIcon } from "@kineticui/icons";

export type PasswordRule = { label: string; test: (value: string) => boolean };

export const defaultPasswordRules: PasswordRule[] = [
  { label: "12+ characters", test: (v) => v.length >= 12 },
  { label: "Upper & lowercase", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A symbol (!@#$)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Show the strength meter and rule checklist. */
  showStrength?: boolean;
  rules?: PasswordRule[];
  invalid?: boolean;
};

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const colors = ["bg-danger", "bg-danger", "bg-warning", "bg-accent", "bg-accent"];

/** Password field with show/hide and an optional live strength meter. */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength, rules = defaultPasswordRules, invalid, className, onChange, value, defaultValue, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const [text, setText] = React.useState(String(value ?? defaultValue ?? ""));
    const current = value !== undefined ? String(value) : text;
    const passed = rules.filter((r) => r.test(current)).length;
    const score = current ? Math.max(1, Math.round((passed / rules.length) * 4)) : 0;

    return (
      <div className="flex w-full flex-col gap-2.5">
        <div
          className={cn(
            "flex h-11 items-center gap-2 rounded-xl border border-border bg-background pl-3.5 pr-1.5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]",
            invalid && "border-danger",
          )}
        >
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={invalid || undefined}
            onChange={(e) => {
              setText(e.target.value);
              onChange?.(e);
            }}
            className={cn("h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle", !visible && current && "tracking-[0.2em]", className)}
            {...props}
          />
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            className="flex size-8 items-center justify-center rounded-lg text-subtle hover:text-foreground"
          >
            {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>
        {showStrength ? (
          <>
            <div className="flex items-center gap-3">
              <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-colors duration-300", i <= score ? colors[score] : "bg-border")} />
                ))}
              </div>
              <span aria-live="polite" className="w-16 text-right text-xs text-muted">{current ? labels[score] : ""}</span>
            </div>
            <ul className="flex flex-col gap-1.5 text-xs">
              {rules.map((r) => {
                const ok = r.test(current);
                return (
                  <li key={r.label} className={cn("flex items-center gap-2 transition-colors", ok ? "text-foreground" : "text-subtle")}>
                    <span className={cn("flex size-4 items-center justify-center rounded-full", ok ? "bg-accent text-accent-foreground" : "border border-border-strong")}>
                      {ok ? <CheckIcon size={10} strokeWidth={3} /> : null}
                    </span>
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
