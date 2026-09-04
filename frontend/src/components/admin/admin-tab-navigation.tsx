"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type SubMenuItem = {
  children?: SubMenuItem[];
  href?: string;
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
    label: "Menu & Promotion",
    items: [
      {
        label: "Catalog",
        children: [
          { href: "/admin/catalog", label: "Món ăn" },
          { href: "/admin/catalog/categories", label: "Danh mục" },
          { href: "/admin/catalog/options", label: "Option" },
        ],
      },
      { href: "/admin/catalog/tags", label: "Nhãn món" },
      { href: "/admin/promotions", label: "Khuyến mãi (Promotions)" },
      { href: "/admin/services", label: "Dịch vụ thêm" },
      { href: "/admin/tables", label: "Sơ đồ Bàn & Mã QR" },
    ],
  },
  {
    label: "Sự cố và Nhân sự",
    items: [
      { href: "/admin/operators", label: "Tài khoản Nhân viên" },
      { href: "/admin/admins", label: "Tài khoản Quản trị viên" },
      { href: "/admin/incidents", label: "Báo cáo Sự cố Ca trực" },
      { href: "/admin/unpaid", label: "Khoản chưa thanh toán" },
    ],
  },
  {
    href: "/admin/reports",
    label: "Báo cáo",
  },
  {
    href: "/admin/customers",
    label: "Khách hàng",
  },
  {
    label: "Thông tin & thông báo",
    items: [
      { href: "/admin/settings", label: "Thông tin & Cấu hình Cửa hàng" },
      { href: "/admin/notifications", label: "Thông báo hệ thống" },
      { href: "/admin/audit-logs", label: "Audit Logs" },
    ],
  },
];

function getAllGroupHrefs(items?: SubMenuItem[]): string[] {
  if (!items) return [];
  const hrefs: string[] = [];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.children) {
      for (const child of item.children) {
        if (child.href) hrefs.push(child.href);
      }
    }
  }
  return hrefs;
}

function isRouteActive(pathname: string, targetHref: string, siblingHrefs: string[] = []) {
  if (pathname === targetHref) return true;
  if (!pathname.startsWith(targetHref + "/")) return false;
  // Nếu targetHref là tiền tố của pathname, đảm bảo không có sibling href nào khác có độ dài lớn hơn mà cũng match pathname
  return !siblingHrefs.some(
    (sibling) =>
      sibling !== targetHref &&
      sibling.length > targetHref.length &&
      (pathname === sibling || pathname.startsWith(sibling + "/")),
  );
}

