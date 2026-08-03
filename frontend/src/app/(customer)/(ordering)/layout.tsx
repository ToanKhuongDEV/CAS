import type { ReactNode } from "react";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";

type OrderingLayoutProps = {
  children: ReactNode;
};

export default function OrderingLayout({ children }: OrderingLayoutProps) {
  return (
    <>
      <CustomerHeader cartCount={4} tableName="Bàn 05" />
      {children}
      <CustomerBottomNavigation activeItem="menu" />
    </>
  );
}
