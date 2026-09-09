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
          pendingCancellationQuantity: 0,
          totalAmount: 55_000,
          options: [],
        },
      ],
    },
  ],
};

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(screen.getByRole("spinbutton", { name: "Số lượng muốn hủy" })).toHaveAttribute(
      "max",
      "2",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tăng số lượng hủy" }));
    expect(screen.getByRole("spinbutton", { name: "Số lượng muốn hủy" })).toHaveValue(2);
    expect(screen.getByRole("button", { name: "Tăng số lượng hủy" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Giảm số lượng hủy" }));
    expect(screen.getByRole("spinbutton", { name: "Số lượng muốn hủy" })).toHaveValue(1);
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
    expect(screen.getByRole("link", { name: "Xem hóa đơn" })).toHaveAttribute("href", "/payment");
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

  it("shows an empty-order message instead of a zero-item summary", async () => {
    vi.mocked(loadCustomerBill).mockResolvedValueOnce({
      ...bill,
      originalAmount: 0,
      orders: [],
      payableAmount: 0,
    });

    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "Chưa có món nào được gọi" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("0 món")).not.toBeInTheDocument();
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

  it("polls the bill to receive changes made from another device", async () => {
    vi.useFakeTimers();
    try {
      render(
        <QueryProvider>
          <ToastProvider>
            <OrdersPage />
          </ToastProvider>
        </QueryProvider>,
      );

      await vi.advanceTimersByTimeAsync(0);
      expect(loadCustomerBill).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(10_000);
      expect(loadCustomerBill).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows pending cancellation status instead of another cancellation action", async () => {
    vi.mocked(loadCustomerBill).mockResolvedValue({
      ...bill,
      orders: [
        {
          ...bill.orders[0],
          items: [{ ...bill.orders[0].items[0], pendingCancellationQuantity: 1 }],
        },
      ],
    });

    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect(await screen.findByText("Chờ xác nhận")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yêu cầu hủy" })).not.toBeInTheDocument();
  });

  it("hides an item after its cancellation has been approved", async () => {
    vi.mocked(loadCustomerBill).mockResolvedValue({
      ...bill,
      orders: [
        {
          ...bill.orders[0],
          items: [{ ...bill.orders[0].items[0], cancelledQuantity: 1 }],
        },
      ],
    });

    render(
      <QueryProvider>
        <ToastProvider>
          <OrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    await waitFor(() => expect(loadCustomerBill).toHaveBeenCalledOnce());
    expect(screen.queryByText("Mỳ cay đặc biệt 7 cấp độ")).not.toBeInTheDocument();
  });
});
