import type { Metadata } from "next";

import { OperatorUnpaidView } from "../../../../../components/operator/operator-unpaid-view";

export const metadata: Metadata = {
	title: "Khoản chưa thanh toán | CAS",
};

export default function OperatorUnpaidPage() {
	return <OperatorUnpaidView />;
}
