import type { Metadata } from "next";

import { OperatorCatalogAvailabilityView } from "../../../../../components/operator/operator-catalog-availability-view";

export const metadata: Metadata = {
  title: "Món hàng | CAS",
};

export default function OperatorCatalogPage() {
  return <OperatorCatalogAvailabilityView />;
}
