import type { Metadata } from "next";

import { OperatorPaymentConfirmationList } from "./operator-payment-confirmation-list";

export const metadata: Metadata = {
  title: "Thanh toán chờ xác nhận | Bambu Garden",
};

export default function OperatorPaymentsPage() {
  return <OperatorPaymentConfirmationList />;
}
