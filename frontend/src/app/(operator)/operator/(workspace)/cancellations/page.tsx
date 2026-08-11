import type { Metadata } from "next";
import { OperatorCancellationRequestsView } from "../../../../../components/operator/operator-cancellation-requests-view";

export const metadata: Metadata = {
  title: "Yêu cầu hủy món | CAS",
};

export default function OperatorCancellationsPage() {
  return <OperatorCancellationRequestsView />;
}
