import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorOrdersPage from "../app/(operator)/operator/(workspace)/orders/page";
import {
  completePreparationBatch,
  loadPreparationGroups,
} from "../lib/api/ordering/preparation.api";

vi.mock("../lib/api/ordering/preparation.api", () => ({
  completePreparationBatch: vi.fn(),
  loadPreparationGroups: vi.fn(),
}));

const group = {
  allocations: [
    {
      orderCreatedAt: "2026-08-30T18:55:00",
      orderId: "order-1",
      orderItemId: "item-1",
      remainingQuantity: 4,
      tableCode: 3,
    },
    {
      orderCreatedAt: "2026-08-30T19:05:00",
      orderId: "order-2",
      orderItemId: "item-2",
      remainingQuantity: 8,
      tableCode: 5,
    },
  ],
  groupKey: "9-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  itemName: "Bò sốt tiêu đen",
  menuItemId: 9,
  optionConfigurationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  options: [],
  remainingQuantity: 12,
};

describe("OperatorOrdersPage", () => {
  beforeEach(() => {
    vi.mocked(loadPreparationGroups).mockReset();
    vi.mocked(completePreparationBatch).mockReset();
  });

  it("loads preparation groups and records a completed batch", async () => {
    vi.mocked(loadPreparationGroups).mockResolvedValueOnce([group]).mockResolvedValueOnce([]);
    vi.mocked(completePreparationBatch).mockResolvedValue({
      allocations: [],
      groupKey: group.groupKey,
      remainingQuantity: 7,
      requestedQuantity: 5,
    });

    render(<OperatorOrdersPage />);

    expect(await screen.findByText("Bò sốt tiêu đen")).toBeInTheDocument();
    const itemView = screen.getByRole("region", { name: "Tổng hợp theo món" });
    const beefGroup = within(itemView).getByText("Bò sốt tiêu đen").closest("details");
    expect(beefGroup).not.toBeNull();
    expect(
      within(beefGroup as HTMLElement)
        .getAllByText(/^Bàn \d+$/)
        .map((item) => item.textContent),
    ).toEqual(["Bàn 03", "Bàn 05"]);

    fireEvent.change(
      within(beefGroup as HTMLElement).getByRole("spinbutton", { name: "Số phần vừa làm xong" }),
      { target: { value: "5" } },
    );
    fireEvent.click(
      within(beefGroup as HTMLElement).getByRole("button", { name: "Xác nhận hoàn thành" }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Đã ghi nhận 5 phần Bò sốt tiêu đen hoàn thành.",
    );
    expect(completePreparationBatch).toHaveBeenCalledWith(
      group.groupKey,
      expect.objectContaining({ quantity: 5 }),
    );
    expect(await screen.findByText("Đã hoàn thành tất cả món")).toBeInTheDocument();
  });
});
