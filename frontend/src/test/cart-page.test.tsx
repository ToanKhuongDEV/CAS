import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartPage from "../app/(customer)/(ordering)/cart/page";
import OrderingLayout from "../app/(customer)/(ordering)/layout";
import { createCustomerOrder } from "../lib/api/ordering/ordering.api";
import { getCurrentCustomerTableSession } from "../lib/customer/table-session";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../lib/customer/table-session", () => ({
  getCurrentCustomerTableSession: vi.fn(),
}));

vi.mock("../lib/api/ordering/ordering.api", () => ({
  createCustomerOrder: vi.fn(),
}));

describe("CartPage", () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();
    window.sessionStorage.setItem(
      "cas.customerCart",
      JSON.stringify([
        { itemName: "Món từ giỏ hàng", menuItemId: 10, optionValueIds: [], quantity: 2 },
      ]),
    );
    vi.mocked(getCurrentCustomerTableSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 5,
    });
    vi.mocked(createCustomerOrder).mockResolvedValue({
      orderId: "order-1",
      payableAmount: 100_000,
    });
  });

  it("renders the selected items and shared order note", () => {
    render(
      <OrderingLayout>
        <CartPage />
      </OrderingLayout>,
    );

    expect(screen.getByRole("heading", { name: "Giỏ hàng của bạn" })).toBeInTheDocument();
    expect(screen.getByText("Món từ giỏ hàng")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /ghi chú chung/i })).toBeInTheDocument();
    expect(screen.getByText("2 món")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi món xuống bếp" })).toBeInTheDocument();
    expect(screen.queryByText(/đang chuẩn bị/i)).not.toBeInTheDocument();
  });

  it("submits an already validated cart without another QR check", async () => {
    window.sessionStorage.setItem("cas.tableQrToken", "qr-ban-05");
    vi.mocked(getCurrentCustomerTableSession).mockRejectedValue(new Error("Session not found"));
    render(
      <OrderingLayout>
        <CartPage />
      </OrderingLayout>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Gửi món xuống bếp" }));

    await vi.waitFor(() => expect(createCustomerOrder).toHaveBeenCalledTimes(1));
    expect(push).toHaveBeenCalledWith("/orders");
  });

  it("submits the order when this device has an active table session", async () => {
    window.sessionStorage.setItem("cas.tableQrToken", "qr-ban-05");
    vi.mocked(getCurrentCustomerTableSession).mockResolvedValue({
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
