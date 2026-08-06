import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OrderingLayout from "../app/(customer)/(ordering)/layout";
import MenuPage from "../app/(customer)/(ordering)/menu/page";

describe("MenuPage", () => {
  it("renders the mobile-first CAS menu UI", () => {
    render(
      <OrderingLayout>
        <MenuPage />
      </OrderingLayout>,
    );

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
      screen.getByRole("link", { name: "Giỏ hàng có 4 món" }),
    ).toHaveAttribute("href", "/cart");
    expect(
      screen.getByRole("link", { name: /xem món đã chọn/i }),
    ).toHaveTextContent("4 món • 170.000đ");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Tăng số lượng Mỳ cay đặc biệt 7 cấp độ",
      }),
    );
    expect(
      screen.getByRole("dialog", { name: "Mỳ cay đặc biệt 7 cấp độ" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cấp độ cay")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Cấp độ cay" }),
    ).toHaveDisplayValue("Cấp 0");
    fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Chọn tùy chọn cho Trà sữa truyền thống",
      }),
    );
    expect(screen.getByText("Độ ngọt")).toBeInTheDocument();
    expect(screen.getByText("Topping")).toBeInTheDocument();
    expect(screen.queryByText(/món ốc|ốc hấp|ốc xào/i)).not.toBeInTheDocument();
  });
});
