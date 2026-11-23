import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddToCartOptionDialog } from "../components/customer/add-to-cart-option-dialog";

describe("AddToCartOptionDialog", () => {
  it("opens for an item without options and adds the selected quantity", async () => {
    const onAddToCart = vi.fn();
    render(<AddToCartOptionDialog basePrice={10000} itemName="Phở" onAddToCart={onAddToCart} />);

    fireEvent.click(screen.getByRole("button", { name: "Chọn tùy chọn cho Phở" }));
    const increase = await screen.findByRole("button", { name: "Tăng số lượng Phở" });
    fireEvent.click(screen.getByRole("button", { name: "Giảm số lượng Phở" }));
    fireEvent.click(increase);
    fireEvent.click(screen.getByRole("button", { name: /Thêm vào giỏ/ }));

    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ quantity: 2 }));
  });
});
