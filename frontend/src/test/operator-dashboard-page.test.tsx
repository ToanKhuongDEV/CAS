import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/(workspace)/dashboard/page";
import { loadLongWaitTables } from "../lib/api/ordering/preparation.api";

vi.mock("../lib/api/ordering/preparation.api", () => ({ loadLongWaitTables: vi.fn() }));

describe("OperatorDashboardPage", () => {
  beforeEach(() =>
    vi.mocked(loadLongWaitTables).mockResolvedValue([
      {
        tableId: 5,
        tableCode: 5,
        orderId: "order-1",
        oldestPendingOrderCreatedAt: "2026-08-30T19:05:00",
        waitingMinutes: 37,
        thresholdMinutes: 25,
      },
    ]),
  );

  it("renders the operator work queues", async () => {
    render(<OperatorDashboardPage />);

    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.getByText("Lượt gọi món hôm nay")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cảnh báo bàn chờ lâu" })).toBeInTheDocument();
    expect(screen.getByText(/Thời gian được tính từ order cũ nhất/i)).toBeInTheDocument();
    expect(await screen.findByText("Đã chờ 37 phút")).toBeInTheDocument();
    expect(screen.getByText(/Ngưỡng cảnh báo hiện tại:/)).toHaveTextContent("25 phút");
    expect(screen.getByRole("heading", { name: "Khiếu nại" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mở đơn của Bàn 05" })).toHaveAttribute(
      "href",
      "/operator/orders/ORD-0821",
    );

    const complaintButton = screen.getByRole("button", { name: "Xem khiếu nại của Bàn 12" });
    fireEvent.click(complaintButton);
    const complaintDialog = screen.getByRole("dialog", { name: "Chi tiết khiếu nại" });
    expect(
      within(complaintDialog).getByText(/muốn nhân viên kiểm tra lại toàn bộ món trên bàn/i),
    ).toBeInTheDocument();
  });

  it("allows reporting operational incidents from the dashboard", () => {
    render(<OperatorDashboardPage />);
    fireEvent.click(screen.getByRole("button", { name: "Báo cáo sự cố" }));
    const dialog = screen.getByRole("dialog", { name: "Báo cáo sự cố phát sinh" });
    fireEvent.change(screen.getByPlaceholderText("Nhập nội dung sự cố phát sinh trong ca..."), {
      target: { value: "Bếp hết gia vị sốt cay đột xuất" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Gửi báo cáo" }));
    expect(screen.getByText("Đã ghi nhận báo cáo sự cố thành công.")).toBeInTheDocument();
  });
});
