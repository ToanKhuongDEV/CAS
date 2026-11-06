import type { Metadata } from "next";

import { OperatorUnpaidView } from "../../../components/operator/operator-unpaid-view";

export const metadata: Metadata = {
  title: "Khoản chưa thanh toán | CAS Admin",
};

export default function AdminUnpaidPage() {
  return <OperatorUnpaidView mode="admin" />;
}
