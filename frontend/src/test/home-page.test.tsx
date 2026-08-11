import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "../app/(customer)/page";

describe("Home", () => {
  it("renders the CAS welcome experience", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /chào mừng bạn đến cas/i })).toBeInTheDocument();
    expect(screen.getByText("Bàn 05")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bắt đầu gọi món/i })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("heading", { name: "Khám phá thực đơn" })).toBeInTheDocument();
    expect(screen.getByText("Mỳ cay")).toBeInTheDocument();
    expect(screen.getByText("Gà rán")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mỳ cay" })).toHaveAttribute("href", "/menu#my-cay");
    expect(screen.getByRole("link", { name: "Gà rán" })).toHaveAttribute("href", "/menu#ga-ran");
    expect(screen.getByText("Tiệm Ăn Vặt & Mỳ Cay CAS")).toBeInTheDocument();
    expect(screen.queryByText("Thưởng thức Mỳ Cay & Đồ Uống Chuẩn Vị, Gọi Món QR Siêu Tốc!")).not.toBeInTheDocument();
    expect(screen.getByText("123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /123 Đường Nguyễn Văn Cừ/i })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=10.7554,106.6781",
    );
    expect(screen.getByRole("link", { name: "0901 234 567" })).toHaveAttribute("href", "tel:0901234567");
    expect(screen.getByRole("link", { name: "contact@cas-restaurant.vn" })).toHaveAttribute(
      "href",
      "mailto:contact@cas-restaurant.vn",
    );
    expect(screen.getByText("08:00 – 22:30 mỗi ngày")).toBeInTheDocument();
    expect(screen.getByText("© 2026 Bản quyền thuộc về Khuong Xuan Toan - 0394986338")).toBeInTheDocument();
    expect(screen.queryByText(/các loại ốc/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trang chủ" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Thực đơn" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Đơn hàng" })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: "Cài đặt" })).toHaveAttribute("href", "/settings");
    expect(screen.queryByRole("link", { name: "Thanh toán" })).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Chuyển đổi giao diện sáng hoặc tối",
      }),
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });
});
