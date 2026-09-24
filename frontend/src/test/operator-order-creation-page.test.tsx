import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperatorOrderCreationView } from "../components/operator/order-creation/operator-order-creation-view";
import { ToastProvider } from "../components/ui/toast-provider";
import { loadOperatorCatalog } from "../lib/api/catalog/published-catalog.api";
import {
  cancelOperatorSalesSession,
  createOperatorOrder,
  loadOperatorTables,
  openOperatorSalesSession,
} from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/catalog/published-catalog.api", () => ({ loadOperatorCatalog: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  cancelOperatorSalesSession: vi.fn(),
  createOperatorOrder: vi.fn(),
  loadOperatorTables: vi.fn(),
  openOperatorSalesSession: vi.fn(),
}));

describe("OperatorOrderCreationView", () => {
  beforeEach(() => {
    vi.mocked(loadOperatorCatalog).mockResolvedValue({
      categories: [
        {
          categoryType: "REGULAR",
          description: null,
          displayOrder: 1,
          id: 1,
          name: "Mỳ cay",
          status: "ACTIVE",
        },
        {
          categoryType: "REGULAR",
          description: null,
          displayOrder: 2,
          id: 2,
          name: "Ăn vặt",
          status: "ACTIVE",
        },
      ],
      items: [
        {
          availabilityStatus: "ACTIVE",
          categoryId: 1,
          description: "Món cay",
          displayOrder: 1,
          id: 10,
          imageStorageKey: null,
          imageUrl: null,
          name: "Mỳ cay đặc biệt 7 cấp độ",
          optionGroups: [{ displayOrder: 1, id: 1, name: "Cấp độ cay" }],
          price: 55_000,
          tags: [],
        },
        {
          availabilityStatus: "ACTIVE",
          categoryId: 2,
          description: "Món ăn vặt",
          displayOrder: 1,
          id: 11,
          imageStorageKey: null,
          imageUrl: null,
          name: "Gà rán giòn rụm",
          optionGroups: [],
          price: 35_000,
          tags: [],
        },
      ],
      optionGroups: [
        {
          displayOrder: 1,
          id: 1,
          maxSelect: 1,
          minSelect: 1,
          name: "Cấp độ cay",
          selectionType: "SINGLE",
          status: "ACTIVE",
          values: [
            {
              displayOrder: 1,
              extraPrice: 10_000,
              id: 101,
              isDefault: true,
              name: "Cấp 3",
              status: "ACTIVE",
            },
          ],
        },
      ],
      tags: [],
    });
    vi.mocked(loadOperatorTables).mockResolvedValue([
      {
        sessions: [
          { customerName: "Khách bàn 5", sessionId: "session-5", status: "OPEN" },
          { customerName: "Customer Two", sessionId: "session-5b", status: "OPEN" },
        ],
        tableCode: 5,
        tableId: 5,
      },
      { sessions: [], tableCode: 2, tableId: 2 },
      {
        sessions: [{ customerName: "Khách bàn 1", sessionId: "session-1", status: "OPEN" }],
        tableCode: 1,
        tableId: 1,
      },
    ]);
    vi.mocked(openOperatorSalesSession).mockResolvedValue({
      sessionId: "session-2",
      sessionType: "DINE_IN",
      status: "OPEN",
      tableCode: 2,
    });
    vi.mocked(createOperatorOrder).mockResolvedValue({ orderId: "order-1", payableAmount: 35_000 });
    vi.mocked(cancelOperatorSalesSession).mockResolvedValue(undefined);
  });

  const renderOrderCreationView = () =>
    render(
      <ToastProvider>
        <OperatorOrderCreationView defaultTableId="table-05" />
      </ToastProvider>,
    );

  it("renders table context, allows selecting items and adding options to cart", async () => {
    renderOrderCreationView();

    await screen.findByText("Gà rán giòn rụm");

    expect(screen.getByRole("heading", { name: "Tạo order hộ tại bàn" })).toBeInTheDocument();

    // Table context
    expect(screen.getAllByText(/Bàn 05/i).length).toBeGreaterThan(0);

    // Search bar
    expect(screen.getByRole("textbox", { name: "Tìm kiếm món ăn" })).toHaveAttribute(
      "placeholder",
      "Tìm kiếm món trong thực đơn...",
    );

    // Category navigation links from CategoryNavigation
    expect(screen.getByRole("link", { name: "Mỳ cay" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ăn vặt" })).toBeInTheDocument();

    // Menu item without options: Gà rán giòn rụm
    const chickenCard = screen.getByText("Gà rán giòn rụm").closest("article");
    expect(chickenCard).not.toBeNull();
    const addChickenBtn = within(chickenCard as HTMLElement).getByRole("button", {
      name: /chọn tùy chọn cho gà rán giòn rụm/i,
    });
    fireEvent.click(addChickenBtn);

    // Verify item added to cart
    expect(screen.getAllByText("Gà rán giòn rụm").length).toBeGreaterThan(1);
    expect(screen.getAllByText(/35\.000đ/i).length).toBeGreaterThan(0);

    // Menu item with options: Mỳ cay đặc biệt 7 cấp độ
    const noodleCard = screen.getByText("Mỳ cay đặc biệt 7 cấp độ").closest("article");
    expect(noodleCard).not.toBeNull();
    const addNoodleBtn = within(noodleCard as HTMLElement).getByRole("button", {
      name: /chọn tùy chọn cho mỳ cay đặc biệt 7 cấp độ/i,
    });
    fireEvent.click(addNoodleBtn);

    // Option dialog should be open
    expect(screen.getByRole("dialog", { name: /Mỳ cay đặc biệt 7 cấp độ/i })).toBeInTheDocument();
    expect(screen.getByText("+10.000đ")).toBeInTheDocument();

    // Select spice level
    fireEvent.click(screen.getByRole("radio", { name: /Cấp 3/i }));

    const confirmOptionBtn = screen.getByRole("button", {
      name: /thêm vào giỏ/i,
    });
    fireEvent.click(confirmOptionBtn);

    // Check cart now has 2 items
    expect(screen.getByText("Món đã chọn")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("+ Cấp 3")).toBeInTheDocument();

    // Enter note
    const noteInput = screen.getByPlaceholderText(/Ví dụ: vui lòng phục vụ món cay sau/i);
    fireEvent.change(noteInput, {
      target: { value: "Mang kèm thêm ớt tươi và khăn giấy" },
    });
    expect(noteInput).toHaveValue("Mang kèm thêm ớt tươi và khăn giấy");
  });

  it("opens item details from the item name and adds the item with its options", async () => {
    renderOrderCreationView();

    const itemName = "Mỳ cay đặc biệt 7 cấp độ";
    await screen.findByText(itemName);

    fireEvent.click(screen.getByRole("button", { name: itemName }));

    const detailDialog = screen.getByRole("dialog", { name: itemName });
    expect(detailDialog).toBeInTheDocument();
    expect(within(detailDialog).getByText("Chi tiết món")).toBeInTheDocument();
    expect(within(detailDialog).getByText("Món cay")).toBeInTheDocument();

    fireEvent.click(
      within(detailDialog).getByRole("button", { name: /chọn tùy chọn cho mỳ cay/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /thêm vào giỏ/i }));

    expect(screen.getByText("Món đã chọn")).toBeInTheDocument();
    expect(screen.getAllByText(itemName).length).toBeGreaterThan(1);
  });

  it("creates an order with the active sales session and selected menu item", async () => {
    renderOrderCreationView();

    await screen.findByText("Gà rán giòn rụm");

    const chickenCard = screen.getByText("Gà rán giòn rụm").closest("article");
    expect(chickenCard).not.toBeNull();
    fireEvent.click(
      within(chickenCard as HTMLElement).getByRole("button", {
        name: /chọn tùy chọn cho gà rán giòn rụm/i,
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Gửi món xuống bếp/i }));

    await vi.waitFor(() =>
      expect(createOperatorOrder).toHaveBeenCalledWith("session-5", {
        items: [{ menuItemId: 11, optionValueIds: [], quantity: 1 }],
        note: null,
      }),
    );
    expect(await screen.findByText("Đã gửi món xuống bếp.")).toBeInTheDocument();
    expect(await screen.findByText("order-1")).toBeInTheDocument();
  });

  it("cancels the selected sales session after confirmation", async () => {
    renderOrderCreationView();

    await screen.findByText("Gà rán giòn rụm");
    fireEvent.click(screen.getByRole("button", { name: "Hủy phiên bàn" }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy phiên" }));

    await vi.waitFor(() => expect(cancelOperatorSalesSession).toHaveBeenCalledWith("session-5"));
    expect(await screen.findByText("Đã hủy phiên bàn.")).toBeInTheDocument();
  });
});
