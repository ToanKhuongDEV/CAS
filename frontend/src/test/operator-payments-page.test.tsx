import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatorPaymentsPage from "../app/(operator)/operator/(workspace)/payments/page";

describe("OperatorPaymentsPage", () => {
  it("requires confirmation before marking a payment as paid", () => {
    render(<OperatorPaymentsPage />);

    expect(screen.getByRole("heading", { name: "Thanh toán chờ xác nhận" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kiểm tra payment" })).not.toBeInTheDocument();

    const confirmationButtons = screen.getAllByRole("button", {
      name: "Xác nhận đã thanh toán",
    });
    expect(confirmationButtons).toHaveLength(3);

    fireEvent.click(confirmationButtons[0]);

    const dialog = screen.getByRole("dialog", {
      name: "Xác nhận thanh toán",
    });
    expect(within(dialog).getByText("Bàn 05", { selector: "p" })).toBeInTheDocument();
    expect(within(dialog).getByText("Số tiền").parentElement).toHaveTextContent("170.000đ");
    expect(within(dialog).getByText(/chỉ xác nhận khi đã kiểm tra loa/i)).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Xác nhận đã thanh toán",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đã xác nhận Bàn 05 thanh toán 170.000đ.");
    expect(screen.getAllByRole("button", { name: "Xác nhận đã thanh toán" })).toHaveLength(2);
  });
});