export function AdminTabNavigation() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Tính toán vị trí ngang của popup theo menu đang mở.
  const openDropdown = (label: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const popupWidth = 260;
    const leftPos = Math.min(rect.left, window.innerWidth - popupWidth - 4);
    setDropdownPos({ left: leftPos });
    setActiveSubmenu(null);
    setActiveDropdown(label);
  };

  // Đóng popup khi click ra ngoài hoặc khi cuộn trang
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setActiveSubmenu(null);
      }
    }
    function handleScroll() {
      setActiveDropdown(null);
      setActiveSubmenu(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const activeGroup = adminNavSchema.find((g) => g.label === activeDropdown);
  const activeGroupHrefs = getAllGroupHrefs(activeGroup?.items);

  return (
    <nav
      ref={navRef}
      className="relative border-y border-cas-outline-variant/25 bg-cas-navigation backdrop-blur-xl"
      aria-label="Thanh điều hướng Admin"
    >
      <div className="mx-auto flex max-w-[100rem] items-center gap-1 overflow-x-auto px-4 py-2 whitespace-nowrap no-scrollbar sm:px-8 xl:px-12">
        {adminNavSchema.map((group) => {
          // Single Link Item (e.g. "Tổng quan")
          if (group.href && !group.items) {
            const isActive = pathname === group.href;

            return (
              <Link
                key={group.label}
                href={group.href}
                onClick={() => setActiveDropdown(null)}
                className={`flex min-h-12 shrink-0 items-center rounded-xl px-3.5 text-base font-bold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${isActive ? "bg-cas-secondary-container/30 text-cas-secondary font-black" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"}`}
              >
                <span>{group.label}</span>
              </Link>
            );
          }

          // Dropdown Item
          const groupSiblingHrefs = getAllGroupHrefs(group.items);
          const isChildActive = groupSiblingHrefs.some((href) =>
            isRouteActive(pathname, href, groupSiblingHrefs),
          );
          const isOpen = activeDropdown === group.label;
          const submenuId = `admin-submenu-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          return (
            <div key={group.label} className="relative shrink-0">
              <button
                type="button"
                onMouseEnter={(e) => openDropdown(group.label, e.currentTarget)}
                onClick={(e) => openDropdown(group.label, e.currentTarget)}
                aria-controls={submenuId}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className={`flex min-h-12 items-center gap-1.5 rounded-xl px-3.5 text-base font-bold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${isChildActive ? "bg-cas-secondary-container/30 text-cas-secondary font-black" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"}`}
              >
                <span>{group.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Dropdown Menu xổ ra ngoài box overflow */}
      {activeDropdown && activeGroup && activeGroup.items && dropdownPos && (
        <div
          id={`admin-submenu-${activeGroup.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          role="menu"
          style={{ left: `${dropdownPos.left}px` }}
          onMouseLeave={() => {
            setActiveDropdown(null);
            setActiveSubmenu(null);
          }}
          className="absolute top-full z-50 min-w-64 rounded-b-2xl border border-t-0 border-cas-outline-variant/30 bg-cas-surface p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 space-y-1"
        >
          {activeGroup.items.map((sub) => {
            // Group cấp 2 (VD: Catalog)
            if (sub.children) {
              const isSubmenuOpen = activeSubmenu === sub.label;
              const nestedMenuId = `admin-nested-submenu-${sub.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

              return (
                <div key={sub.label} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveSubmenu(sub.label)}
                    onClick={() =>
                      setActiveSubmenu((current) => (current === sub.label ? null : sub.label))
                    }
                    aria-controls={nestedMenuId}
                    aria-expanded={isSubmenuOpen}
                    aria-haspopup="menu"
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-xs font-bold transition focus-visible:outline-none ${isSubmenuOpen ? "bg-cas-secondary-container/30 text-cas-secondary font-black" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"}`}
                  >
                    <span>{sub.label}</span>
                    <span aria-hidden="true" className="text-base leading-none">
                      ›
                    </span>
                  </button>
                  {isSubmenuOpen && (
                    <div
                      id={nestedMenuId}
                      role="menu"
                      className="absolute left-full top-0 z-10 ml-2 min-w-56 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 space-y-1"
                    >
                      {sub.children.map((child) => {
                        const isChildActive = isRouteActive(
                          pathname,
                          child.href!,
                          activeGroupHrefs,
                        );
                        return (
                          <Link
                            key={child.href}
                            href={child.href!}
                            role="menuitem"
                            onClick={() => setActiveDropdown(null)}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-bold transition ${isChildActive ? "bg-cas-secondary-container/30 text-cas-secondary font-black" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"}`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Item đơn cấp 1 trong dropdown (VD: Vouchers, Sơ đồ bàn)
            const isSubActive = isRouteActive(pathname, sub.href!, activeGroupHrefs);
            return (
              <Link
                key={sub.href}
                href={sub.href!}
                role="menuitem"
                onMouseEnter={() => setActiveSubmenu(null)}
                onClick={() => setActiveDropdown(null)}
                className={`flex items-center justify-between rounded-xl px-4 py-2 text-xs font-bold transition ${isSubActive ? "bg-cas-secondary-container/30 text-cas-secondary font-black" : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"}`}
              >
                <span>{sub.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
