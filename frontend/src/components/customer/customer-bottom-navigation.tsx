import Link from "next/link";

import type { CasIconName } from "../ui/cas-icon";
import { CasIcon } from "../ui/cas-icon";

type NavigationItem = {
  href: string;
  icon: CasIconName;
  id: "home" | "menu" | "orders" | "payment" | "settings";
  label: string;
};

type CustomerBottomNavigationProps = {
  activeItem: NavigationItem["id"];
};

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Trang chủ", icon: "restaurant", href: "/" },
  { id: "menu", label: "Thực đơn", icon: "menu", href: "/menu" },
  { id: "orders", label: "Đơn hàng", icon: "bill", href: "/orders" },
  { id: "settings", label: "Cài đặt", icon: "settings", href: "/settings" },
];

export function CustomerBottomNavigation({
  activeItem,
}: CustomerBottomNavigationProps) {
  const visibleItems =
    activeItem === "payment"
      ? [
          ...navigationItems.slice(0, 3),
          {
            id: "payment" as const,
            label: "Thanh toán",
            icon: "payment" as const,
            href: "/payment",
          },
          navigationItems[3],
        ]
      : navigationItems;

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-50 grid min-h-20 rounded-t-xl border-t border-cas-outline-variant/30 bg-cas-navigation px-3 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_var(--cas-shadow-color)] backdrop-blur-xl md:sticky md:top-24 md:z-20 md:w-52 lg:w-56 md:shrink-0 md:grid-cols-1 md:content-start md:gap-2.5 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none ${
        activeItem === "payment" ? "grid-cols-5" : "grid-cols-4"
      }`}
      aria-label="Điều hướng chính"
    >
      {visibleItems.map((item) => {
        const isActive = item.id === activeItem;

        return (
          <Link
            className={`flex flex-col items-center justify-center gap-1 rounded-xl text-[0.62rem] font-semibold focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring md:min-h-13 md:flex-row md:justify-start md:gap-3.5 md:rounded-2xl md:border md:border-cas-outline-variant/35 md:bg-cas-surface-container md:px-4 md:text-sm md:font-bold md:shadow-[0_4px_14px_var(--cas-shadow-color)] md:transition md:hover:-translate-y-0.5 md:hover:border-cas-primary/45 ${
              isActive
                ? "bg-cas-secondary-container/20 text-cas-primary md:border-cas-primary/50 md:bg-cas-primary/10"
                : "text-cas-on-surface-variant"
            }`}
            href={item.href}
            key={item.id}
            aria-current={isActive ? "page" : undefined}
          >
            <CasIcon className="size-5.5" name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
