import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/(workspace)/dashboard/page";
import { loadOperatorDashboardSummary } from "../lib/api/operation/operator-dashboard.api";
import { createOperationalIncident } from "../lib/api/operation/operational-incidents.api";
import { loadLongWaitTables } from "../lib/api/ordering/preparation.api";
import { loadOperatorTables } from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/ordering/preparation.api", () => ({ loadLongWaitTables: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({ loadOperatorTables: vi.fn() }));
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
      { tableId: 5, tableCode: 5, sessionStatus: "OPEN", sessionPublicId: "session-5" },
      { tableId: 2, tableCode: 2, sessionStatus: null, sessionPublicId: null },
    ]);
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
    expect(await screen.findByRole("link", { name: "Mở thao tác cho bàn 5" })).toHaveAttribute(
      "href",
      "/operator/orders/new?table=5",
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
});
