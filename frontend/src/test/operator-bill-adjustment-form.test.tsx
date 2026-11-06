import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { OperatorBillAdjustmentForm } from "../components/operator/operator-bill-adjustment-form";
import type { BillAdjustment } from "../lib/api/payment/payment.api";

vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

vi.mock("../lib/auth/firebase", () => ({ getFirebaseAuth: () => ({ currentUser: {} }) }));
vi.mock("../lib/auth/operational-auth", () => ({
  getCurrentOperationalAccount: vi.fn().mockResolvedValue({ role: "ADMIN" }),
}));

it("lets an operator add and remove a draft without calling the API", () => {
  const request = vi.spyOn(globalThis, "fetch");
  function Example() {
    const [items, setItems] = useState<BillAdjustment[]>([]);
    return <OperatorBillAdjustmentForm items={items} savedIds={[]} onChange={setItems} />;
  }
  render(<Example />);
  fireEvent.click(screen.getByRole("button", { name: "Điều chỉnh hóa đơn" }));
  fireEvent.change(screen.getByLabelText("Số tiền"), { target: { value: "40000" } });
  fireEvent.change(screen.getByLabelText("Lý do"), { target: { value: "Vỡ đồ" } });
  fireEvent.click(screen.getByRole("button", { name: "Thêm điều chỉnh" }));
  expect(screen.getByText("Vỡ đồ")).toBeInTheDocument();
  expect(screen.getByText("+40.000 ₫")).toHaveClass("text-right");
  expect(screen.queryByLabelText("Số tiền")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Điều chỉnh hóa đơn" }));
  expect(screen.getByLabelText("Số tiền")).toHaveValue(null);
  expect(screen.getByLabelText("Lý do")).toHaveValue("");
  fireEvent.click(screen.getByRole("button", { name: "Xóa điều chỉnh Vỡ đồ" }));
  expect(screen.queryByText("Vỡ đồ")).not.toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
  request.mockRestore();
});

it("closes edit on a second click and opens a clean form for a new adjustment", async () => {
  const item: BillAdjustment = {
    publicId: "saved",
    adjustmentType: "DECREASE",
    amount: 10000,
    reason: "Giảm giá",
    createdAt: "",
  };
  render(
    <OperatorBillAdjustmentForm items={[item]} savedIds={[item.publicId]} onChange={vi.fn()} />,
  );
  const edit = await screen.findByRole("button", { name: "Sửa" });
  fireEvent.click(edit);
  expect(screen.getByLabelText("Lý do")).toHaveValue("Giảm giá");
  fireEvent.click(edit);
  expect(screen.queryByLabelText("Lý do")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Điều chỉnh hóa đơn" }));
  expect(screen.getByLabelText("Lý do")).toHaveValue("");
  expect(screen.getByLabelText("Số tiền")).toHaveValue(null);
  expect(screen.getByLabelText("Loại điều chỉnh")).toHaveValue("INCREASE");
  fireEvent.click(edit);
  fireEvent.click(screen.getByRole("button", { name: "Điều chỉnh hóa đơn" }));
  fireEvent.click(screen.getByRole("button", { name: "Điều chỉnh hóa đơn" }));
  expect(screen.getByLabelText("Lý do")).toHaveValue("");
});
