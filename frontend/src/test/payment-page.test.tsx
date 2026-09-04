import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentRequestPanel } from "../app/(customer)/payment/payment-request-panel";
import { loadCustomerBill } from "../lib/api/ordering/ordering.api";
import { createCustomerPayment, loadCustomerPayment } from "../lib/api/payment/payment.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../lib/api/ordering/ordering.api", () => ({ loadCustomerBill: vi.fn() }));
vi.mock("../lib/api/payment/payment.api", () => ({
  createCustomerPayment: vi.fn(),
  loadCustomerPayment: vi.fn(),
}));

const bill = {
  originalAmount: 55_000,
  payableAmount: 55_000,
  sessionStatus: "OPEN" as const,
  tableCode: 8,
  orders: [
    {
      createdAt: "2026-09-01T20:00:00+07:00",
      items: [
        {
          cancelledQuantity: 0,
          itemName: "Mỳ cay API",
          options: [{ groupName: "Cấp độ", optionName: "Cấp 2", quantityPerItem: 1, unitPrice: 0 }],
          optionsAmount: 0,
          orderItemId: "item-1",
          preparedQuantity: 0,
          quantity: 1,
          totalAmount: 55_000,
          unitPrice: 55_000,
        },
      ],
      note: null,
      orderId: "order-1",
      orderNumber: "CAS-1",
      originalAmount: 55_000,
      payableAmount: 55_000,
    },
  ],
};

describe("PaymentRequestPanel", () => {
  beforeEach(() => {
    vi.mocked(loadCustomerBill).mockResolvedValue(bill);
    vi.mocked(loadCustomerPayment).mockRejectedValue(new Error("Chưa có payment"));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the bill returned by the API", async () => {
    render(<PaymentRequestPanel />);

    expect(await screen.findByText("Mỳ cay API")).toBeInTheDocument();
    expect(screen.getByText("+ Cấp 2")).toBeInTheDocument();
    expect(screen.getAllByText("55.000 ₫")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Gửi yêu cầu thanh toán" })).toBeEnabled();
  });

  it("shows API payment details after confirmation", async () => {
    vi.mocked(loadCustomerPayment).mockResolvedValue({
      amount: 55_000,
      billSnapshot: "{}",
      confirmedAt: "2026-09-01T20:05:00+07:00",
      createdAt: "2026-09-01T20:00:00+07:00",
      publicId: "payment-1",
      status: "PAID",
      tableCode: 8,
    });
    render(<PaymentRequestPanel />);

    expect(
      await screen.findByRole("heading", { name: "Thanh toán thành công" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bàn 08")).toBeInTheDocument();
    expect(screen.getByText("20:05")).toBeInTheDocument();
  });

  it("clears the payment view when the table session is closed", async () => {
    vi.mocked(loadCustomerBill).mockRejectedValue(
      new Error("Vui lòng quét mã QR của bàn để tiếp tục."),
    );
    vi.mocked(loadCustomerPayment).mockRejectedValue(
      new Error("Vui lòng quét mã QR của bàn để tiếp tục."),
    );
    render(<PaymentRequestPanel />);

    await waitFor(() => expect(loadCustomerBill).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Gửi yêu cầu thanh toán" }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Đang tải hóa đơn…")).not.toBeInTheDocument();
  });

  it("creates a payment through the API", async () => {
    vi.mocked(createCustomerPayment).mockResolvedValue({
      amount: 55_000,
      billSnapshot: "{}",
      confirmedAt: null,
      createdAt: "2026-09-01T20:00:00+07:00",
      publicId: "payment-1",
      status: "PENDING",
      tableCode: 8,
    });
    render(<PaymentRequestPanel />);

    fireEvent.click(await screen.findByRole("button", { name: "Gửi yêu cầu thanh toán" }));
    await waitFor(() => expect(createCustomerPayment).toHaveBeenCalledOnce());
    expect(
      screen.getByRole("dialog", { name: "Yêu cầu thanh toán đã được gửi" }),
    ).toBeInTheDocument();
  });
});
