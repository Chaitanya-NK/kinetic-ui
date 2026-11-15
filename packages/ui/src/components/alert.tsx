import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@kineticui/core";
import { AlertIcon, CheckIcon, InfoIcon, XIcon } from "@kineticui/icons";

const alertVariants = cva("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", {
  variants: {
    tone: {
      info: "border-info/30 bg-info-soft text-info",
      success: "border-success/30 bg-success-soft text-success",
      warning: "border-warning/30 bg-warning-soft text-warning",
      danger: "border-danger/30 bg-danger-soft text-danger",
    },
  },
  defaultVariants: { tone: "info" },
});

const icons = { info: InfoIcon, success: CheckIcon, warning: AlertIcon, danger: XIcon };

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    title?: React.ReactNode;
    /** Buttons or links on the right. */
    action?: React.ReactNode;
  };

export function Alert({ tone = "info", title, action, className, children, ...props }: AlertProps) {
  const Icon = icons[tone ?? "info"];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn(alertVariants({ tone }), className)} {...props}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="flex flex-1 flex-col gap-0.5">
        {title ? <span className="font-semibold">{title}</span> : null}
        {children ? <span className="opacity-90">{children}</span> : null}
      </div>
      {action}
    </div>
  );
}

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      {icon ? (
        <div className="mb-2 flex size-20 items-center justify-center rounded-3xl border border-dashed border-border-strong text-muted [&_svg]:size-8">
          {icon}
        </div>
      ) : null}
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description ? <p className="max-w-xs text-sm leading-relaxed text-muted">{description}</p> : null}
      {actions ? <div className="mt-2 flex gap-2">{actions}</div> : null}
    </div>
  );
}
