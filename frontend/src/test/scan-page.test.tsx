import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ScanTableQrPage from "../app/(customer)/scan/page";
import { ToastProvider } from "../components/ui/toast-provider";
import {
  resolveCustomerSalesSession,
  resolveCustomerSalesSessionByTable,
} from "../lib/customer/sales-session";
import { loadPublicStores } from "../lib/api/store/public-store.api";

const replace = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("../lib/customer/sales-session", () => ({
  resolveCustomerSalesSession: vi.fn(),
  resolveCustomerSalesSessionByTable: vi.fn(),
}));
vi.mock("../lib/api/store/public-store.api", () => ({
  loadPublicStores: vi.fn(),
  rememberPublicStoreId: vi.fn(),
}));

describe("ScanTableQrPage", () => {
  beforeEach(() => {
    replace.mockClear();
    vi.mocked(resolveCustomerSalesSession).mockReset();
    vi.mocked(resolveCustomerSalesSessionByTable).mockReset();
    searchParams.delete("storeId");
    window.sessionStorage.clear();
    vi.mocked(loadPublicStores).mockResolvedValue([
      {
        id: 1,
        branchName: "Cơ sở Bến Thành",
        address: "1 Đường A",
        phone: "0900000000",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
    ]);
  });

  it("uses the branch selected on the start page", async () => {
    searchParams.set("storeId", "2");
    vi.mocked(loadPublicStores).mockResolvedValue([
      {
        id: 1,
        branchName: "Cơ sở A",
        address: "Đường A",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
      {
        id: 2,
        branchName: "Cơ sở B",
        address: "Đường B",
        latitude: null,
        longitude: null,
        status: "ACTIVE",
      },
    ]);
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );
    expect(await screen.findByRole("button", { name: "Cơ sở B — Đường B" })).toBeInTheDocument();
  });

  it("displays the selected branch name and its dropdown option", async () => {
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );
    const selector = await screen.findByRole("button", { name: "Cơ sở Bến Thành — 1 Đường A" });
    expect(
      screen.getByRole("link", { name: "Không tìm thấy mã bàn? Bấm gọi phục vụ ngay" }),
    ).toHaveAttribute("href", "tel:0900000000");
    fireEvent.click(selector);
    expect(screen.getByRole("option")).toHaveTextContent("Cơ sở Bến Thành");
  });

  it("keeps manual entry available when the QR token is invalid", async () => {
    vi.mocked(resolveCustomerSalesSession).mockRejectedValue(new Error("QR không hợp lệ"));
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );

    expect(screen.getByRole("link", { name: "Quay lại chọn loại đơn" })).toHaveAttribute(
      "href",
      "/start?returnTo=%2Fmenu",
    );

    const input = screen.getByRole("textbox", { name: /Nhập mã QR của bàn/ });
    fireEvent.change(input, { target: { value: "Q00000000" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận vào bàn gọi món" }));

    expect(await screen.findByText("QR không hợp lệ")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(input).toHaveValue("Q00000000");
    expect(input).toHaveFocus();
  });

  it("asks for customer information without asking for the order type again after entering a QR", async () => {
    vi.mocked(resolveCustomerSalesSession)
      .mockResolvedValueOnce({
        customerInformationRequired: true,
        joinSessionRequired: false,
        joinableSessions: [],
        sessionStatus: "CUSTOMER_INFORMATION_REQUIRED",
        tableCode: 1,
      })
      .mockResolvedValueOnce({
        customerInformationRequired: false,
        joinSessionRequired: false,
        joinableSessions: [],
        sessionStatus: "OPEN",
        tableCode: 1,
      });
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );
    await screen.findByRole("button", { name: "Cơ sở Bến Thành — 1 Đường A" });
    fireEvent.change(screen.getByRole("textbox", { name: /Nhập mã QR của bàn/ }), {
      target: { value: "Q00000001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận vào bàn gọi món" }));

    fireEvent.change(await screen.findByLabelText(/Tên của bạn/), { target: { value: "Khách" } });
    expect(screen.queryByRole("button", { name: "Mang về" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mở phiên và xem thực đơn" }));
    await vi.waitFor(() =>
      expect(resolveCustomerSalesSession).toHaveBeenLastCalledWith("Q00000001", {
        storeId: 1,
        customerName: "Khách",
        customerPhone: null,
        sessionType: "DINE_IN",
      }),
    );
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/menu"));
  });

  it("joins an existing table session after entering a QR without returning to order type", async () => {
    vi.mocked(resolveCustomerSalesSession)
      .mockResolvedValueOnce({
        customerInformationRequired: false,
        joinSessionRequired: true,
        joinableSessions: [{ sessionId: "session-1", customerName: "An", sessionStatus: "OPEN" }],
        sessionStatus: "JOIN_SESSION_REQUIRED",
        tableCode: 1,
      })
      .mockResolvedValueOnce({
        customerInformationRequired: false,
        joinSessionRequired: false,
        joinableSessions: [],
        sessionStatus: "OPEN",
        tableCode: 1,
      });
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );
    await screen.findByRole("button", { name: "Cơ sở Bến Thành — 1 Đường A" });
    fireEvent.change(screen.getByRole("textbox", { name: /Nhập mã QR của bàn/ }), {
      target: { value: "Q00000001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận vào bàn gọi món" }));
    fireEvent.click(await screen.findByRole("button", { name: /An.*Chung bàn/ }));
    await vi.waitFor(() =>
      expect(resolveCustomerSalesSession).toHaveBeenLastCalledWith("Q00000001", {
        storeId: 1,
        joinSessionId: "session-1",
        sessionType: "DINE_IN",
      }),
    );
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/menu"));
  });

  it("normalizes a manual table number before resolving it", async () => {
    vi.mocked(resolveCustomerSalesSessionByTable).mockResolvedValue({
      customerInformationRequired: false,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "OPEN",
      tableCode: 1,
    });
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );

    fireEvent.change(await screen.findByRole("textbox", { name: "Số bàn" }), {
      target: { value: "01abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận vào bàn gọi món" }));

    await vi.waitFor(() =>
      expect(resolveCustomerSalesSessionByTable).toHaveBeenCalledWith({ storeId: 1, tableCode: 1 }),
    );
  });

  it("switches between scanning and manual entry", () => {
    render(
      <ToastProvider>
        <ScanTableQrPage />
      </ToastProvider>,
    );
    const scan = screen.getByRole("button", { name: "Quét mã QR bàn" });
    const manual = screen.getByRole("button", { name: "Nhập số bàn thủ công" });
    expect(scan).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(manual);
    expect(manual).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("textbox", { name: "Số bàn" })).toBeInTheDocument();
    fireEvent.click(scan);
    expect(scan).toHaveAttribute("aria-pressed", "true");
  });
});
