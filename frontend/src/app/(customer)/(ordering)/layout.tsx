import type { ReactNode } from "react";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";

type OrderingLayoutProps = {
  children: ReactNode;
};

export default function OrderingLayout({ children }: OrderingLayoutProps) {
  return (
    <div className="min-h-screen bg-cas-surface text-cas-on-surface transition-colors duration-200">
      <CustomerHeader />
      <div className="mx-auto flex w-full max-w-[85rem] items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
        <CustomerBottomNavigation activeItem="menu" />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
