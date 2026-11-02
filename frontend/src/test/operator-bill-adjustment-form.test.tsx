import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { OperatorBillAdjustmentForm } from "../components/operator/operator-bill-adjustment-form";

it("explains that adjustments are unavailable and prevents submission", () => {
  render(<OperatorBillAdjustmentForm />);
  const toggle = screen.getByRole("button", { name: "Điều chỉnh hóa đơn" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByLabelText("Loại điều chỉnh")).not.toBeInTheDocument();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("status")).toHaveTextContent("đang được hoàn thiện");
  expect(screen.getByLabelText("Loại điều chỉnh")).toBeDisabled();
  expect(screen.getByLabelText("Số tiền")).toBeDisabled();
  expect(screen.getByLabelText("Lý do")).toBeDisabled();
  expect(screen.getByRole("button", { name: "Thêm điều chỉnh" })).toBeDisabled();
  fireEvent.click(toggle);
  expect(screen.queryByLabelText("Loại điều chỉnh")).not.toBeInTheDocument();
});
