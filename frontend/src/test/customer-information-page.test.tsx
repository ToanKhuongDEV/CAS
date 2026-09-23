import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CustomerInformationPage from "../app/(customer)/table/[token]/page";
import {
  getCurrentCustomerSalesSession,
  resolveCustomerSalesSession,
} from "../lib/customer/sales-session";
import { loadCustomerNotifications } from "../lib/api/notification/notification.api";

const push = vi.fn();
const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "qr-ban-05" }),
  useRouter: () => ({ push, replace }),
  useSearchParams: () => searchParams,
}));

vi.mock("../lib/customer/sales-session", () => ({
  getCurrentCustomerSalesSession: vi.fn(),
  resolveCustomerSalesSession: vi.fn(),
}));
vi.mock("../lib/api/notification/notification.api", () => ({
  loadCustomerNotifications: vi.fn().mockResolvedValue({ notifications: [], unreadCount: 0 }),
}));

describe("CustomerInformationPage", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    vi.mocked(loadCustomerNotifications).mockClear();
    window.sessionStorage.clear();
    vi.mocked(getCurrentCustomerSalesSession).mockRejectedValue(new Error("No session"));
    vi.mocked(resolveCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: true,
      sessionStatus: "CUSTOMER_INFORMATION_REQUIRED",
      tableCode: 5,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the first-customer information form", async () => {
    render(<CustomerInformationPage />);

    expect(await screen.findByRole("heading", { name: "Mở phiên gọi món" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tên của bạn" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: /Số điện thoại/i })).not.toBeRequired();
    expect(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" })).toBeInTheDocument();
    expect(
      screen.getByText("Thông tin này được dùng để xác định người đại diện mở phiên bàn."),
    ).toBeInTheDocument();
    expect(window.sessionStorage.getItem("cas.tableQrToken")).toBe("qr-ban-05");
  });

  it("shows a name error and focuses the invalid input", async () => {
    render(<CustomerInformationPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Mở phiên và xem thực đơn" }));

    expect(screen.getByText("Vui lòng nhập tên của bạn.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Tên của bạn" })).toHaveFocus();
    expect(push).not.toHaveBeenCalled();
  });

  it("accepts spaces in a Vietnamese phone number and sends normalized digits", async () => {
    render(<CustomerInformationPage />);

    fireEvent.change(await screen.findByRole("textbox", { name: "Tên của bạn" }), {
      target: { value: "Nguyễn Văn A" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Số điện thoại/i }), {
      target: { value: "0901 234 567" },
    });
    vi.mocked(resolveCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 5,
    });
    fireEvent.click(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }));

    await vi.waitFor(() =>
      expect(resolveCustomerSalesSession).toHaveBeenLastCalledWith("qr-ban-05", {
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
      }),
    );
  });

  it("rejects an invalid Vietnamese phone number", async () => {
    render(<CustomerInformationPage />);

    fireEvent.change(await screen.findByRole("textbox", { name: "Tên của bạn" }), {
      target: { value: "Nguyễn Văn A" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Số điện thoại/i }), {
      target: { value: "12345" },
    });
    const callsBeforeSubmit = vi.mocked(resolveCustomerSalesSession).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }));

    expect(
      screen.getByText("Nhập số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Số điện thoại/i })).toHaveFocus();
    expect(resolveCustomerSalesSession).toHaveBeenCalledTimes(callsBeforeSubmit);
  });

  it("continues to the menu when required information is present", async () => {
    render(<CustomerInformationPage />);

    fireEvent.change(await screen.findByRole("textbox", { name: "Tên của bạn" }), {
      target: { value: "Nguyễn Văn A" },
    });
    vi.mocked(resolveCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "OPEN",
      tableCode: 5,
    });
    fireEvent.click(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/menu"));
    expect(loadCustomerNotifications).toHaveBeenCalledTimes(1);
  });

  it("redirects a payment-pending session to payment", async () => {
    vi.mocked(resolveCustomerSalesSession).mockResolvedValue({
      customerInformationRequired: false,
      sessionStatus: "PAYMENT_PENDING",
      tableCode: 5,
    });

    render(<CustomerInformationPage />);

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/payment"));
    expect(loadCustomerNotifications).toHaveBeenCalledTimes(1);
  });

  it("shows a retry action when QR resolution fails", async () => {
    vi.mocked(resolveCustomerSalesSession).mockRejectedValue(new Error("QR không hợp lệ"));

    render(<CustomerInformationPage />);

    expect(await screen.findByText("QR không hợp lệ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
  });
});
