import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OperatorPaymentsPage from "../app/(operator)/operator/(workspace)/payments/page";
import { QueryProvider } from "../components/providers/query-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";
import {
  confirmOperatorPayment,
  createOperatorPayment,
  loadOperatorPaidTodayPayments,
  loadOperatorPayments,
} from "../lib/api/payment/payment.api";
import { loadPublicStore } from "../lib/api/store/public-store.api";
import { loadOperatorBill, loadOperatorSessionListing } from "../lib/api/ordering/ordering.api";

vi.mock("../lib/api/payment/payment.api", () => ({
  confirmOperatorPayment: vi.fn(),
  createOperatorPayment: vi.fn(),
  loadEligibleUnpaidSessions: vi.fn(),
  loadOperatorPaidTodayPayments: vi.fn(),
  loadOperatorPayments: vi.fn(),
  loadBillAdjustments: vi.fn().mockResolvedValue([]),
  loadOperatorUnpaidRecords: vi.fn(),
  operatorPendingPaymentCountQueryKey: ["operator", "payments", "pending-count"],
  promotionUnavailableMessage: "Khuyến mãi đã không còn khả dụng. Vui lòng chọn lại khuyến mãi.",
  recordOperatorUnpaid: vi.fn(),
}));
vi.mock("../lib/auth/firebase", () => ({
  getFirebaseAuth: () => ({ currentUser: { uid: "operator-1" } }),
}));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({ loadPublicStore: vi.fn() }));
vi.mock("../lib/api/ordering/ordering.api", () => ({
  loadOperatorBill: vi.fn(),
  loadOperatorSessionListing: vi.fn(),
}));
vi.mock("../components/customer/customer-order-voucher-summary", () => ({
  CustomerOrderVoucherSummary: () => null,
}));
vi.mock("../components/payment/payment-request-form", () => ({
  PaymentRequestForm: ({ onRequest }: { onRequest: () => void }) => (
    <button onClick={onRequest}>Gửi yêu cầu thanh toán</button>
  ),
}));

const payment = {
  amount: 170000,
  billSnapshot: JSON.stringify({
    bill: {
      originalAmount: 170000,
      orders: [
        {
          createdAt: "2026-09-01T19:55:00+07:00",
          note: "Không hành",
          orderNumber: "801a5c7c-f5d9-4882-b0ec-c672ba3e1649",
          items: [
            {
              itemName: "Mỳ cay hải sản",
              options: [],
              optionsAmount: 0,
              quantity: 1,
              totalAmount: 170000,
              unitPrice: 170000,
            },
            {
              itemName: "Mỳ cay hải sản",
              options: [],
              optionsAmount: 0,
              quantity: 1,
              totalAmount: 170000,
              unitPrice: 170000,
            },
          ],
        },
      ],
    },
    discount: null,
  }),
  confirmedAt: null,
  createdAt: "2026-09-01T20:00:00+07:00",
  publicId: "payment-05",
  status: "PENDING" as const,
  tableCode: 5,
};

