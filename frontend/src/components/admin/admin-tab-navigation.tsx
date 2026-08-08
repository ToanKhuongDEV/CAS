"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type SubMenuItem = {
	badge?: number;
	href: string;
	label: string;
};

type MenuItemGroup = {
	href?: string;
	items?: SubMenuItem[];
	label: string;
};

const adminNavSchema: MenuItemGroup[] = [
	{
		href: "/admin",
		label: "Tổng quan",
	},
	{
		label: "Quản lý Quán",
		items: [
			{ href: "/admin/catalog", label: "Món ăn" },
			{ href: "/admin/catalog/categories", label: "Danh mục" },
			{ href: "/admin/catalog/options", label: "Nhóm & giá trị Option" },
			{ href: "/admin/catalog/tags", label: "Nhãn món" },
			{ href: "/admin/vouchers", label: "Mã giảm giá (Vouchers)" },
			{ href: "/admin/promotions", label: "Cấu hình Khuyến mãi & Banner" },
			{ href: "/admin/tables", label: "Sơ đồ Bàn & Mã QR" },
		],
	},
	{
		label: "Sự cố và Nhân sự",
		items: [
			{ href: "/admin/operators", label: "Tài khoản Nhân viên" },
			{ badge: 2, href: "/admin/incidents", label: "Báo cáo Sự cố Ca trực" },
		],
	},
	{
		href: "/admin/reports",
		label: "Báo cáo",
	},
	{
		label: "Hệ thống & Cấu hình",
		items: [
			{ href: "/admin/settings", label: "Tham số vận hành" },
			{ href: "/admin/notifications", label: "Thông báo hệ thống" },
			{ href: "/admin/audit-logs", label: "Audit Logs" },
		],
	},
];

export function AdminTabNavigation() {
	const pathname = usePathname();
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const navRef = useRef<HTMLElement>(null);

	// Auto close popover on click outside
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setActiveDropdown(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<nav ref={navRef} className="border-y border-cas-outline-variant/25 bg-cas-navigation backdrop-blur-xl" aria-label="Thanh điều hướng Admin">
			<div className="mx-auto flex max-w-[100rem] flex-wrap items-center gap-x-6 px-4 sm:px-8 xl:px-12">
				{adminNavSchema.map((group) => {
					// Single Link Item (e.g. "Trang chủ Admin")
					if (group.href && !group.items) {
						const isActive = pathname === group.href;

						return (
							<Link key={group.label} href={group.href} onClick={() => setActiveDropdown(null)} className={`relative py-3.5 text-base font-bold transition focus-visible:outline-none ${isActive ? "text-cas-secondary font-black" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`}>
								<span>{group.label}</span>
								{isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-cas-secondary rounded-full" />}
							</Link>
						);
					}

					// Dropdown Item with Submenu Box (matches 12e.jpg design)
					const isChildActive = group.items?.some((item) => pathname.startsWith(item.href));
					const isOpen = activeDropdown === group.label;
					const submenuId = `admin-submenu-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
					const totalBadge = group.items?.reduce((acc, item) => acc + (item.badge || 0), 0);

					return (
						<div key={group.label} className="relative" onMouseEnter={() => setActiveDropdown(group.label)}>
							<button
								type="button"
								onClick={() => setActiveDropdown(isOpen ? null : group.label)}
								aria-controls={submenuId}
								aria-expanded={isOpen}
								aria-haspopup="menu"
								className={`relative flex items-center gap-1.5 py-3.5 text-base font-bold transition focus-visible:outline-none ${isChildActive || isOpen ? "text-cas-secondary font-black" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`}
							>
								<span>{group.label}</span>
								{Boolean(totalBadge) && <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cas-primary px-1 text-[0.65rem] font-black text-white">{totalBadge}</span>}
								{isChildActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-cas-secondary rounded-full" />}
							</button>

							{/* VERTICAL DROPDOWN POPUP BOX (Exact style of 12e.jpg) */}
							{isOpen && group.items && (
								<div id={submenuId} role="menu" onMouseLeave={() => setActiveDropdown(null)} className="absolute left-0 top-full z-50 mt-0 min-w-60 overflow-hidden rounded-2xl border border-cas-outline-variant/30 bg-cas-surface py-2 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150">
									{group.items.map((sub) => {
										const isSubActive = pathname.startsWith(sub.href);

										return (
											<Link
												key={sub.href}
												href={sub.href}
												role="menuitem"
												onClick={() => setActiveDropdown(null)}
												className={`flex items-center justify-between px-5 py-2.5 text-xs font-bold transition ${isSubActive ? "bg-cas-secondary text-white font-black" : "text-cas-on-surface hover:bg-cas-secondary hover:text-white"}`}
											>
												<span>{sub.label}</span>
												{typeof sub.badge === "number" && <span className={`inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.65rem] font-black ${isSubActive ? "bg-white text-cas-secondary" : "bg-cas-primary text-white"}`}>{sub.badge}</span>}
											</Link>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</nav>
	);
}
