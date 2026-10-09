import type { ReactNode } from "react";

import { CustomerHeader } from "../../components/customer/customer-header";
import { GlobalDragScroll } from "../../components/ui/global-drag-scroll";

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <GlobalDragScroll>
      <CustomerHeader />
      {children}
    </GlobalDragScroll>
  );
}
