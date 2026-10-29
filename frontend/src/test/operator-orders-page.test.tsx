import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorOrdersPage from "../app/(operator)/operator/(workspace)/orders/page";
import {
  completePreparationBatch,
  completePreparationSession,
  loadPreparationGroups,
} from "../lib/api/ordering/preparation.api";
import { ToastProvider } from "../components/ui/toast-provider";
import { QueryProvider } from "../components/providers/query-provider";

vi.mock("../lib/api/ordering/preparation.api", () => ({
  completePreparationBatch: vi.fn(),
  completePreparationSession: vi.fn(),
  loadPreparationGroups: vi.fn(),
}));

const group = {
  allocations: [
    {
      orderCreatedAt: "2026-08-30T18:55:00",
      orderId: "order-1",
      sessionId: "session-1",
      orderItemId: "item-1",
      remainingQuantity: 4,
      tableCode: 3,
    },
    {
      orderCreatedAt: "2026-08-30T19:05:00",
      orderId: "order-2",
      sessionId: "session-2",
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

const sameTimeGroup = {
  allocations: [
    {
      orderCreatedAt: "2026-08-30T18:55:00",
      orderId: "order-3",
      sessionId: "session-1",
      orderItemId: "item-3",
      remainingQuantity: 2,
      tableCode: 3,
    },
  ],
  groupKey: "10-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  itemName: "Cơm chiên hải sản",
  menuItemId: 10,
  optionConfigurationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  options: [],
  remainingQuantity: 2,
};

describe("OperatorOrdersPage", () => {
  beforeEach(() => {
    vi.mocked(loadPreparationGroups).mockReset();
    vi.mocked(completePreparationBatch).mockReset();
  });

  it("completes the selected takeaway session", async () => {
    vi.mocked(loadPreparationGroups).mockResolvedValue([
      {
        ...group,
        allocations: [
          { ...group.allocations[0], orderId: "takeaway-123", tableCode: null, customerName: "An" },
        ],
      },
    ]);
    vi.mocked(completePreparationSession).mockResolvedValue({ completedQuantity: 4 });
    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorOrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );
    expect((await screen.findAllByText("Mang về · An · takeaway")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Hoàn thành toàn bộ món của Mang về/ }));
    await vi.waitFor(() =>
      expect(completePreparationSession).toHaveBeenCalledWith("session-1", expect.any(String)),
    );
  });

  it("separates two sessions at the same table", async () => {
    vi.mocked(loadPreparationGroups).mockResolvedValue([
      {
        ...group,
        allocations: [
          { ...group.allocations[0], customerName: "An" },
          { ...group.allocations[1], tableCode: 3, customerName: "Bình" },
        ],
      },
    ]);
    vi.mocked(completePreparationSession).mockResolvedValue({ completedQuantity: 4 });
    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorOrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Hoàn thành toàn bộ món của Bàn 03 · An" }),
    );
    await vi.waitFor(() =>
      expect(completePreparationSession).toHaveBeenCalledWith("session-1", expect.any(String)),
    );
    expect(
      screen.getByRole("button", { name: "Hoàn thành toàn bộ món của Bàn 03 · Bình" }),
    ).toBeInTheDocument();
  });

  it("loads preparation groups and records a completed batch", async () => {
    vi.mocked(loadPreparationGroups)
      .mockResolvedValueOnce([group, sameTimeGroup])
      .mockResolvedValueOnce([]);
    vi.mocked(completePreparationBatch).mockResolvedValue({
      allocations: [],
      groupKey: group.groupKey,
      remainingQuantity: 7,
      requestedQuantity: 5,
    });

    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorOrdersPage />
        </ToastProvider>
      </QueryProvider>,
    );

    expect((await screen.findAllByText("Bò sốt tiêu đen")).length).toBeGreaterThan(0);
    const itemView = screen.getByRole("region", { name: "Tổng hợp theo món" });
    const beefGroup = within(itemView).getByText("Bò sốt tiêu đen").closest("details");
    expect(beefGroup).not.toBeNull();
    expect(
      within(beefGroup as HTMLElement)
        .getAllByText(/^Bàn \d+$/)
        .map((item) => item.textContent),
    ).toEqual(["Bàn 03", "Bàn 05"]);

    const tableView = screen.getByRole("region", { name: "Món theo bàn / đơn mang về" });
    expect(within(tableView).getByText("2 phiên đang chờ")).toBeInTheDocument();
    expect(within(tableView).getByRole("heading", { name: "Bàn 03" })).toBeInTheDocument();
    expect(within(tableView).getByText("×4")).toBeInTheDocument();
    const tableThreeItems = within(tableView).getByRole("list", { name: "Món chờ tại Bàn 03" });
    expect(within(tableThreeItems).getAllByText("Gửi lúc 18:55")).toHaveLength(1);
    expect(within(tableThreeItems).getByText("Cơm chiên hải sản")).toBeInTheDocument();
    expect(within(tableThreeItems).queryByText("Không có option")).not.toBeInTheDocument();

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
