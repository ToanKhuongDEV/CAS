import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CartPage from "../app/(customer)/(ordering)/cart/page";
import OrderingLayout from "../app/(customer)/(ordering)/layout";

describe("CartPage", () => {
  it("renders the selected items and shared order note", () => {
    render(
      <OrderingLayout>
        <CartPage />
      </OrderingLayout>,
    );

    expect(screen.getByRole("heading", { name: "Giỏ hàng của bạn" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mỳ cay đặc biệt 7 cấp độ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gà rán giòn rụm" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Trà sữa Trân châu Đường đen",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /ghi chú chung/i })).toBeInTheDocument();
    expect(screen.getByText("Tạm tính (4 món)")).toBeInTheDocument();
    expect(screen.getByText("170.000đ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chọn thêm món" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Gửi món xuống bếp" })).toHaveAttribute(
      "href",
      "/orders",
    );
    expect(screen.queryByText(/đang chuẩn bị/i)).not.toBeInTheDocument();
  });
});
