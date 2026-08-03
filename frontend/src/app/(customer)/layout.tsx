import type { ReactNode } from "react";

import { GlobalDragScroll } from "../../components/ui/global-drag-scroll";

type CustomerLayoutProps = {
  children: ReactNode;
};

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return <GlobalDragScroll>{children}</GlobalDragScroll>;
}
