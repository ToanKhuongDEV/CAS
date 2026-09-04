import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartPage from "../app/(customer)/(ordering)/cart/page";
import OrderingLayout from "../app/(customer)/(ordering)/layout";
import { QueryProvider } from "../components/providers/query-provider";
import { loadCustomerCatalog } from "../lib/api/catalog/published-catalog.api";
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

vi.mock("../lib/api/catalog/published-catalog.api", () => ({
  loadCustomerCatalog: vi.fn(),
}));

describe("CartPage", () => {
  beforeEach(() => {
    push.mockClear();
    window.sessionStorage.clear();
    window.sessionStorage.setItem(
      "cas.customerCart",
      JSON.stringify([
        {
          itemName: "Món từ giỏ hàng",
          menuItemId: 10,
          optionValueIds: [21],
          quantity: 2,
        },
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
    vi.mocked(loadCustomerCatalog).mockResolvedValue({
      categories: [],
      items: [
        {
          availabilityStatus: "ACTIVE",
          categoryId: 1,
          description: null,
          displayOrder: 1,
          id: 10,
          imageStorageKey: null,
          imageUrl: "/images/welcome/spicy-noodles.jpg",
          name: "Món từ giỏ hàng",
          optionGroups: [],
          price: 50_000,
          tags: [],
        },
      ],
      optionGroups: [
        {
          displayOrder: 1,
          id: 2,
          maxSelect: 1,
          minSelect: 0,
          name: "Topping",
          selectionType: "SINGLE",
          status: "ACTIVE",
          values: [
            {
              displayOrder: 1,
              extraPrice: 10_000,
              id: 21,
              isDefault: false,
              name: "Phô mai",
              status: "ACTIVE",
            },
          ],
        },
      ],
      tags: [],
    });
  });

  it("hydrates legacy cart data with image, price, and selected options", async () => {
    render(
      <QueryProvider>
        <OrderingLayout>
          <CartPage />
        </OrderingLayout>
      </QueryProvider>,
    );

    expect(screen.getByRole("heading", { name: "Giỏ hàng của bạn" })).toBeInTheDocument();
    expect(screen.getByText("Món từ giỏ hàng")).toBeInTheDocument();
    expect(screen.getByText("×2").parentElement).toHaveTextContent("Món từ giỏ hàng");
    expect(await screen.findByAltText("Món từ giỏ hàng")).toHaveAttribute(
      "src",
      expect.stringContaining("spicy-noodles.jpg"),
    );
    expect(screen.getByRole("textbox", { name: /ghi chú chung/i })).toBeInTheDocument();
    expect(await screen.findByText("+ Phô mai")).toBeInTheDocument();
    expect(screen.getByText("Giá món gốc")).toBeInTheDocument();
    expect(screen.getByText("Tạm tính (2 món)")).toBeInTheDocument();
    expect(screen.getAllByText("120.000đ")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Xóa tất cả" })).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: "Gửi món xuống bếp" });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton.parentElement?.parentElement).toHaveClass("bottom-20", "md:bottom-0");
    expect(screen.queryByText(/đang chuẩn bị/i)).not.toBeInTheDocument();
  });

  it("requires confirmation before clearing the cart", async () => {
    render(
      <QueryProvider>
        <OrderingLayout>
          <CartPage />
        </OrderingLayout>
      </QueryProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Xóa tất cả" }));

    const dialog = screen.getByRole("dialog", { name: "Xóa tất cả món?" });
    expect(
      within(dialog).getByText("Toàn bộ món đang chọn sẽ bị xóa khỏi giỏ hàng."),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Quay lại" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Món từ giỏ hàng")).toBeInTheDocument();
  });

  it("submits an already validated cart without another QR check", async () => {
    window.sessionStorage.setItem("cas.tableQrToken", "qr-ban-05");
    vi.mocked(getCurrentCustomerTableSession).mockRejectedValue(new Error("Session not found"));
    render(
      <QueryProvider>
        <OrderingLayout>
          <CartPage />
        </OrderingLayout>
      </QueryProvider>,
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
      <QueryProvider>
        <OrderingLayout>
          <CartPage />
        </OrderingLayout>
      </QueryProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Gửi món xuống bếp" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/orders"));
  });
});
