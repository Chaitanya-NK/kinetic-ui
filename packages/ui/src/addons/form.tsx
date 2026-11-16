"use client";

import * as React from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import {
  FormProvider,
  useController,
  useFormContext,
  useFormState,
  type ControllerRenderProps,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "@kineticui/core";
import { AlertCircleIcon, CheckIcon } from "@kineticui/icons";

/* -------------------------------------------------------------------------------------------------
 * Form: react-hook-form wired to Kinetic inputs. Bring your own schema (zod, valibot, yup…) via a resolver.
 * -----------------------------------------------------------------------------------------------*/

export type FormProps<T extends FieldValues> = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onInvalid"> & {
  /** The object returned by useForm(). */
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
  /** Move focus to the first invalid field when submit fails. */
  focusFirstError?: boolean;
};

/** Provides the form to every FormField and handles submit, invalid submit and focus management. */
export function Form<T extends FieldValues>({ form, onSubmit, onInvalid, focusFirstError = true, className, children, ...props }: FormProps<T>) {
  const ref = React.useRef<HTMLFormElement>(null);
  return (
    <FormProvider {...form}>
      <form
        ref={ref}
        noValidate
        onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
          if (focusFirstError) {
            requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
          }
          onInvalid?.(errors, e);
        })}
        className={cn("flex flex-col gap-5", className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

export type FormFieldRenderProps<T extends FieldValues = FieldValues, N extends FieldPath<T> = FieldPath<T>> = ControllerRenderProps<T, N> & {
  id: string;
  invalid: boolean;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
  "aria-required": boolean | undefined;
};

export type FormFieldProps<T extends FieldValues, N extends FieldPath<T>> = {
  name: N;
  label?: React.ReactNode;
  /** Help text under the field, replaced by the error message when invalid. */
  description?: React.ReactNode;
  /** Shows a marker on the label and sets aria-required. Validation itself lives in your schema. */
  required?: boolean;
  /** Show a check next to the label once the field is valid and has been edited. */
  showValid?: boolean;
  /** Put the label and control on one row (for switches and checkboxes). */
  inline?: boolean;
  className?: string;
  /** Render the control. Spread the props onto Kinetic inputs, or map value/onChange for controlled ones. */
  children: (field: FormFieldRenderProps<T, N>) => React.ReactNode;
};

/** A labelled, validated field: animated error message, shake on failed submit, valid check and full ARIA wiring. */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  name,
  label,
  description,
  required,
  showValid = false,
  inline = false,
  className,
  children,
}: FormFieldProps<T, N>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name });
  const { submitCount } = useFormState({ control });
  const id = React.useId();
  const helpId = `${id}-help`;
  const controls = useAnimationControls();
  const invalid = !!fieldState.error;
  const message = fieldState.error?.message;

  // Shake once per failed submit attempt.
  React.useEffect(() => {
    if (submitCount && invalid) void controls.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.38 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  const valid = showValid && !invalid && fieldState.isDirty && fieldState.isTouched;
  const control_ = children({
    ...field,
    id,
    invalid,
    "aria-invalid": invalid || undefined,
    "aria-describedby": description || invalid ? helpId : undefined,
    "aria-required": required || undefined,
  });
  const labelEl = label ? (
    <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-foreground">
      {label}
      {required ? <span aria-hidden className="text-accent">*</span> : null}
      <AnimatePresence>
        {valid ? (
          <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="flex size-4 items-center justify-center rounded-full bg-success text-background">
            <CheckIcon size={10} strokeWidth={3.5} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  ) : null;

  return (
    <motion.div animate={controls} data-invalid={invalid || undefined} className={cn("flex flex-col gap-1.5", className)}>
      {inline ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {labelEl}
            {description && !invalid ? <span id={helpId} className="text-xs text-subtle">{description}</span> : null}
          </div>
          {control_}
        </div>
      ) : (
        <>
          {labelEl}
          {control_}
        </>
      )}
      <AnimatePresence mode="popLayout" initial={false}>
        {invalid ? (
          <motion.span
            key={`e-${message}`}
            id={helpId}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-1.5 text-xs text-danger"
          >
            <AlertCircleIcon size={13} className="shrink-0" />
            {message || "This field is invalid"}
          </motion.span>
        ) : description && !inline ? (
          <motion.span key="d" id={helpId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-subtle">
            {description}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export type FormSubmitProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** Label while the onSubmit promise is pending. */
  pendingLabel?: React.ReactNode;
  /** Label shown briefly after a successful submit. */
  successLabel?: React.ReactNode;
};

/** Submit button that tracks the form: spinner while submitting, a check on success, a nudge when there are errors. */
export function FormSubmit({ children, pendingLabel = "Saving…", successLabel = "Saved", className, disabled, ...props }: FormSubmitProps) {
  const { control } = useFormContext();
  const { isSubmitting, isSubmitSuccessful, submitCount, errors } = useFormState({ control });
  const [flash, setFlash] = React.useState(false);
  const hasErrors = Object.keys(errors).length > 0;

  React.useEffect(() => {
    if (!isSubmitSuccessful) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1800);
    return () => clearTimeout(t);
  }, [isSubmitSuccessful, submitCount]);

  const state = isSubmitting ? "pending" : flash ? "success" : "idle";
  return (
    <motion.button
      type="submit"
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting || undefined}
      whileTap={{ scale: 0.97 }}
      animate={hasErrors && submitCount ? { x: [0, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        state === "success" ? "bg-success text-background" : "bg-accent text-accent-foreground hover:brightness-105 disabled:opacity-70",
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={state} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="flex items-center gap-2">
          {state === "pending" ? (
            <>
              <svg viewBox="0 0 24 24" className="size-4 animate-spin" aria-hidden>
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              {pendingLabel}
            </>
          ) : state === "success" ? (
            <>
              <CheckIcon size={16} strokeWidth={3} />
              {successLabel}
            </>
          ) : (
            children
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Lists every current error with links that focus the field. Useful at the top of long forms. */
export function FormErrorSummary({ title = "Please fix these fields", className }: { title?: React.ReactNode; className?: string }) {
  const { control, setFocus } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const list = flatten(errors);
  return (
    <AnimatePresence>
      {submitCount > 0 && list.length ? (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={cn("overflow-hidden", className)}
        >
          <div className="flex flex-col gap-2 rounded-xl border border-danger/40 bg-danger-soft/50 p-4 text-sm">
            <span className="flex items-center gap-2 font-medium text-danger"><AlertCircleIcon size={15} /> {title}</span>
            <ul className="flex flex-col gap-1 pl-6">
              {list.map(([path, msg]) => (
                <li key={path}>
                  <button type="button" onClick={() => setFocus(path)} className="text-left text-muted underline decoration-danger/40 underline-offset-2 hover:text-foreground">
                    {msg}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function flatten(errors: FieldErrors, prefix = ""): [string, string][] {
  const out: [string, string][] = [];
  for (const [k, v] of Object.entries(errors)) {
    if (!v) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof (v as { message?: unknown }).message === "string") out.push([path, (v as { message: string }).message]);
    else if (typeof v === "object") out.push(...flatten(v as FieldErrors, path));
  }
  return out;
}
