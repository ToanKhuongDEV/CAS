import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrdersPage from "../app/(customer)/orders/page";
import { QueryProvider } from "../components/providers/query-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { loadCustomerCatalog } from "../lib/api/catalog/published-catalog.api";
import { loadCustomerBill, requestCustomerCancellation } from "../lib/api/ordering/ordering.api";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadCustomerBill: vi.fn(),
  requestCustomerCancellation: vi.fn(),
}));
vi.mock("../lib/api/catalog/published-catalog.api", () => ({ loadCustomerCatalog: vi.fn() }));
vi.mock("../components/customer/customer-header", () => ({
  CustomerHeader: () => <div data-testid="customer-header" />,
}));
vi.mock("../components/customer/customer-bottom-navigation", () => ({
  CustomerBottomNavigation: () => <div data-testid="customer-bottom-navigation" />,
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
    replace.mockClear();
    vi.mocked(loadCustomerBill).mockResolvedValue(bill);
    vi.mocked(requestCustomerCancellation).mockResolvedValue(undefined);
    vi.mocked(loadCustomerCatalog).mockResolvedValue({
      categories: [],
      items: [
        {
          availabilityStatus: "ACTIVE",
          categoryId: 1,
          description: null,
          displayOrder: 1,
          id: 10,
          imageStorageKey: null,
          imageUrl: "/images/welcome/spicy-noodles.jpg",
          name: "Mỳ cay đặc biệt 7 cấp độ",
          optionGroups: [],
          price: 55_000,
          tags: [],
        },
      ],
      optionGroups: [],
      tags: [],
    });
  });

  it("lets a customer submit a cancellation request in the UI", async () => {
    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Đơn hàng · Bàn 05" })).toBeInTheDocument();
    expect(await screen.findByAltText("Mỳ cay đặc biệt 7 cấp độ")).toHaveAttribute(
      "src",
      expect.stringContaining("spicy-noodles.jpg"),
    );
    expect(screen.queryByText("#ORD-001")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Yêu cầu hủy" }));
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
    expect(screen.getByTestId("customer-header")).toBeInTheDocument();
    expect(screen.getByTestId("customer-bottom-navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gọi thêm món" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Yêu cầu thanh toán" })).toHaveAttribute(
      "href",
      "/payment",
    );
  });

  it("shows a load error without redirecting the customer to scan the QR again", async () => {
    vi.mocked(loadCustomerBill).mockRejectedValueOnce(new Error("Không thể tải đơn hàng."));

    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText("Không thể tải đơn hàng.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("guides customers without an active table session to QR scanning", async () => {
    vi.mocked(loadCustomerBill).mockRejectedValueOnce(
      new Error("Vui lòng quét mã QR của bàn để tiếp tục."),
    );

    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "Xem đơn hàng theo bàn" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quét mã QR của bàn" })).toHaveAttribute(
      "href",
      "/scan",
    );
    expect(screen.queryByText("Vui lòng quét mã QR của bàn để tiếp tục.")).not.toBeInTheDocument();
  });
});
