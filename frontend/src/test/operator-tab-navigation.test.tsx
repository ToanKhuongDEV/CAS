import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorTabNavigation } from "../components/operator/operator-tab-navigation";
import { QueryProvider } from "../components/providers/query-provider";
import { loadOperatorPendingCancellationCount } from "../lib/api/ordering/cancellation.api";
import { loadOperatorPendingPreparationTableCount } from "../lib/api/ordering/preparation.api";
import { loadOperatorPendingPaymentCount } from "../lib/api/payment/payment.api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/operator/orders/ORD-0819",
}));
vi.mock("../lib/api/payment/payment.api", () => ({
  loadOperatorPendingPaymentCount: vi.fn(),
  operatorPendingPaymentCountQueryKey: ["operator", "payments", "pending-count"],
}));
vi.mock("../lib/api/ordering/cancellation.api", () => ({
  loadOperatorPendingCancellationCount: vi.fn(),
  operatorPendingCancellationCountQueryKey: ["operator", "cancellations", "pending-count"],
}));
vi.mock("../lib/api/ordering/preparation.api", () => ({
  loadOperatorPendingPreparationTableCount: vi.fn(),
  operatorPendingPreparationTableCountQueryKey: ["operator", "preparation", "pending-table-count"],
}));

describe("OperatorTabNavigation", () => {
  it("renders six routes and shows the live pending preparation, payment, and cancellation counts", async () => {
    vi.mocked(loadOperatorPendingPaymentCount).mockResolvedValue(2);
    vi.mocked(loadOperatorPendingCancellationCount).mockResolvedValue(3);
    vi.mocked(loadOperatorPendingPreparationTableCount).mockResolvedValue(4);
    render(
      <QueryProvider>
        <OperatorTabNavigation />
      </QueryProvider>,
    );

    const expectedTabs = [
      [/Tổng quan/, "/operator/dashboard"],
      [/Đơn gọi món/, "/operator/orders"],
      [/Hủy món/, "/operator/cancellations"],
      [/Thanh toán/, "/operator/payments"],
      [/Menu/, "/operator/catalog"],
      [/Dịch vụ thêm/, "/operator/services"],
    ] as const;

    expectedTabs.forEach(([nameRegex, href]) => {
      expect(screen.getByRole("link", { name: nameRegex })).toHaveAttribute("href", href);
    });
    expect(screen.getByRole("link", { name: /Đơn gọi món/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await screen.findByLabelText("4 bàn đang chờ món")).toBeInTheDocument();
    expect(await screen.findByLabelText("2 yêu cầu thanh toán chờ xác nhận")).toBeInTheDocument();
    expect(await screen.findByLabelText("3 yêu cầu hủy món chờ xử lý")).toBeInTheDocument();
  });
});
