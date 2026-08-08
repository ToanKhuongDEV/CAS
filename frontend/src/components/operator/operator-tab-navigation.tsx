"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CasIconName } from "../ui/cas-icon";
import { CasIcon } from "../ui/cas-icon";

type OperatorTab = {
	badge?: number;
	href: string;
	icon: CasIconName;
	label: string;
};

const operatorTabs: OperatorTab[] = [
	{ href: "/operator/dashboard", icon: "table", label: "Tổng quan" },
	{ badge: 8, href: "/operator/orders", icon: "bill", label: "Đơn gọi món" },
	{ badge: 3, href: "/operator/cancellations", icon: "minus", label: "Hủy món" },
	{ badge: 3, href: "/operator/payments", icon: "payment", label: "Thanh toán" },
	{ badge: 1, href: "/operator/unpaid", icon: "clock", label: "Chưa thanh toán" },
];

export function OperatorTabNavigation() {
	const pathname = usePathname();

	return (
		<nav className="overflow-x-auto border-y border-cas-outline-variant/25 bg-cas-navigation px-4 backdrop-blur-xl sm:px-8 xl:px-12" aria-label="Điều hướng nhân viên">
			<div className="mx-auto flex min-w-max max-w-[100rem] gap-1 py-2 lg:grid lg:min-w-0 lg:grid-cols-5">
				{operatorTabs.map((tab) => {
					const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

					return (
						<Link
							className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${
								isActive ? "bg-cas-secondary-container/30 text-cas-secondary" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"
							}`}
							href={tab.href}
							key={tab.href}
							aria-current={isActive ? "page" : undefined}
						>
							<CasIcon className="size-5 shrink-0" name={tab.icon} />
							<span>{tab.label}</span>
							{typeof tab.badge === "number" ? (
								<span className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] font-black leading-none ${isActive ? "bg-cas-secondary text-white shadow-xs" : "bg-cas-primary/15 text-cas-primary"}`} aria-label={`${tab.badge} item`}>
									{tab.badge}
								</span>
							) : null}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
