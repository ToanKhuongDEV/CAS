import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperatorOrderCreationView } from "../components/operator/order-creation/operator-order-creation-view";

describe("OperatorOrderCreationView", () => {
  it("renders table context, allows selecting items and adding options to cart", () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

    expect(
      screen.getByRole("heading", { name: "Tạo order hộ tại bàn" }),
    ).toBeInTheDocument();

    // Table context
    expect(screen.getAllByText(/Bàn 05/i).length).toBeGreaterThan(0);

    // Search bar
    expect(
      screen.getByRole("textbox", { name: "Tìm kiếm món ăn" }),
    ).toHaveAttribute("placeholder", "Tìm kiếm món trong thực đơn...");

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
    const noodleCard = screen
      .getByText("Mỳ cay đặc biệt 7 cấp độ")
      .closest("article");
    expect(noodleCard).not.toBeNull();
    const addNoodleBtn = within(noodleCard as HTMLElement).getByRole("button", {
      name: /chọn tùy chọn cho mỳ cay đặc biệt 7 cấp độ/i,
    });
    fireEvent.click(addNoodleBtn);

    // Option dialog should be open
    expect(
      screen.getByRole("dialog", { name: /Mỳ cay đặc biệt 7 cấp độ/i }),
    ).toBeInTheDocument();

    // Select spice level
    const spiceSelect = screen.getByRole("combobox", { name: "Cấp độ cay" });
    fireEvent.change(spiceSelect, { target: { value: "level-3" } });

    const confirmOptionBtn = screen.getByRole("button", {
      name: /thêm vào giỏ/i,
    });
    fireEvent.click(confirmOptionBtn);

    // Check cart now has 2 items
    expect(screen.getByText("Món đã chọn")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Cấp 3")).toBeInTheDocument();

    // Enter note
    const noteInput = screen.getByPlaceholderText(
      /Ví dụ: vui lòng phục vụ món cay sau/i,
    );
    fireEvent.change(noteInput, {
      target: { value: "Mang kèm thêm ớt tươi và khăn giấy" },
    });
    expect(noteInput).toHaveValue("Mang kèm thêm ớt tươi và khăn giấy");
  });

  it("allows selecting a different table to serve via table selector modal", () => {
    render(<OperatorOrderCreationView defaultTableId="table-05" />);

    const switchTableBtns = screen.getAllByRole("button", {
      name: /chọn bàn khác/i,
    });
    fireEvent.click(switchTableBtns[0]);

    // Modal dialog
    expect(
      screen.getByRole("heading", { name: "Chọn bàn phục vụ" }),
    ).toBeInTheDocument();

    const table01Option = screen.getByRole("button", { name: /Bàn 01/i });
    fireEvent.click(table01Option);

    // Context should now show Bàn 01
    expect(screen.getAllByText(/Bàn 01/i).length).toBeGreaterThan(0);
  });
});
