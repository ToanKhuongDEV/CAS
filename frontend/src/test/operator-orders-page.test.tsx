import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorOrdersPage from "../app/(operator)/operator/(workspace)/orders/page";

describe("OperatorOrdersPage", () => {
  it("aggregates matching dishes and serves earlier tables first", () => {
    render(<OperatorOrdersPage />);

    expect(
      screen.getByRole("heading", { name: "Đơn gọi món" }),
    ).toBeInTheDocument();
    const itemView = screen.getByRole("region", {
      name: "Tổng hợp theo món",
    });
    const tableView = screen.getByRole("region", {
      name: "Món theo bàn",
    });

    expect(within(itemView).getByText("Bò sốt tiêu đen")).toBeInTheDocument();
    expect(within(itemView).getByText("Gà chiên mắm")).toBeInTheDocument();
    expect(screen.getByText("32 phần")).toBeInTheDocument();
    expect(screen.queryByText("Thứ tự phục vụ")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Bàn gọi trước được nhận món trước."),
    ).not.toBeInTheDocument();

    const beefGroup = within(itemView)
      .getByText("Bò sốt tiêu đen")
      .closest("details");

    expect(beefGroup).not.toBeNull();
    expect(
      within(beefGroup as HTMLElement).getByText("›"),
    ).toHaveClass("group-open:rotate-90");

    const beefTables = within(beefGroup as HTMLElement)
      .getAllByText(/^Bàn \d+$/)
      .map((table) => table.textContent);

    expect(beefTables).toEqual(["Bàn 03", "Bàn 05", "Bàn 12"]);
    const table03Group = within(tableView)
      .getByText("Bàn 03")
      .closest("details");
    expect(table03Group).not.toBeNull();
    expect(
      within(table03Group as HTMLElement).getByText("Bò sốt tiêu đen"),
    ).toBeInTheDocument();
    expect(
      within(table03Group as HTMLElement).getByText("Mỳ cay hải sản"),
    ).toBeInTheDocument();
    expect(
      within(beefGroup as HTMLElement).getByRole("link", {
        name: "Bàn 03",
      }),
    ).toHaveAttribute("href", "/operator/orders/ORD-0819");
    fireEvent.change(
      within(beefGroup as HTMLElement).getByRole("spinbutton", {
        name: "Số phần vừa làm xong",
      }),
      { target: { value: "5" } },
    );
    fireEvent.click(
      within(beefGroup as HTMLElement).getByRole("button", {
        name: "Xác nhận hoàn thành",
      }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Đã cập nhật: Bàn 03: 4, Bàn 05: 1",
    );
    expect(screen.getByText("27 phần")).toBeInTheDocument();
    expect(
      within(table03Group as HTMLElement).queryByText("Bò sốt tiêu đen"),
    ).not.toBeInTheDocument();
    expect(
      within(table03Group as HTMLElement).getByText("Mỳ cay hải sản"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Chờ API")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Dữ liệu hiện tại là dữ liệu mẫu"),
    ).not.toBeInTheDocument();
  });
});
