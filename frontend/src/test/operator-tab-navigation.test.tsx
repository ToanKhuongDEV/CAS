import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorTabNavigation } from "../components/operator/operator-tab-navigation";
import { QueryProvider } from "../components/providers/query-provider";
import { loadOperatorPendingPaymentCount } from "../lib/api/payment/payment.api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/operator/orders/ORD-0819",
}));
vi.mock("../lib/api/payment/payment.api", () => ({
  loadOperatorPendingPaymentCount: vi.fn(),
  operatorPendingPaymentCountQueryKey: ["operator", "payments", "pending-count"],
}));

describe("OperatorTabNavigation", () => {
  it("renders six routes and shows the live pending-payment count", async () => {
    vi.mocked(loadOperatorPendingPaymentCount).mockResolvedValue(2);
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
      [/Chưa thanh toán/, "/operator/unpaid"],
      [/Dịch vụ thêm/, "/operator/services"],
    ] as const;

    expectedTabs.forEach(([nameRegex, href]) => {
      expect(screen.getByRole("link", { name: nameRegex })).toHaveAttribute("href", href);
    });
    expect(screen.getByRole("link", { name: /Đơn gọi món/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await screen.findByLabelText("2 yêu cầu thanh toán chờ xác nhận")).toBeInTheDocument();
  });
});
