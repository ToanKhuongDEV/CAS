import type { Metadata } from "next";

import { OperatorServiceBookingsView } from "../../../components/operator/operator-service-bookings-view";

export const metadata: Metadata = {
  title: "Dịch vụ thêm | CAS Admin",
};

export default function AdminServiceBookingsPage() {
  return <OperatorServiceBookingsView mode="admin" />;
}
