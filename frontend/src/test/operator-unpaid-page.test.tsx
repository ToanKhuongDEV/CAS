import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  confirmOperatorPayment,
  loadEligibleUnpaidSessions,
  loadOperatorUnpaidRecords,
  recordOperatorUnpaid,
} from "../lib/api/payment/payment.api";
import { OperatorUnpaidView } from "../components/operator/operator-unpaid-view";
import { ToastProvider } from "../components/ui/toast-provider";

vi.mock("../lib/api/payment/payment.api", () => ({
  confirmOperatorPayment: vi.fn(),
  loadEligibleUnpaidSessions: vi.fn(),
  loadOperatorUnpaidRecords: vi.fn(),
  recordOperatorUnpaid: vi.fn(),
}));

const records = [
  {
    amount: 320000,
    billSnapshot: JSON.stringify({ bill: { billNumber: "BILL-20260808-009" } }),
    createdAt: "2026-08-08T18:15:00",
    paymentId: "payment-1",
    publicId: "unpaid-1",
    reason: "Khách rời quán chưa thanh toán",
    reportedByName: "Operator One",
    resolvedAt: null,
    status: "OPEN" as const,
    tableCode: 9,
    tableSessionId: "session-1",
  },
];

describe("OperatorUnpaidView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    vi.mocked(loadOperatorUnpaidRecords).mockResolvedValue(records);
    vi.mocked(loadEligibleUnpaidSessions).mockResolvedValue([
      {
        amount: 320000,
        openedAt: "2026-08-08T16:00:00",
        sessionId: "session-1",
        sessionStatus: "OPEN",
        tableCode: 9,
      },
    ]);
  });

  const renderUnpaidView = () =>
    render(
      <ToastProvider>
        <OperatorUnpaidView />
      </ToastProvider>,
    );

  it("loads unpaid records from the API and opens the immutable bill snapshot", async () => {
    renderUnpaidView();

    expect(await screen.findByRole("heading", { name: "Không thanh toán" })).toBeInTheDocument();
    const snapshotButton = await screen.findByRole("button", { name: "Xem bill snapshot" });
    expect(screen.getByText(/Bàn 9/)).toBeInTheDocument();
    fireEvent.click(snapshotButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/BILL-20260808-009/)).toBeInTheDocument();
    expect(loadEligibleUnpaidSessions).toHaveBeenCalledWith(120);
  });

  it("requires confirmation before confirming the linked pending payment", async () => {
    vi.mocked(confirmOperatorPayment).mockResolvedValue({} as never);
    renderUnpaidView();

    fireEvent.click(await screen.findByRole("button", { name: "Xác nhận đã thu" }));

    const dialog = screen.getByRole("alertdialog", { name: "Xác nhận đã thu tiền" });
    expect(dialog).toHaveTextContent("Thao tác này không thể hoàn tác.");
    fireEvent.click(within(dialog).getByRole("button", { name: "Xác nhận đã thu" }));

    await waitFor(() => expect(confirmOperatorPayment).toHaveBeenCalledWith("payment-1"));
  });

  it("shows a success toast after recording an unpaid table session", async () => {
    vi.mocked(recordOperatorUnpaid).mockResolvedValue({} as never);
    renderUnpaidView();

    const recordButton = await screen.findByRole("button", {
      name: /ghi nhận không được thanh toán/i,
    });
    await waitFor(() => expect(recordButton).toBeEnabled());
    fireEvent.click(recordButton);
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận ghi nhận" }));

    await waitFor(() =>
      expect(recordOperatorUnpaid).toHaveBeenCalledWith({ reason: null, sessionId: "session-1" }),
    );
    expect(
      await screen.findByText("Đã đóng phiên bàn và ghi nhận khoản chưa thanh toán."),
    ).toBeInTheDocument();
  });
});
