import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorOrdersPage from "../app/(operator)/operator/(workspace)/orders/page";

describe("OperatorOrdersPage", () => {
  it("aggregates matching dishes and keeps table allocation in FIFO order", () => {
    render(<OperatorOrdersPage />);

    expect(
      screen.getByRole("heading", { name: "Tổng hợp món cần làm" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bò sốt tiêu đen")).toBeInTheDocument();
    expect(screen.getByText("Gà chiên mắm")).toBeInTheDocument();
    expect(screen.getByText("32 phần")).toBeInTheDocument();

    const beefGroup = screen.getByText("Bò sốt tiêu đen").closest("details");

    expect(beefGroup).not.toBeNull();

    const beefTables = within(beefGroup as HTMLElement)
      .getAllByText(/^Bàn \d+$/)
      .map((table) => table.textContent);

    expect(beefTables).toEqual(["Bàn 03", "Bàn 05", "Bàn 12"]);
    expect(
      within(beefGroup as HTMLElement).getByRole("button", {
        name: "Chờ API",
      }),
    ).toBeDisabled();
  });
});
