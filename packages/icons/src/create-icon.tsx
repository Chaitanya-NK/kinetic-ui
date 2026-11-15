import * as React from "react";

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  /** Width and height in px. Default 24. */
  size?: number | string;
  /** Stroke width. Default 2. */
  strokeWidth?: number | string;
  /** Accessible label. Without one the icon is hidden from screen readers. */
  title?: string;
};

export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

/** Build an icon component from a single 24×24 path string. */
export function createIcon(name: string, d: string): IconComponent {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 2, title, color = "currentColor", ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d={d} />
      </svg>
    ),
  );
  Icon.displayName = name;
  return Icon;
}
