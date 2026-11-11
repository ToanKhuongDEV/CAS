import type { Metadata } from "next";

import { OperatorServiceBookingsView } from "../../../components/operator/operator-service-bookings-view";

export const metadata: Metadata = {
  title: "Dịch vụ thêm | Bambu Garden Admin",
};

export default function AdminServiceBookingsPage() {
  return <OperatorServiceBookingsView mode="admin" />;
}
