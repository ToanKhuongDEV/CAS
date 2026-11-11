import type { Metadata } from "next";

import { OperatorPreparationWorkspace } from "./operator-preparation-workspace";

export const metadata: Metadata = {
  title: "Tổng hợp món cần làm | Bambu Garden",
};

export default function OperatorOrdersPage() {
  return <OperatorPreparationWorkspace />;
}
