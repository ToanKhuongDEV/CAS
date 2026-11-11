import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { OperatorPaymentControlView } from "../components/operator/operator-payment-control-view";
import { QueryProvider } from "../components/providers/query-provider";
import { loadOperatorBill, loadOperatorSessionListing } from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadOperatorBill: vi.fn(),
  loadOperatorSessionListing: vi.fn(),
}));
vi.mock("../components/ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock("../components/payment/payment-request-form", () => ({
  PaymentRequestForm: ({ bill }: { bill: { payableAmount: number } }) => (
    <p>Bill: {bill.payableAmount}</p>
  ),
}));
vi.mock("../components/customer/customer-order-voucher-summary", () => ({
  CustomerOrderVoucherSummary: () => null,
}));

it("refreshes open sessions and the selected bill while retaining data after a failed refresh", async () => {
  const listing = {
    tables: [
      {
        tableId: 1,
        tableCode: 1,
        sessions: [{ sessionId: "session-1", customerName: "An", status: "OPEN" as const }],
      },
    ],
    takeawaySessions: [],
  };
  const bill = {
    tableCode: 1,
    sessionStatus: "OPEN" as const,
    originalAmount: 100,
    payableAmount: 100,
    orders: [],
  };
  vi.mocked(loadOperatorSessionListing).mockResolvedValue(listing);
  vi.mocked(loadOperatorBill)
    .mockResolvedValueOnce(bill)
    .mockRejectedValueOnce(new Error("Không thể tải hóa đơn"))
    .mockResolvedValue({ ...bill, payableAmount: 200 });
  render(
    <QueryProvider>
      <OperatorPaymentControlView onPaymentRequested={vi.fn()} pollIntervalMs={150} />
    </QueryProvider>,
  );

  fireEvent.click(await screen.findByRole("button", { name: "Tạo yêu cầu thanh toán" }));
  expect(await screen.findByText("Bill: 100")).toBeInTheDocument();
  expect(await screen.findByText("Không thể tải hóa đơn")).toBeInTheDocument();
  expect(screen.getByText("Bill: 100")).toBeInTheDocument();
  expect(await screen.findByText("Bill: 200")).toBeInTheDocument();
  await waitFor(() =>
    expect(vi.mocked(loadOperatorSessionListing).mock.calls.length).toBeGreaterThanOrEqual(2),
  );
});
