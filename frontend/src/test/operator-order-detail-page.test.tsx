import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatorOrderDetailView } from "../components/operator/operator-order-detail-view";
import { loadOperatorOrderDetail } from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/ordering/ordering.api", () => ({ loadOperatorOrderDetail: vi.fn() }));

describe("OperatorOrderDetailView", () => {
  it("loads and renders the details of one order", async () => {
    vi.mocked(loadOperatorOrderDetail).mockResolvedValue({
      customerName: "Nguyễn An",
      customerPhone: "0901234567",
      tableCode: 3,
      order: {
        createdAt: "2026-09-14T18:55:00",
        items: [
          {
            cancelledQuantity: 0,
            itemName: "Bò sốt tiêu đen",
            options: [
              { groupName: "Độ chín", optionName: "Chín vừa", quantityPerItem: 1, unitPrice: 0 },
              {
                groupName: "Topping",
                optionName: "Thêm nấm đùi gà",
                quantityPerItem: 1,
                unitPrice: 15_000,
              },
            ],
            optionsAmount: 15_000,
            orderItemId: "item-1",
            pendingCancellationQuantity: 0,
            preparedQuantity: 1,
            quantity: 2,
            totalAmount: 148_000,
            unitPrice: 59_000,
          },
        ],
        note: "Mang khoai ra trước.",
        orderId: "order-1",
        orderNumber: "ORD-001",
        originalAmount: 148_000,
        payableAmount: 148_000,
      },
    });

    render(<OperatorOrderDetailView orderId="order-1" />);

    expect(await screen.findByRole("heading", { name: "Đơn của Bàn 03" })).toBeInTheDocument();
    expect(loadOperatorOrderDetail).toHaveBeenCalledWith("order-1");
    expect(screen.getByText("Bò sốt tiêu đen")).toBeInTheDocument();
    expect(screen.getByText("Chín vừa")).toBeInTheDocument();
    expect(screen.getByText("+ Thêm nấm đùi gà")).toBeInTheDocument();
    expect(screen.getByText("Đã làm 1/2 phần")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn An")).toBeInTheDocument();
    expect(screen.getByText("0901234567")).toBeInTheDocument();
    expect(screen.getByText("Mang khoai ra trước.")).toBeInTheDocument();
    expect(screen.getAllByText("148.000 ₫")).toHaveLength(3);
  });
});
