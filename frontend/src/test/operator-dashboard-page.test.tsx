import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/(workspace)/dashboard/page";

describe("OperatorDashboardPage", () => {
  it("renders the operator work queues", () => {
    render(<OperatorDashboardPage />);

    expect(screen.getByRole("heading", { name: "Tổng quan" })).toBeInTheDocument();
    expect(screen.getByText("Lượt gọi món hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Bàn đang phục vụ")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cảnh báo bàn chờ lâu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/createdAt.*order cũ nhất/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ngưỡng cảnh báo hiện tại:/)).toHaveTextContent(
      "25 phút",
    );
    expect(screen.getByText("Đã chờ 25 phút")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hoạt động gần đây" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sơ đồ bàn mini" })).toBeInTheDocument();
    expect(screen.getAllByText("Bàn 05").length).toBeGreaterThan(0);
    expect(screen.getByText(/Dữ liệu hiện tại là dữ liệu mẫu/)).toBeInTheDocument();
    expect(screen.queryByText(/tiền mặt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/đợi món quá lâu/i)).not.toBeInTheDocument();
  });
});
