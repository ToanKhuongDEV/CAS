import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrdersPage from "../app/(customer)/orders/page";
import { ToastProvider } from "../components/ui/toast-provider";
import { loadCustomerBill, requestCustomerCancellation } from "../lib/api/ordering/ordering.api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadCustomerBill: vi.fn(),
  requestCustomerCancellation: vi.fn(),
}));

const bill = {
  tableCode: 5,
  sessionStatus: "OPEN" as const,
  originalAmount: 55_000,
  payableAmount: 55_000,
  orders: [
    {
      orderId: "order-1",
      orderNumber: "ORD-001",
      originalAmount: 55_000,
      payableAmount: 55_000,
      note: null,
      createdAt: "2026-09-03T09:00:00",
      items: [
        {
          orderItemId: "item-1",
          itemName: "Mỳ cay đặc biệt 7 cấp độ",
          unitPrice: 55_000,
          optionsAmount: 0,
          quantity: 2,
          preparedQuantity: 0,
          cancelledQuantity: 0,
          totalAmount: 55_000,
          options: [],
        },
      ],
    },
  ],
};

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.mocked(loadCustomerBill).mockResolvedValue(bill);
    vi.mocked(requestCustomerCancellation).mockResolvedValue(undefined);
  });

  it("lets a customer submit a cancellation request in the UI", async () => {
    render(
      <ToastProvider>
        <OrdersPage />
      </ToastProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Đơn hàng · Bàn 05" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hủy món" }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("Lý do hủy (không bắt buộc)"), {
      target: { value: "Gọi nhầm món" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

    await waitFor(() =>
      expect(requestCustomerCancellation).toHaveBeenCalledWith("item-1", 1, "Gọi nhầm món"),
    );
    expect(
      await screen.findByText("Yêu cầu hủy món đã được gửi cho nhân viên."),
    ).toBeInTheDocument();
  });
});
