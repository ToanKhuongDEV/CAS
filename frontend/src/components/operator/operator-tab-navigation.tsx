"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CasIconName } from "../ui/cas-icon";
import { CasIcon } from "../ui/cas-icon";

type OperatorTab = {
  href: string;
  icon: CasIconName;
  label: string;
};

const operatorTabs: OperatorTab[] = [
  { href: "/operator/dashboard", icon: "table", label: "Tổng quan" },
  { href: "/operator/orders", icon: "bill", label: "Đơn gọi món" },
  { href: "/operator/cancellations", icon: "minus", label: "Hủy món" },
  { href: "/operator/payments", icon: "payment", label: "Thanh toán" },
  { href: "/operator/unpaid", icon: "clock", label: "Chưa thanh toán" },
  { href: "/operator/services", icon: "service", label: "Dịch vụ thêm" },
];

export function OperatorTabNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="overflow-x-auto border-y border-cas-outline-variant/25 bg-cas-navigation px-4 backdrop-blur-xl sm:px-8 xl:px-12"
      aria-label="Điều hướng nhân viên"
    >
      <div className="mx-auto flex min-w-max max-w-[100rem] gap-1 py-2 lg:grid lg:min-w-0 lg:grid-cols-6">
        {operatorTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${
                isActive
                  ? "bg-cas-secondary-container/30 text-cas-secondary"
                  : "text-cas-on-surface-variant hover:bg-cas-primary/8 hover:text-cas-on-surface"
              }`}
              href={tab.href}
              key={tab.href}
              aria-current={isActive ? "page" : undefined}
            >
              <CasIcon className="size-5 shrink-0" name={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
