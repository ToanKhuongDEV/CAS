import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/(workspace)/dashboard/page";
import { loadOperatorDashboardSummary } from "../lib/api/operation/operator-dashboard.api";
import { createOperationalIncident } from "../lib/api/operation/operational-incidents.api";
import { loadLongWaitTables } from "../lib/api/ordering/preparation.api";
import { loadOperatorBill, loadOperatorTables } from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/ordering/preparation.api", () => ({ loadLongWaitTables: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadOperatorBill: vi.fn(),
  loadOperatorTables: vi.fn(),
}));
vi.mock("../lib/api/operation/operational-incidents.api", () => ({
  createOperationalIncident: vi.fn(),
}));
vi.mock("../lib/api/operation/operator-dashboard.api", () => ({
  loadOperatorDashboardSummary: vi.fn(),
}));

describe("OperatorDashboardPage", () => {
  beforeEach(() => {
    vi.mocked(loadLongWaitTables).mockResolvedValue([
      {
        tableId: 5,
        tableCode: 5,
        orderId: "order-1",
        oldestPendingOrderCreatedAt: "2026-08-30T19:05:00",
        waitingMinutes: 37,
        thresholdMinutes: 25,
      },
    ]);
    vi.mocked(loadOperatorTables).mockResolvedValue([
      {
        tableId: 5,
        tableCode: 5,
        sessions: [{ customerName: "Khách bàn 5", sessionId: "session-5", status: "OPEN" }],
      },
      { tableId: 2, tableCode: 2, sessions: [] },
    ]);
    vi.mocked(loadOperatorBill).mockResolvedValue({
      tableCode: 5,
      sessionStatus: "OPEN",
      originalAmount: 60000,
      payableAmount: 60000,
      orders: [
        {
          orderId: "order-1",
          orderNumber: "1",
          originalAmount: 60000,
          payableAmount: 60000,
          note: null,
          createdAt: "2026-09-15T09:00:00",
          items: [
            {
              orderItemId: "item-1",
              itemName: "Cà phê sữa",
              unitPrice: 30000,
              optionsAmount: 0,
              quantity: 2,
              preparedQuantity: 0,
              cancelledQuantity: 0,
              pendingCancellationQuantity: 0,
              totalAmount: 60000,
              options: [],
            },
          ],
        },
      ],
    });
    vi.mocked(createOperationalIncident).mockResolvedValue({
      publicId: "incident-1",
      reporterName: "Nhân viên ca trực",
      description: "Bếp hết gia vị sốt cay đột xuất",
      createdAt: "2026-09-11T10:00:00",
    });
    vi.mocked(loadOperatorDashboardSummary).mockResolvedValue({
      activeTableCount: 12,
      ordersToday: 8,
      pendingPaymentCount: 3,
      totalTableCount: 20,
    });
  });

  it("renders the operator work queues", async () => {
    render(<OperatorDashboardPage />);

    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeInTheDocument();
    expect(await screen.findByText("Lượt gọi món hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Bàn đang phục vụ").parentElement).toHaveTextContent("12/20");
    expect(screen.getByRole("heading", { name: "Cảnh báo bàn chờ lâu" })).toBeInTheDocument();
    expect(screen.getByText(/Thời gian được tính từ order cũ nhất/i)).toBeInTheDocument();
    expect(await screen.findByText("Đã chờ 37 phút")).toBeInTheDocument();
    expect(screen.getByText(/Ngưỡng cảnh báo hiện tại:/)).toHaveTextContent("25 phút");
    fireEvent.click(await screen.findByRole("button", { name: "Mở thao tác cho bàn 5" }));
    const dialog = await screen.findByRole("dialog", { name: "Món đã gọi" });
    expect(within(dialog).getByText("2× Cà phê sữa")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Gọi thêm món hộ/i })).toHaveAttribute(
      "href",
      "/operator/orders/new?table=5",
    );
    expect(within(dialog).getByRole("link", { name: /Kiểm soát thanh toán/i })).toHaveAttribute(
      "href",
      "/operator/payments",
    );
  });

  it("sends operational incidents to the API from the dashboard", async () => {
    render(<OperatorDashboardPage />);
    fireEvent.click(screen.getByRole("button", { name: "Báo cáo sự cố" }));
    const dialog = screen.getByRole("dialog", { name: "Báo cáo sự cố phát sinh" });
    fireEvent.change(screen.getByPlaceholderText("Nhập nội dung sự cố phát sinh trong ca..."), {
      target: { value: "Bếp hết gia vị sốt cay đột xuất" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Gửi báo cáo" }));
    expect(await screen.findByText("Đã ghi nhận báo cáo sự cố thành công.")).toBeInTheDocument();
    expect(createOperationalIncident).toHaveBeenCalledWith({
      reporterName: "Nhân viên ca trực",
      description: "Bếp hết gia vị sốt cay đột xuất",
    });
  });

  it("shows the payment confirmation action for a table waiting for payment", async () => {
    vi.mocked(loadOperatorTables).mockResolvedValue([
      {
        tableId: 5,
        tableCode: 5,
        sessions: [
          { customerName: "Khách bàn 5", sessionId: "session-5", status: "PAYMENT_PENDING" },
        ],
      },
    ]);
    render(<OperatorDashboardPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Mở thao tác cho bàn 5" }));

    const dialog = await screen.findByRole("dialog", { name: "Món đã gọi" });
    expect(within(dialog).getByRole("link", { name: /Xác nhận thanh toán/i })).toHaveAttribute(
      "href",
      "/operator/payments",
    );
    expect(
      within(dialog).queryByRole("link", { name: /Gọi thêm món hộ/i }),
    ).not.toBeInTheDocument();
  });
});
