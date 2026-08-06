import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorDashboardPage from "../app/(operator)/operator/page";

describe("OperatorDashboardPage", () => {
  it("renders the operator work queues", () => {
    render(<OperatorDashboardPage />);

    expect(screen.getByRole("heading", { name: "Bảng điều khiển" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Thanh toán chờ xác nhận" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Yêu cầu hủy món" })).toBeInTheDocument();
    expect(screen.getByText("Bàn 05")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Điều hướng nhân viên" })).toHaveLength(2);
    expect(screen.getByText(/Các số liệu trên là dữ liệu mẫu/)).toBeInTheDocument();
  });
});
