import type { Metadata } from "next";
import { OperatorOrderCreationView } from "../../../../../../components/operator/order-creation/operator-order-creation-view";

export const metadata: Metadata = {
  title: "Tạo order hộ tại bàn | CAS",
  description: "Nhân viên tiếp nhận và tạo order hộ cho khách tại bàn.",
};

type PageProps = {
  searchParams: Promise<{
    table?: string;
  }>;
};

export default async function OperatorNewOrderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tableCode = params.table;
  const defaultTableId = tableCode ? `table-${tableCode.padStart(2, "0")}` : "table-05";

  return <OperatorOrderCreationView defaultTableId={defaultTableId} />;
}
