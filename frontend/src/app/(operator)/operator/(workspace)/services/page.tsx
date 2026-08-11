import type { Metadata } from "next";

import { OperatorServiceBookingsView } from "../../../../../components/operator/operator-service-bookings-view";

export const metadata: Metadata = {
  title: "Dịch vụ thêm | CAS",
};

export default function OperatorServiceBookingsPage() {
  return <OperatorServiceBookingsView />;
}
