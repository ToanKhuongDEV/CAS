import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";

import OperatorPaymentsPage from "../app/(operator)/operator/(workspace)/payments/page";
import { QueryProvider } from "../components/providers/query-provider";
import { getCurrentOperationalAccount } from "../lib/auth/operational-auth";
import {
  confirmOperatorPayment,
  loadOperatorPaidTodayPayments,
  loadOperatorPayments,
} from "../lib/api/payment/payment.api";
import { loadPublicStore } from "../lib/api/store/public-store.api";

vi.mock("../lib/api/payment/payment.api", () => ({
  confirmOperatorPayment: vi.fn(),
  loadEligibleUnpaidSessions: vi.fn(),
  loadOperatorPaidTodayPayments: vi.fn(),
  loadOperatorPayments: vi.fn(),
  loadOperatorUnpaidRecords: vi.fn(),
  operatorPendingPaymentCountQueryKey: ["operator", "payments", "pending-count"],
  recordOperatorUnpaid: vi.fn(),
}));
vi.mock("../lib/auth/firebase", () => ({
  getFirebaseAuth: () => ({ currentUser: { uid: "operator-1" } }),
}));
vi.mock("../lib/auth/operational-auth", () => ({ getCurrentOperationalAccount: vi.fn() }));
vi.mock("../lib/api/store/public-store.api", () => ({ loadPublicStore: vi.fn() }));

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
  it("loads a real pending payment and requires confirmation before marking it as paid", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(loadOperatorPayments).mockResolvedValue([payment]);
    vi.mocked(loadOperatorPaidTodayPayments).mockResolvedValue([
      { ...payment, confirmedAt: "2026-09-01T20:05:00+07:00", status: "PAID" },
    ]);
    vi.mocked(confirmOperatorPayment).mockResolvedValue({ ...payment, status: "PAID" });
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
          <OperatorPaymentsPage />
        </QueryProvider>
      </StrictMode>,
    );

    expect(await screen.findByRole("button", { name: "Chờ xác nhận" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Không thanh toán" })).toBeInTheDocument();
    const confirmationButton = await screen.findByRole("button", {
      name: "Xác nhận đã thanh toán",
    });
    await waitFor(() => expect(loadOperatorPayments).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "Kiểm tra payment" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In bill" })).toBeInTheDocument();

    fireEvent.click(confirmationButton);

    const dialog = screen.getByRole("dialog", { name: "Xác nhận thanh toán" });
    expect(await within(dialog).findByText("Tiệm CAS")).toBeInTheDocument();
    expect(within(dialog).getByText("123 Đường Ăn Vặt")).toBeInTheDocument();
    expect(within(dialog).getByText("Người xác nhận: Operator One")).toBeInTheDocument();
    expect(within(dialog).getByText("Bàn 05", { selector: "p" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("Mỳ cay hải sản")).toHaveLength(2);
    expect(within(dialog).getByText("Ghi chú: Không hành")).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("payment-05");
    expect(dialog).not.toHaveTextContent("801a5c7c-f5d9-4882-b0ec-c672ba3e1649");
    expect(within(dialog).getByText("Số tiền").parentElement).toHaveTextContent("170.000đ");
    expect(within(dialog).getByText(/chỉ xác nhận khi đã kiểm tra loa/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Xác nhận đã thanh toán" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Đã xác nhận Bàn 05 thanh toán 170.000đ.",
    );
    expect(confirmOperatorPayment).toHaveBeenCalledWith("payment-05");

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
});
