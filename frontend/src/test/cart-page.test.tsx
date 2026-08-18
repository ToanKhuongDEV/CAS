import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartPage from "../app/(customer)/(ordering)/cart/page";
import OrderingLayout from "../app/(customer)/(ordering)/layout";
import { resolveCustomerTableSession } from "../lib/customer/table-session";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../lib/customer/table-session", () => ({
  resolveCustomerTableSession: vi.fn(),
}));

describe("CartPage", () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();
    vi.mocked(resolveCustomerTableSession).mockReset();
  });

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
    expect(screen.getByRole("button", { name: "Gửi món xuống bếp" })).toBeInTheDocument();
    expect(screen.queryByText(/đang chuẩn bị/i)).not.toBeInTheDocument();
  });

  it("returns to the customer information page before submitting an order", async () => {
    window.sessionStorage.setItem("cas.tableQrToken", "qr-ban-05");
    vi.mocked(resolveCustomerTableSession).mockResolvedValue({
      customerInformationRequired: true,
      sessionStatus: "CUSTOMER_INFORMATION_REQUIRED",
      tableCode: 5,
    });
    render(
      <OrderingLayout>
        <CartPage />
      </OrderingLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Gửi món xuống bếp" }));

    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith("/table/qr-ban-05?returnTo=%2Fcart"),
    );
  });

  it("submits the order when the QR already resolves to an open table session", async () => {
    window.sessionStorage.setItem("cas.tableQrToken", "qr-ban-05");
    vi.mocked(resolveCustomerTableSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 5,
    });
    render(
      <OrderingLayout>
        <CartPage />
      </OrderingLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Gửi món xuống bếp" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/orders"));
  });
});
