import type { Viewport } from "next";
import type { ReactNode } from "react";

import { CustomerHeader } from "../../components/customer/customer-header";
import { CustomerBackgroundShapes } from "../../components/customer/customer-background-shapes";
import { GlobalDragScroll } from "../../components/ui/global-drag-scroll";

export const viewport: Viewport = { viewportFit: "cover" };

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <GlobalDragScroll>
      <div className="relative isolate min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-cas-surface bg-[linear-gradient(var(--cas-pattern-color)_1px,transparent_1px),linear-gradient(90deg,var(--cas-pattern-color)_1px,transparent_1px)] bg-size-[30px_30px]">
        <CustomerBackgroundShapes />
        <CustomerHeader />
        {children}
      </div>
    </GlobalDragScroll>
  );
}
