import { forwardRef } from "react";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

export type CasButtonVariant = "primary" | "outline" | "danger" | "ghost";
export type CasButtonSize = "sm" | "md" | "lg";

type BaseProps = {
	variant?: CasButtonVariant;
	size?: CasButtonSize;
	className?: string;
};

export type CasButtonProps = BaseProps & ((ComponentPropsWithoutRef<"button"> & { href?: never }) | (ComponentPropsWithoutRef<typeof Link> & { href: string }));

const variantClasses: Record<CasButtonVariant, string> = {
	primary: "bg-cas-primary text-cas-on-primary shadow-md hover:bg-cas-primary-hover",
	outline: "bg-cas-surface text-cas-on-surface shadow-sm ring-1 ring-inset ring-cas-outline-variant/60 hover:bg-cas-on-surface/5",
	danger: "bg-cas-error text-cas-on-error shadow-md hover:bg-cas-error-hover",
	ghost: "bg-transparent text-cas-on-surface hover:bg-cas-on-surface/5",
};

const sizeClasses: Record<CasButtonSize, string> = {
	sm: "px-3 py-2 text-xs",
	md: "px-4 py-2.5 text-xs sm:text-sm",
	lg: "px-5 py-3 text-sm sm:text-base",
};

export const CasButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, CasButtonProps>(({ variant = "primary", size = "md", href, className = "", children, ...props }, ref) => {
	const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition focus-visible:outline-2 focus-visible:outline-cas-focus-ring active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

	const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

	if (href !== undefined) {
		return (
			<Link href={href} className={combinedClasses} ref={ref as any} {...(props as Omit<ComponentPropsWithoutRef<typeof Link>, "href">)}>
				{children}
			</Link>
		);
	}

	const buttonType = "type" in props ? (props.type as "button" | "submit" | "reset") : "button";

	return (
		<button type={buttonType} className={combinedClasses} ref={ref as any} {...(props as ComponentPropsWithoutRef<"button">)}>
			{children}
		</button>
	);
});

CasButton.displayName = "CasButton";
