import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperatorOrderCreationView } from "../components/operator/order-creation/operator-order-creation-view";
import { loadOperatorCatalog } from "../lib/api/catalog/published-catalog.api";
import {
  createOperatorOrder,
  loadOperatorTables,
  openOperatorTableSession,
} from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/catalog/published-catalog.api", () => ({ loadOperatorCatalog: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  createOperatorOrder: vi.fn(),
  loadOperatorTables: vi.fn(),
  openOperatorTableSession: vi.fn(),
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
      { sessionPublicId: "session-5", sessionStatus: "OPEN", tableCode: 5, tableId: 5 },
      { sessionPublicId: null, sessionStatus: null, tableCode: 2, tableId: 2 },
      { sessionPublicId: "session-1", sessionStatus: "OPEN", tableCode: 1, tableId: 1 },
    ]);
    vi.mocked(openOperatorTableSession).mockResolvedValue({
      sessionId: "session-2",
      status: "OPEN",
      tableCode: 2,
    });
    vi.mocked(createOperatorOrder).mockResolvedValue({ orderId: "order-1", payableAmount: 35_000 });
  });

  it("renders table context, allows selecting items and adding options to cart", async () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

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

  it("allows selecting a different table to serve via table selector modal", async () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

    await screen.findByText("Gà rán giòn rụm");

    const switchTableBtns = screen.getAllByRole("button", {
      name: /chọn bàn khác/i,
    });
    fireEvent.click(switchTableBtns[0]);

    // Modal dialog
    expect(screen.getByRole("heading", { name: "Chọn bàn phục vụ" })).toBeInTheDocument();

    const table01Option = screen.getByRole("button", { name: /Bàn 01/i });
    fireEvent.click(table01Option);

    // Context should now show Bàn 01
    expect(screen.getAllByText(/Bàn 01/i).length).toBeGreaterThan(0);
  });

  it("creates an order with the active table session and selected menu item", async () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

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
    expect(await screen.findByText("order-1")).toBeInTheDocument();
  });

  it("asks for confirmation before opening an empty table session", async () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

    await screen.findByText("Gà rán giòn rụm");

    fireEvent.click(screen.getAllByRole("button", { name: /chọn bàn khác/i })[0]);
    const tableSelectionDialog = screen.getByRole("dialog");
    fireEvent.click(within(tableSelectionDialog).getByRole("button", { name: /Bàn 02/i }));

    expect(screen.getByRole("heading", { name: "Tạo phiên mới cho Bàn 02?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(screen.getByRole("heading", { name: "Thông tin khách tại Bàn 02" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /tên của bạn/i }), {
      target: { value: "Nguyễn Văn A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Tạo phiên bàn và chọn món" }));

    expect(screen.getAllByText(/Bàn 02/i).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Bàn 02.*Nguyễn Văn A/)).toBeInTheDocument();
  });
});
