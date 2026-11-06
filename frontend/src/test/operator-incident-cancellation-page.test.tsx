import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import IncidentCancellationPage from "../app/(operator)/operator/(workspace)/cancellations/new/page";
import { loadOperatorBill, loadOperatorSessionListing } from "../lib/api/ordering/ordering.api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock("../lib/api/ordering/cancellation.api", () => ({
  createOperatorIncidentCancellation: vi.fn(),
}));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadOperatorSessionListing: vi.fn(),
  loadOperatorBill: vi.fn(),
}));

describe("IncidentCancellationPage", () => {
  it("does not show mock order items when the session API fails", async () => {
    vi.mocked(loadOperatorSessionListing).mockRejectedValue(new Error("Không thể tải món."));

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <IncidentCancellationPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Không thể tải món.")).toBeInTheDocument();
    expect(screen.getByLabelText("Bàn / đơn mang về")).toBeDisabled();
    expect(screen.queryByText("Bàn 01")).not.toBeInTheDocument();
  });
  it("lists prepared items from the active session bill", async () => {
    vi.mocked(loadOperatorSessionListing).mockResolvedValueOnce({
      tables: [
        {
          tableId: 1,
          tableCode: 1,
          sessions: [{ sessionId: "session-1", customerName: "An", status: "OPEN" }],
        },
      ],
      takeawaySessions: [],
    });
    vi.mocked(loadOperatorBill).mockResolvedValueOnce({
      tableCode: 1,
      sessionStatus: "OPEN",
      originalAmount: 20,
      payableAmount: 20,
      orders: [
        {
          orderId: "order-1",
          orderNumber: "1",
          originalAmount: 20,
          payableAmount: 20,
          note: null,
          createdAt: "2026-01-01",
          items: [
            {
              orderItemId: "item-1",
              itemName: "Trà",
              unitPrice: 10,
              optionsAmount: 0,
              quantity: 2,
              preparedQuantity: 2,
              cancelledQuantity: 0,
              pendingCancellationQuantity: 1,
              totalAmount: 20,
              options: [],
            },
          ],
        },
      ],
    });
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <IncidentCancellationPage />
      </QueryClientProvider>,
    );
    await screen.findByRole("option", { name: "Bàn 01" });
    fireEvent.change(screen.getByLabelText("Bàn / đơn mang về"), {
      target: { value: "session-1" },
    });
    expect(await screen.findByText("Trà")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tăng số lượng hủy Trà" }));
    expect(screen.getByText("Hủy 1/1 phần")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tăng số lượng hủy Trà" })).toBeDisabled();
  });
});
