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

beforeEach(() => {
  vi.mocked(loadOperatorCancellationRequests).mockRejectedValue(new Error("offline"));
  vi.mocked(loadOperatorCancellationRequest).mockResolvedValue({
    candidates: [],
    request: {} as never,
  });
  vi.mocked(resolveOperatorCancellationRequest).mockResolvedValue({});
});

describe("OperatorCancellationRequestsView", () => {
  it("renders the list of pending cancellation requests", () => {
    render(<OperatorCancellationRequestsView />);

    expect(screen.getByRole("heading", { name: "Yêu cầu hủy món" })).toBeInTheDocument();
    expect(screen.getByText("Bàn 08")).toBeInTheDocument();
    expect(screen.getByText("Mỳ cay đặc biệt 7 cấp độ")).toBeInTheDocument();
    expect(screen.getByText("Bàn 01")).toBeInTheDocument();
  });

  it("opens confirmation modal when clicking Đồng ý hủy and approves request", async () => {
    render(<OperatorCancellationRequestsView />);

    const approveButtons = screen.getAllByRole("button", { name: "Đồng ý hủy" });
    fireEvent.click(approveButtons[0]);

    expect(screen.getByRole("heading", { name: "Đồng ý hủy món?" })).toBeInTheDocument();
    expect(screen.getByText(/Làm lại món bù/)).toBeInTheDocument();

    // Chọn tùy chọn Có trước khi xác nhận
    const yesOption = screen.getByRole("button", { name: /^Có/ });
    fireEvent.click(yesOption);

    const confirmButton = screen.getByRole("button", { name: "Xác nhận đồng ý" });
    fireEvent.click(confirmButton);

    expect(
      await screen.findByText(/Đã đồng ý hủy món "Mỳ cay đặc biệt 7 cấp độ" của Bàn 08/),
    ).toBeInTheDocument();
  });

  it("opens reject modal when clicking Từ chối and rejects request", async () => {
    render(<OperatorCancellationRequestsView />);

    const rejectButtons = screen.getAllByRole("button", { name: "Từ chối" });
    fireEvent.click(rejectButtons[0]);

    expect(screen.getByRole("heading", { name: "Từ chối hủy món?" })).toBeInTheDocument();

    const confirmRejectButton = screen.getByRole("button", { name: "Xác nhận từ chối" });
    fireEvent.click(confirmRejectButton);

    expect(await screen.findByText(/Đã từ chối yêu cầu hủy của Bàn 08/)).toBeInTheDocument();
  });
});
