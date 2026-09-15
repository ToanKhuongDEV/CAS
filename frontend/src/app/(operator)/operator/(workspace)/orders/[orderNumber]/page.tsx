import type { Metadata } from "next";

import { OperatorOrderDetailView } from "../../../../../../components/operator/operator-order-detail-view";

export const metadata: Metadata = {
  title: "Chi tiết order | CAS",
};

export default async function OperatorOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return <OperatorOrderDetailView orderId={decodeURIComponent(orderNumber)} />;
}
