import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { CustomerOrderVoucherSummary } from "../components/customer/customer-order-voucher-summary";
import {
  loadCustomerPromotions,
  loadOperatorPromotions,
  selectCustomerPromotion,
} from "../lib/api/promotion/promotion.api";

vi.mock("../lib/api/payment/payment.api", () => ({
  loadCustomerBillAdjustments: vi.fn().mockResolvedValue([]),
}));
vi.mock("../lib/api/promotion/promotion.api", () => ({
  loadCustomerPromotions: vi.fn(),
  loadOperatorPromotions: vi.fn(),
  selectCustomerPromotion: vi.fn(),
  selectOperatorPromotion: vi.fn(),
  clearCustomerPromotion: vi.fn(),
  clearOperatorPromotion: vi.fn(),
  loadCustomerEligiblePromotions: vi.fn(),
  loadOperatorEligiblePromotions: vi.fn(),
}));

const voucher = {
  promotionId: "p1",
  name: "Ưu đãi",
  promotionType: "PERCENT_OFF" as const,
  discountValue: 10,
  maxDiscountAmount: null,
  minBillAmount: null,
  scope: "Hóa đơn",
  discountAmount: 5000,
  payableAmount: 45000,
  eligible: true,
  unavailableReason: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadCustomerPromotions).mockResolvedValue([]);
  vi.mocked(loadOperatorPromotions).mockResolvedValue([]);
});

it("refreshes customer promotions without losing the selected voucher", async () => {
  vi.mocked(loadCustomerPromotions).mockResolvedValueOnce([voucher]).mockResolvedValue([]);
  vi.mocked(selectCustomerPromotion).mockResolvedValue({ ...voucher, code: null, codeId: null });
  render(<CustomerOrderVoucherSummary originalAmount={50000} />);
  fireEvent.click(screen.getByRole("button", { name: /Voucher \/ khuyến mãi/ }));
  expect(screen.getByRole("dialog").parentElement?.parentElement).toBe(document.body);
  expect(screen.getByRole("dialog")).toHaveClass("w-full", "min-w-0", "max-w-md");
  fireEvent.click(await screen.findByRole("button", { name: /Ưu đãi/ }));
  await screen.findByText("Ưu đãi");
  fireEvent.click(screen.getByRole("button", { name: /Voucher \/ khuyến mãi/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Làm mới" }));
  await waitFor(() => expect(loadCustomerPromotions).toHaveBeenCalledTimes(2));
  expect(await screen.findByText("Bỏ voucher đang chọn")).toBeInTheDocument();
  expect(screen.getByText("-5.000 ₫")).toBeInTheDocument();
});

it("refreshes the operator session list and displays failures without erasing it", async () => {
  vi.mocked(loadOperatorPromotions)
    .mockResolvedValueOnce([voucher])
    .mockRejectedValueOnce(new Error("offline"));
  render(<CustomerOrderVoucherSummary originalAmount={50000} operatorSessionId="session-1" />);
  fireEvent.click(screen.getByRole("button", { name: /Voucher \/ khuyến mãi/ }));
  expect(await screen.findByText("Ưu đãi")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Làm mới" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Không thể tải danh sách khuyến mãi");
  expect(screen.getByText("Ưu đãi")).toBeInTheDocument();
  expect(loadOperatorPromotions).toHaveBeenLastCalledWith("session-1");
});
