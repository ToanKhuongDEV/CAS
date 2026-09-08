import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OperatorCancellationRequestsView } from "../components/operator/operator-cancellation-requests-view";
import {
  loadOperatorCancellationRequest,
  loadOperatorCancellationRequests,
  resolveOperatorCancellationRequest,
} from "../lib/api/ordering/cancellation.api";

vi.mock("../lib/api/ordering/cancellation.api", () => ({
  loadOperatorCancellationRequest: vi.fn(),
  loadOperatorCancellationRequests: vi.fn(),
  resolveOperatorCancellationRequest: vi.fn(),
}));

const request = {
  cancellationRequestId: "request-1",
  itemName: "Mì cay đặc biệt 7 cấp độ",
  orderItemId: "item-1",
  preparedQuantity: 0,
  reason: "Gọi nhầm món",
  requestedAt: "2026-09-08T19:40:00",
  requestedQuantity: 1,
  tableCode: 8,
};

beforeEach(() => {
  vi.mocked(loadOperatorCancellationRequests).mockResolvedValue([request]);
  vi.mocked(loadOperatorCancellationRequest).mockResolvedValue({
    candidates: [],
    item: { options: [], unitPrice: 65000 },
    request,
  });
  vi.mocked(resolveOperatorCancellationRequest).mockResolvedValue({});
});

describe("OperatorCancellationRequestsView", () => {
  it("renders the list of pending cancellation requests from the API", async () => {
    render(<OperatorCancellationRequestsView />);

    expect(screen.getByRole("heading", { name: "Yêu cầu hủy món" })).toBeInTheDocument();
    expect(await screen.findByText("Bàn 08")).toBeInTheDocument();
    expect(screen.getByText("Mì cay đặc biệt 7 cấp độ")).toBeInTheDocument();
  });

  it("approves a request through the API", async () => {
    render(<OperatorCancellationRequestsView />);

    fireEvent.click(await screen.findByRole("button", { name: "Đồng ý hủy" }));
    expect(screen.getByRole("heading", { name: "Đồng ý hủy món?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Có/ }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đồng ý" }));

    await vi.waitFor(() =>
      expect(resolveOperatorCancellationRequest).toHaveBeenCalledWith("request-1", {
        decision: "APPROVE",
        isRemade: true,
        targetOrderItemId: null,
        transferQuantity: 0,
      }),
    );
  });

  it("rejects a request through the API", async () => {
    render(<OperatorCancellationRequestsView />);

    fireEvent.click(await screen.findByRole("button", { name: "Từ chối" }));
    expect(screen.getByRole("heading", { name: "Từ chối hủy món?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Xác nhận từ chối" }));

    await vi.waitFor(() =>
      expect(resolveOperatorCancellationRequest).toHaveBeenCalledWith("request-1", {
        decision: "REJECT",
      }),
    );
  });
});
