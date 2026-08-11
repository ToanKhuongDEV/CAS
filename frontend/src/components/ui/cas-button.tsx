import { forwardRef } from "react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CasIcon, type CasIconName } from "./cas-icon";

export type CasButtonVariant = "primary" | "outline" | "outline-primary" | "danger" | "ghost";
export type CasButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: CasButtonVariant;
  size?: CasButtonSize;
  className?: string;
  icon?: CasIconName | ReactNode;
};

export type CasButtonProps = BaseProps &
  (
    | (ComponentPropsWithoutRef<"button"> & { href?: never })
    | (ComponentPropsWithoutRef<typeof Link> & { href: string })
  );

const variantClasses: Record<CasButtonVariant, string> = {
  primary: "bg-cas-primary text-cas-on-primary shadow-md hover:brightness-110",
  outline:
    "bg-cas-surface text-cas-on-surface shadow-sm ring-1 ring-inset ring-cas-outline-variant/60 hover:bg-cas-on-surface/5",
  "outline-primary":
    "border border-cas-primary/30 bg-cas-surface-container text-cas-primary hover:bg-cas-primary/8",
  danger: "bg-cas-error text-cas-on-error shadow-md hover:bg-cas-error-hover",
  ghost: "bg-transparent text-cas-on-surface hover:bg-cas-on-surface/5",
};

const sizeClasses: Record<CasButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-xs sm:text-sm",
  lg: "px-6 py-3 text-sm sm:text-base",
};

export const CasButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, CasButtonProps>(
  ({ variant = "primary", size = "md", href, className = "", icon, children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

    const combinedClasses =
      `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    const renderIcon = () => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return (
          <CasIcon name={icon as CasIconName} className={size === "sm" ? "size-4" : "size-5"} />
        );
      }
      return icon;
    };

    if (href !== undefined) {
      return (
        <Link
          href={href}
          className={combinedClasses}
          ref={ref as any}
          {...(props as Omit<ComponentPropsWithoutRef<typeof Link>, "href">)}
        >
          {renderIcon()}
          {children}
        </Link>
      );
    }

    const buttonType = "type" in props ? (props.type as "button" | "submit" | "reset") : "button";

    return (
      <button
        type={buttonType}
        className={combinedClasses}
        ref={ref as any}
        {...(props as ComponentPropsWithoutRef<"button">)}
      >
        {renderIcon()}
        {children}
      </button>
    );
  },
);

CasButton.displayName = "CasButton";
