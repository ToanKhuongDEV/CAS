import type { ReactNode } from "react";

import { GlobalDragScroll } from "../../components/ui/global-drag-scroll";

type OperatorLayoutProps = {
  children: ReactNode;
};

export default function OperatorLayout({ children }: OperatorLayoutProps) {
  return <GlobalDragScroll>{children}</GlobalDragScroll>;
}
