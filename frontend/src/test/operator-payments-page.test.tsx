import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import OperatorPaymentsPage from "../app/(operator)/operator/(workspace)/payments/page";
import { confirmOperatorPayment, loadOperatorPayments } from "../lib/api/payment/payment.api";

vi.mock("../lib/api/payment/payment.api", () => ({
  confirmOperatorPayment: vi.fn(),
  loadOperatorPayments: vi.fn(),
}));

const payment = {
  amount: 170000,
  billSnapshot: JSON.stringify({
    orders: [
      {
        items: [
          {
            itemName: "Mỳ cay hải sản",
            options: [],
            optionsAmount: 0,
            quantity: 1,
            totalAmount: 170000,
            unitPrice: 170000,
          },
        ],
      },
    ],
  }),
  confirmedAt: null,
  publicId: "payment-05",
  status: "PENDING" as const,
  tableCode: 5,
};

describe("OperatorPaymentsPage", () => {
  it("loads a real pending payment and requires confirmation before marking it as paid", async () => {
    vi.mocked(loadOperatorPayments).mockResolvedValue([payment]);
    vi.mocked(confirmOperatorPayment).mockResolvedValue({ ...payment, status: "PAID" });

    render(<OperatorPaymentsPage />);

    expect(
      await screen.findByRole("heading", { name: "Thanh toán chờ xác nhận" }),
    ).toBeInTheDocument();
    const confirmationButton = await screen.findByRole("button", {
      name: "Xác nhận đã thanh toán",
    });
    expect(screen.queryByRole("button", { name: "Kiểm tra payment" })).not.toBeInTheDocument();

    fireEvent.click(confirmationButton);

    const dialog = screen.getByRole("dialog", { name: "Xác nhận thanh toán" });
    expect(within(dialog).getByText("Bàn 05", { selector: "p" })).toBeInTheDocument();
    expect(within(dialog).getByText("Số tiền").parentElement).toHaveTextContent("170.000đ");
    expect(within(dialog).getByText(/chỉ xác nhận khi đã kiểm tra loa/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Xác nhận đã thanh toán" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Đã xác nhận Bàn 05 thanh toán 170.000đ.",
    );
    expect(confirmOperatorPayment).toHaveBeenCalledWith("payment-05");
  });
});