describe("OperatorPaymentsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the promotion discount in red with a minus sign", async () => {
    const billSnapshot = JSON.parse(payment.billSnapshot) as Record<string, unknown>;
    vi.mocked(loadOperatorPayments).mockResolvedValue([
      {
        ...payment,
        billSnapshot: JSON.stringify({
          ...billSnapshot,
          discount: { name: "Ưu đãi", discountAmount: 10000, payableAmount: 160000 },
        }),
      },
    ]);
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator",
      role: "OPERATOR",
      storeId: 1,
    });
    vi.mocked(loadPublicStore).mockRejectedValue(new Error("Không thể tải cơ sở"));
    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorPaymentsPage />
        </ToastProvider>
      </QueryProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Xác nhận đã thanh toán" }));
    expect(screen.getByText("-10.000 ₫")).toHaveClass("text-cas-error");
  });

  it("returns to the open sessions after creating a payment request", async () => {
    vi.mocked(loadOperatorPayments).mockResolvedValue([]);
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator",
      role: "OPERATOR",
      storeId: 1,
    });
    vi.mocked(loadPublicStore).mockRejectedValue(new Error("Không thể tải cơ sở"));
    vi.mocked(loadOperatorSessionListing)
      .mockResolvedValueOnce({
        tables: [
          {
            tableId: 1,
            tableCode: 1,
            sessions: [{ sessionId: "session-1", customerName: "An", status: "OPEN" }],
          },
          {
            tableId: 2,
            tableCode: 2,
            sessions: [{ sessionId: "session-2", customerName: "Bình", status: "OPEN" }],
          },
        ],
        takeawaySessions: [],
      })
      .mockResolvedValue({
        tables: [
          {
            tableId: 2,
            tableCode: 2,
            sessions: [{ sessionId: "session-2", customerName: "Bình", status: "OPEN" }],
          },
        ],
        takeawaySessions: [],
      });
    vi.mocked(loadOperatorBill).mockResolvedValue({
      tableCode: 1,
      sessionStatus: "OPEN",
      originalAmount: 100,
      payableAmount: 100,
      orders: [],
    });
    vi.mocked(createOperatorPayment).mockResolvedValue(payment);
    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorPaymentsPage />
        </ToastProvider>
      </QueryProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Kiểm soát thanh toán" }));
    const row = (await screen.findByText(/Bàn 01/)).closest("li")!;
    fireEvent.click(within(row).getByRole("button", { name: "Tạo yêu cầu thanh toán" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Gửi yêu cầu thanh toán" }))[0]);

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Tạo yêu cầu thanh toán" }),
      ).not.toBeInTheDocument(),
    );
    expect(createOperatorPayment).toHaveBeenCalledWith("session-1");
    expect(await screen.findByText(/Bàn 02/)).toBeInTheDocument();
    expect(screen.queryByText(/Bàn 01/)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kiểm soát thanh toán" })).toBeInTheDocument();
  });

  it("keeps the request form open when its promotion is no longer available", async () => {
    vi.mocked(loadOperatorPayments).mockResolvedValue([]);
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator",
      role: "OPERATOR",
      storeId: 1,
    });
    vi.mocked(loadPublicStore).mockRejectedValue(new Error("Không thể tải cơ sở"));
    vi.mocked(loadOperatorSessionListing).mockResolvedValue({
      tables: [
        {
          tableId: 1,
          tableCode: 1,
          sessions: [{ sessionId: "session-1", customerName: "An", status: "OPEN" }],
        },
      ],
      takeawaySessions: [],
    });
    vi.mocked(loadOperatorBill).mockResolvedValue({
      tableCode: 1,
      sessionStatus: "OPEN",
      originalAmount: 100,
      payableAmount: 100,
      orders: [],
    });
    vi.mocked(createOperatorPayment).mockRejectedValue(
      new Error("Khuyến mãi đã không còn khả dụng. Vui lòng chọn lại khuyến mãi."),
    );
    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorPaymentsPage />
        </ToastProvider>
      </QueryProvider>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Kiểm soát thanh toán" }));
    fireEvent.click(await screen.findByRole("button", { name: "Tạo yêu cầu thanh toán" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Gửi yêu cầu thanh toán" }))[0]);
    expect(
      await screen.findByText("Khuyến mãi đã không còn khả dụng. Vui lòng chọn lại khuyến mãi."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Tạo yêu cầu thanh toán" })).toBeInTheDocument();
  });
  it("loads a real pending payment and requires confirmation before marking it as paid", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(loadOperatorPayments).mockResolvedValue([payment]);
    vi.mocked(loadOperatorPaidTodayPayments).mockResolvedValue([
      { ...payment, confirmedAt: "2026-09-01T20:05:00+07:00", status: "PAID" },
    ]);
    vi.mocked(confirmOperatorPayment).mockResolvedValue({
      ...payment,
      amount: 210000,
      status: "PAID",
    });
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator One",
      role: "OPERATOR",
      storeId: 1,
    });
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "123 Đường Ăn Vặt",
      closeTime: "22:00",
      email: "contact@example.com",
      googleMapsLocation: null,
      logoStorageKey: null,
      logoUrl: null,
      name: "Tiệm CAS",
      openTime: "09:00",
      phone: "0901 234 567",
      status: "ACTIVE",
      welcomeSlogan: null,
    });

    render(
      <StrictMode>
        <QueryProvider>
          <ToastProvider>
            <OperatorPaymentsPage />
          </ToastProvider>
        </QueryProvider>
      </StrictMode>,
    );

    expect(await screen.findByRole("button", { name: "Chờ xác nhận" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Kiểm soát thanh toán" })).toBeInTheDocument();
    const confirmationButton = await screen.findByRole("button", {
      name: "Xác nhận đã thanh toán",
    });
    await waitFor(() => expect(loadOperatorPayments).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "Kiểm tra payment" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In bill" })).toBeInTheDocument();

    fireEvent.click(confirmationButton);

    const dialog = screen.getByRole("dialog", { name: "Xác nhận thanh toán" });
    expect(within(dialog).queryByText("Giảm giá")).not.toBeInTheDocument();
    expect(await within(dialog).findByText("Tiệm CAS")).toBeInTheDocument();
    expect(within(dialog).getByText("123 Đường Ăn Vặt")).toBeInTheDocument();
    expect(within(dialog).getByText("Người xác nhận: Operator One")).toBeInTheDocument();
    expect(within(dialog).getByText("Bàn 05", { selector: "p" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("Mỳ cay hải sản")).toHaveLength(2);
    expect(within(dialog).getByText("Ghi chú: Không hành")).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("payment-05");
    expect(dialog).not.toHaveTextContent("801a5c7c-f5d9-4882-b0ec-c672ba3e1649");
    expect(
      within(dialog).getByText("Số tiền", { selector: "span" }).parentElement,
    ).toHaveTextContent("170.000 ₫");
    expect(within(dialog).getByText(/chỉ xác nhận khi đã kiểm tra loa/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Điều chỉnh hóa đơn" }));
    fireEvent.change(within(dialog).getByLabelText("Số tiền"), { target: { value: "40000" } });
    fireEvent.change(within(dialog).getByLabelText("Lý do"), { target: { value: "Vỡ đồ" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Thêm điều chỉnh" }));
    expect(within(dialog).getAllByText("Vỡ đồ").length).toBeGreaterThan(0);
    expect(
      within(dialog)
        .getAllByText("+40.000 ₫")
        .some((element) => element.classList.contains("text-right")),
    ).toBe(true);
    expect(confirmOperatorPayment).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText("Số tiền", { selector: "span" }).parentElement,
    ).toHaveTextContent("210.000 ₫");

    fireEvent.click(within(dialog).getByRole("button", { name: "Xác nhận đã thanh toán" }));

    expect(await screen.findByText("Đã xác nhận Bàn 05 thanh toán 210.000 ₫.")).toBeInTheDocument();
    expect(confirmOperatorPayment).toHaveBeenCalledWith("payment-05", payment.billSnapshot, {
      additions: [
        { id: expect.any(String), adjustmentType: "INCREASE", amount: 40000, reason: "Vỡ đồ" },
      ],
      updates: [],
      deletions: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "Đã thanh toán hôm nay" }));
    expect(await screen.findByText(/Xác nhận lúc 20:05 01-09/)).toBeInTheDocument();
    expect(loadOperatorPaidTodayPayments).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Xác nhận đã thanh toán" })).toBeDisabled();

    vi.mocked(loadOperatorPaidTodayPayments).mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole("button", { name: "Chờ xác nhận" }));
    fireEvent.click(screen.getByRole("button", { name: "Đã thanh toán hôm nay" }));
    expect(
      await screen.findByRole("heading", { name: "Chưa có thanh toán đã xác nhận hôm nay" }),
    ).toBeInTheDocument();
    expect(consoleError.mock.calls.some(([message]) => String(message).includes("same key"))).toBe(
      false,
    );
    consoleError.mockRestore();
  });

  it("does not show a table line for takeaway bills", async () => {
    vi.mocked(loadOperatorPayments).mockResolvedValue([{ ...payment, tableCode: null }]);
    vi.mocked(loadOperatorPaidTodayPayments).mockResolvedValue([]);
    vi.mocked(getCurrentOperationalAccount).mockResolvedValue({
      accountId: 2,
      displayName: "Operator One",
      role: "OPERATOR",
      storeId: 1,
    });
    vi.mocked(loadPublicStore).mockResolvedValue({
      address: "123 Đường Ăn Vặt",
      closeTime: "22:00",
      email: "contact@example.com",
      googleMapsLocation: null,
      logoStorageKey: null,
      logoUrl: null,
      name: "Tiệm CAS",
      openTime: "09:00",
      phone: "0901 234 567",
      status: "ACTIVE",
      welcomeSlogan: null,
    });

    render(
      <QueryProvider>
        <ToastProvider>
          <OperatorPaymentsPage />
        </ToastProvider>
      </QueryProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "In bill" }));

    const dialog = screen.getByRole("dialog", { name: "Xem hóa đơn" });
    expect(dialog).not.toHaveTextContent("Bàn null");
    expect(dialog).not.toHaveTextContent("Bàn 00");
  });
});
