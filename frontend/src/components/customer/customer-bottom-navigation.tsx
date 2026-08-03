import Link from "next/link";

import type { CasIconName } from "../ui/cas-icon";
import { CasIcon } from "../ui/cas-icon";

type NavigationItem = {
  href: string;
  icon: CasIconName;
  id: "menu" | "orders" | "payment" | "settings";
  label: string;
};

type CustomerBottomNavigationProps = {
  activeItem: NavigationItem["id"];
};

const navigationItems: NavigationItem[] = [
  { id: "menu", label: "Menu", icon: "menu", href: "/menu" },
  { id: "orders", label: "Đơn hàng", icon: "bill", href: "/orders" },
  { id: "payment", label: "Thanh toán", icon: "payment", href: "#" },
  { id: "settings", label: "Cài đặt", icon: "settings", href: "#" },
];

export function CustomerBottomNavigation({
  activeItem,
}: CustomerBottomNavigationProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 grid min-h-20 grid-cols-4 rounded-t-xl border-t border-cas-outline-variant/30 bg-cas-navigation px-3 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_var(--cas-shadow-color)] backdrop-blur-xl md:hidden"
      aria-label="Điều hướng chính"
    >
      {navigationItems.map((item) => {
        const isActive = item.id === activeItem;

        return (
          <Link
            className={`flex flex-col items-center justify-center gap-1 rounded-xl text-[0.62rem] font-semibold focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${
              isActive
                ? "bg-cas-secondary-container/20 text-cas-primary"
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
