import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MenuPage from "../app/menu/page";

describe("MenuPage", () => {
  it("renders the mobile-first CAS menu UI", () => {
    render(<MenuPage />);

    expect(
      screen.getByRole("searchbox", { name: "Tìm kiếm món ăn" }),
    ).toHaveAttribute("placeholder", "Tìm món ngon tại Cas...");
    expect(
      screen.getByRole("heading", {
        name: "Combo Mỳ Cay & Trà Sữa cho ngày mới",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mỳ cay đặc biệt 7 cấp độ" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Trà sữa Trân châu Đường đen",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Gà rán giòn rụm" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Mỳ cay" }),
    ).toHaveAttribute("href", "#my-cay");
    expect(
      screen.getByRole("link", { name: "Ăn vặt" }),
    ).toHaveAttribute("href", "#an-vat");
    expect(
      screen.getByRole("heading", { name: "Mỳ cay" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nước giải khát" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ăn vặt thập cẩm" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Giỏ hàng có 2 món" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /xem món đã chọn/i }),
    ).toHaveTextContent("2 món • 100.000đ");
    expect(screen.queryByText(/món ốc|ốc hấp|ốc xào/i)).not.toBeInTheDocument();
  });
});
