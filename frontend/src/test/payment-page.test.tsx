import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PaymentRequestPanel } from "../app/(customer)/payment/payment-request-panel";
import { loadCustomerBill } from "../lib/api/ordering/ordering.api";
import {
  createCustomerPayment,
  loadCustomerPayment,
  promotionUnavailableMessage,
} from "../lib/api/payment/payment.api";
import {
  loadCustomerPromotions,
  selectCustomerPromotion,
} from "../lib/api/promotion/promotion.api";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace }) }));
vi.mock("../lib/api/ordering/ordering.api", () => ({ loadCustomerBill: vi.fn() }));
vi.mock("../lib/api/payment/payment.api", () => ({
  createCustomerPayment: vi.fn(),
  loadCustomerPayment: vi.fn(),
  loadCustomerBillAdjustments: vi.fn().mockResolvedValue([]),
  promotionUnavailableMessage: "Khuyến mãi đã không còn khả dụng. Vui lòng chọn lại khuyến mãi.",
}));
vi.mock("../lib/api/promotion/promotion.api", () => ({
  clearCustomerPromotion: vi.fn(),
  loadCustomerEligiblePromotions: vi.fn(),
  loadCustomerPromotions: vi.fn(),
  selectCustomerPromotion: vi.fn(),
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
          pendingCancellationQuantity: 0,
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
    vi.mocked(loadCustomerPromotions).mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the bill returned by the API", async () => {
    render(<PaymentRequestPanel />);

    expect(await screen.findByText("Mỳ cay API")).toBeInTheDocument();
    expect(screen.queryByText("Giảm giá")).not.toBeInTheDocument();
    expect(screen.getByText("+ Cấp 2")).toBeInTheDocument();
    expect(screen.getAllByText("55.000 ₫").length).toBeGreaterThanOrEqual(2);
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
    fireEvent.click(screen.getByRole("button", { name: "Về trang chủ" }));
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("shows takeaway instead of a table number on the success screen", async () => {
    vi.mocked(loadCustomerBill).mockRejectedValue(
      new Error("Vui lòng quét mã QR của bàn để tiếp tục."),
    );
    vi.mocked(loadCustomerPayment).mockResolvedValue({
      amount: 55_000,
      billSnapshot: "{}",
      confirmedAt: "2026-09-01T20:05:00+07:00",
      createdAt: "2026-09-01T20:00:00+07:00",
      publicId: "payment-1",
      status: "PAID",
      tableCode: null,
    });
    render(<PaymentRequestPanel />);

    expect(
      await screen.findByRole("heading", { name: "Thanh toán thành công" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mang về")).toBeInTheDocument();
  });

  it("updates a pending takeaway payment after its session closes", async () => {
    const pending = {
      amount: 55_000,
      billSnapshot: "{}",
      confirmedAt: null,
      createdAt: "2026-09-01T20:00:00+07:00",
      publicId: "payment-1",
      status: "PENDING" as const,
      tableCode: null,
    };
    vi.mocked(loadCustomerBill)
      .mockResolvedValueOnce({ ...bill, tableCode: null })
      .mockRejectedValue(new Error("Vui lòng quét mã QR của bàn để tiếp tục."));
    vi.mocked(loadCustomerPayment)
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce(pending)
      .mockResolvedValue({ ...pending, status: "PAID", confirmedAt: "2026-09-01T20:05:00+07:00" });
    render(<PaymentRequestPanel pollIntervalMs={50} />);

    expect(
      await screen.findByRole("heading", { name: "Chờ nhân viên xác nhận" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Thanh toán thành công" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mang về")).toBeInTheDocument();
  });

  it("clears the payment view when the sales session is closed", async () => {
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
      await screen.findByRole("heading", { name: "Chờ nhân viên xác nhận" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng gặp nhân viên để hoàn tất thanh toán/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Gửi yêu cầu thanh toán" }),
    ).not.toBeInTheDocument();
  });

  it("reloads promotions and asks the customer to choose again when the selected promotion is unavailable", async () => {
    const voucher = {
      promotionId: "promotion-1",
      name: "Ưu đãi công khai",
      promotionType: "PERCENT_OFF" as const,
      discountValue: 10,
      maxDiscountAmount: null,
      minBillAmount: null,
      scope: "Toàn bộ hóa đơn",
      discountAmount: 5_500,
      payableAmount: 49_500,
      eligible: true,
      unavailableReason: null,
    };
    vi.mocked(loadCustomerPromotions).mockResolvedValueOnce([voucher]).mockResolvedValue([]);
    vi.mocked(selectCustomerPromotion).mockResolvedValue({ ...voucher, code: null, codeId: null });
    vi.mocked(createCustomerPayment).mockRejectedValue(new Error(promotionUnavailableMessage));
    render(<PaymentRequestPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /Voucher \/ khuyến mãi/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Ưu đãi công khai/ }));
    await waitFor(() => expect(screen.getByText("Ưu đãi công khai")).toBeInTheDocument());
    expect(screen.getByText("-5.500 ₫")).toHaveClass("text-cas-error");
    fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu thanh toán" }));

    expect(await screen.findByText(promotionUnavailableMessage)).toBeInTheDocument();
    await waitFor(() => expect(loadCustomerPromotions).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Chọn hoặc nhập voucher")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Chờ nhân viên xác nhận" }),
    ).not.toBeInTheDocument();
  });

  it("shows unavailable active vouchers as disabled", async () => {
    vi.mocked(loadCustomerPromotions).mockResolvedValue([
      {
        discountAmount: 10_000,
        discountValue: 10,
        eligible: false,
        maxDiscountAmount: null,
        minBillAmount: 100_000,
        name: "Giảm giá đơn lớn",
        payableAmount: 45_000,
        promotionId: "promotion-1",
        promotionType: "PERCENT_OFF",
        scope: "Toàn bộ hóa đơn",
        unavailableReason: "Chưa đạt giá trị đơn hàng tối thiểu.",
      },
      {
        discountAmount: 10_000,
        discountValue: 10,
        eligible: false,
        maxDiscountAmount: null,
        minBillAmount: null,
        name: "Ưu đãi hết lượt",
        payableAmount: 45_000,
        promotionId: "promotion-2",
        promotionType: "PERCENT_OFF",
        scope: "Toàn bộ hóa đơn",
        unavailableReason: "Khuyến mãi đã hết lượt sử dụng.",
      },
    ]);
    render(<PaymentRequestPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /Voucher \/ khuyến mãi/ }));

    expect(await screen.findByText("Chưa thể áp dụng")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Giảm giá đơn lớn/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Ưu đãi hết lượt: Hết mã" })).toBeDisabled();
    expect(screen.getByText("Hết mã")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Voucher chưa thể áp dụng" })).not.toHaveClass(
      "overflow-y-auto",
    );
    expect(screen.getByRole("dialog")).toHaveClass("max-h-[calc(100dvh-2rem)]", "flex-col");
  });
});
