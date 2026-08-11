import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import OrdersPage from "../app/(customer)/orders/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("OrdersPage", () => {
  it("lets a customer submit a cancellation request in the UI", () => {
    render(<OrdersPage />);

    expect(screen.getByRole("heading", { name: "Quán đã nhận món của bạn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Yêu cầu thanh toán" })).toHaveAttribute(
      "href",
      "/payment",
    );
    expect(screen.getByRole("link", { name: "Mỳ cay đặc biệt 7 cấp độ" })).toHaveAttribute(
      "href",
      "/menu",
    );
    expect(screen.getByText("Ghi chú chung")).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng phục vụ món cay sau/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Thanh toán" })).not.toBeInTheDocument();
    const voucherSelect = screen.getByRole("combobox", { name: "Voucher / khuyến mãi" });
    fireEvent.change(voucherSelect, { target: { value: "summer-10" } });
    expect(screen.getByText("Giá gốc")).toBeInTheDocument();
    expect(screen.getByText("Giảm giá (SUMMER10)")).toBeInTheDocument();
    expect(screen.getByText("Giá trị cần thanh toán")).toBeInTheDocument();
    expect(screen.getByText("153.000đ")).toBeInTheDocument();
    expect(screen.queryByText(/CAS đã ghi nhận lần gọi món này/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Yêu cầu hủy" })[0]);

    expect(screen.getByRole("dialog", { name: "Mỳ cay đặc biệt 7 cấp độ" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Số lượng muốn hủy" })).toHaveValue("1");

    fireEvent.change(screen.getByRole("textbox", { name: "Lý do (không bắt buộc)" }), {
      target: { value: "Gọi nhầm món" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }));

    expect(screen.getByRole("button", { name: "Chờ xác nhận" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Yêu cầu hủy" })).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Chờ xác nhận" }));

    expect(screen.getByText("Cập nhật yêu cầu hủy")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Lý do (không bắt buộc)" })).toHaveValue(
      "Gọi nhầm món",
    );
    expect(screen.getByRole("button", { name: "Cập nhật yêu cầu" })).toBeInTheDocument();
  });
});
