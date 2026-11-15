import * as React from "react";
import { cn } from "@kineticui/core";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Icon or text shown before the value. */
  leading?: React.ReactNode;
  /** Icon, text or button shown after the value. */
  trailing?: React.ReactNode;
  /** Marks the field invalid and styles it red. */
  invalid?: boolean;
  /** Class for the outer wrapper (border, size). */
  wrapperClassName?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, leading, trailing, invalid, disabled, ...props }, ref) => (
    <div
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "flex h-11 w-full items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 text-sm transition-[border-color,box-shadow] duration-150",
        "focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--kn-ring)]",
        "data-[invalid]:border-danger data-[invalid]:bg-danger-soft/40 data-[invalid]:focus-within:shadow-[0_0_0_4px_rgb(255_138_138/0.2)]",
        "data-[disabled]:cursor-not-allowed data-[disabled]:border-dashed data-[disabled]:opacity-60",
        wrapperClassName,
      )}
    >
      {leading ? <span className="flex shrink-0 text-subtle [&_svg]:size-4">{leading}</span> : null}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
      {trailing ? <span className="flex shrink-0 items-center text-subtle [&_svg]:size-4">{trailing}</span> : null}
    </div>
  ),
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  /** Show "used / max" under the field when maxLength is set. */
  showCount?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, showCount, maxLength, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(
      String(props.value ?? props.defaultValue ?? "").length,
    );
    return (
      <div className="flex w-full flex-col gap-1.5">
        <textarea
          ref={ref}
          maxLength={maxLength}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setCount(e.target.value.length);
            onChange?.(e);
          }}
          className={cn(
            "min-h-24 w-full resize-y rounded-xl border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-accent focus:shadow-[0_0_0_4px_var(--kn-ring)]",
            invalid && "border-danger",
            className,
          )}
          {...props}
        />
        {showCount && maxLength ? (
          <span className="self-end font-mono text-xs text-subtle">
            {count} / {maxLength}
          </span>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
}

export type FieldProps = {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

/** Label + control + hint/error, spaced consistently. */
export function Field({ label, hint, error, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-subtle">{hint}</span>
      ) : null}
    </div>
  );
}
